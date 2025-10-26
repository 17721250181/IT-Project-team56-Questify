# leaderboard/views.py

from datetime import datetime, timezone, date

from django.apps import apps
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Max, IntegerField, F, Value
from django.db.models.functions import Coalesce
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from attempts.models import Attempt
from .serializers import LeaderboardRowSerializer, MyLeaderboardSerializer


User = get_user_model()

# --- Scoring ---
POINT_PER_ATTEMPT = getattr(settings, "LEADERBOARD_POINTS_PER_ATTEMPT", 1)
BONUS_CORRECT = getattr(settings, "LEADERBOARD_POINTS_BONUS_CORRECT", 9)

POINT_PER_COMMENT = getattr(settings, "LEADERBOARD_POINTS_PER_COMMENT", 0)
POINT_PER_RATING  = getattr(settings, "LEADERBOARD_POINTS_PER_RATING", 0)
POINT_PER_LIKE    = getattr(settings, "LEADERBOARD_POINTS_PER_LIKE", 0)

def _safe_dt(dt):
    """Convert None to a comparable datetime (for sorting purposes)."""
    return dt if dt is not None else datetime.min.replace(tzinfo=timezone.utc)

def _parse_date(s: str | None) -> date | None:
    """Only accept YYYY-MM-DD format (ignore invalid values)."""
    if not s:
        return None
    try:
        return date.fromisoformat(s)
    except Exception:
        return None

def _get_existing_activity_models():
    """
    From the models registered in settings.LEADERBOARD_ACTIVITY_MODELS,
    return only the models that actually 'exist' in the project as [(ModelClass, user_field, label)].
    """
    models_cfg = getattr(settings, "LEADERBOARD_ACTIVITY_MODELS", {}) or {}
    existing = []
    for label, meta in models_cfg.items():
        try:
            model_cls = apps.get_model(label)
        except LookupError:
            continue
        if model_cls is None:
            continue
        user_field = meta.get("user_field", "user")
        existing.append((model_cls, user_field, label))
    return existing

def _count_by_user(model_cls, user_field: str, filters: dict | None = None) -> dict[int, int]:
    """
    Aggregate the count per user from the given model using values(<user_field>)
    and return as a {user_id: count} dictionary.
    """
    qs = model_cls.objects.all()
    if filters:
        qs = qs.filter(**filters)
    rows = qs.values(user_field).annotate(c=Count("id"))
    # When using values(user_field), the user_field value is stored in the <field_name> key.
    return {row[user_field]: row["c"] for row in rows}


# ---------- Pagination ----------
class LeaderboardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 1000


# ---------- Filters ----------
def _filtered_attempts(qs, request):
    """
    쿼리스트링 필터:
      ?week=W1,W2
      ?topic=Physics
      ?from=2025-01-01&to=2025-03-31
    Attempt.question(→ Question)의 week/topic을 가정한다.
    Attempt의 타임스탬프 필드는 'submitted_at'을 사용한다.
    """
    week = request.query_params.get("week")
    topic = request.query_params.get("topic")
    date_from = _parse_date(request.query_params.get("from"))
    date_to = _parse_date(request.query_params.get("to"))

    if week:
        weeks = [w.strip() for w in week.split(",") if w.strip()]
        qs = qs.filter(question__week__in=weeks)
    if topic:
        qs = qs.filter(question__topic__iexact=topic)
    if date_from:
        qs = qs.filter(submitted_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(submitted_at__date__lte=date_to)
    return qs


# ---------- Core Aggregation ----------
def _base_rows(request):
    """
    Aggregate per user:
      attempts: total number of attempts
      correct: number of correct answers
      points: base attempt/correct score + activity weights (comments/ratings/likes)
      last_activity: maximum value of Attempt.submitted_at
    Then sort in Python and assign dense rank.
    """
    # 1) Base aggregation from Attempt
    qs = _filtered_attempts(Attempt.objects.all(), request)

    agg_qs = (
        qs.values("attempter")
          .annotate(
              attempts=Count("id"),
              correct=Count("id", filter=Q(is_correct=True)),
              last_activity=Max("submitted_at"),
          )
          .annotate(
              points=Coalesce(
                  F("attempts") * POINT_PER_ATTEMPT + F("correct") * BONUS_CORRECT,
                  Value(0),
                  output_field=IntegerField(),
              )
          )
    )
    agg = list(agg_qs)  # Evaluate query

    # 2) User display name map (use display_name)
    user_ids_from_attempts = [r["attempter"] for r in agg]
    users = User.objects.filter(id__in=user_ids_from_attempts).select_related('profile')
    user_map = {
        u.id: (u.profile.display_name if hasattr(u, 'profile') and u.profile.display_name else u.username)
        for u in users
    }

    # 3) Build base rows
    rows = [
        {
            "user_id": r["attempter"],
            "display_name": user_map.get(r["attempter"], "Unknown"),
            "attempts": r["attempts"],
            "correct": r["correct"],
            "points": r["points"],
            "last_activity": r["last_activity"],
        }
        for r in agg
    ]
    rows_by_id = {r["user_id"]: r for r in rows}

    # 4) Reflect activity model (comments/ratings/likes, etc.) scores
    #    - Aggregate only existing models from those registered in settings.LEADERBOARD_ACTIVITY_MODELS
    #    - Add count per user * activity weight to points
    activity_models = _get_existing_activity_models()

    for model_cls, user_field, label in activity_models:
        label_lower = label.lower()
        if label_lower.endswith(".comment"):
            pts = POINT_PER_COMMENT
        elif label_lower.endswith(".rating"):
            pts = POINT_PER_RATING
        elif label_lower.endswith(".like"):
            pts = POINT_PER_LIKE
        else:
            pts = 0  # Undefined models get 0 points (can change policy if desired)

        if pts == 0:
            continue

        count_map = _count_by_user(model_cls, user_field)

        # Whether to include users who only have activity but no Attempts in rows:
        # - If included, they will appear in the overall ranking (implemented to include them here).
        extra_user_ids = set(count_map.keys()) - set(rows_by_id.keys())
        if extra_user_ids:
            # Fill in display_name
            missing_users = User.objects.filter(id__in=list(extra_user_ids)).select_related('profile')
            for u in missing_users:
                display_name = u.profile.display_name if hasattr(u, 'profile') and u.profile.display_name else u.username
                rows_by_id[u.id] = {
                    "user_id": u.id,
                    "display_name": display_name,
                    "attempts": 0,
                    "correct": 0,
                    "points": 0,
                    "last_activity": None,
                }

        # Add points
        for uid, cnt in count_map.items():
            r = rows_by_id.get(uid)
            if r:
                r["points"] += cnt * pts

    # 5) Reconstruct dict → list
    rows = list(rows_by_id.values())

    # 6) Sort: points ↓, correct ↓, last_activity ↓, user_id ↑
    rows.sort(
        key=lambda x: (-x["points"], -x["correct"], _safe_dt(x["last_activity"]), x["user_id"])
    )

    # 7) Dense rank
    rank = 0
    prev_key = None
    for r in rows:
        key = (r["points"], r["correct"], r["last_activity"])
        if key != prev_key:
            rank += 1
            prev_key = key
        r["rank"] = rank

    return rows


# ---------- API Views ----------
class LeaderboardView(ListAPIView):
    """
    GET /api/leaderboard/
    GET /api/leaderboard/?week=W1,W2&topic=Physics&from=2025-01-01&to=2025-03-31
    전체(혹은 필터된) 순위를 페이지네이션하여 반환한다.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = LeaderboardPagination
    serializer_class = LeaderboardRowSerializer

    def get_queryset(self):
        # Only exists for DRF generic view interface requirements (actual queryset is not used)
        return User.objects.none()

    def list(self, request, *args, **kwargs):
        rows = _base_rows(request)
        page = self.paginate_queryset(rows)
        ser = self.get_serializer(page, many=True)
        return self.get_paginated_response(ser.data)


class MyLeaderboardView(RetrieveAPIView):
    """
    GET /api/leaderboard/me/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LeaderboardRowSerializer

    def retrieve(self, request, *args, **kwargs):
        rows = _base_rows(request)
        my_id = request.user.id
        idx = next((i for i, r in enumerate(rows) if r["user_id"] == my_id), None)

        if idx is None:
            # User has no activity records, return default values and use display_name
            display_name = (
                request.user.profile.display_name 
                if hasattr(request.user, 'profile') and request.user.profile.display_name 
                else request.user.username
            )
            me = {
                "user_id": my_id,
                "display_name": display_name,
                "attempts": 0,
                "correct": 0,
                "points": 0,
                "last_activity": None,
                "rank": len(rows) + 1,
                "total_users": len(rows),
            }
        else:
            me = rows[idx].copy()
            me["total_users"] = len(rows)

        ser = self.get_serializer(me)
        return Response(ser.data)
