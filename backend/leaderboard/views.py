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

# --- Scoring (settings에서 가져오되 기본값을 둔다) ---
POINT_PER_ATTEMPT = getattr(settings, "LEADERBOARD_POINTS_PER_ATTEMPT", 1)
BONUS_CORRECT = getattr(settings, "LEADERBOARD_POINTS_BONUS_CORRECT", 9)

POINT_PER_COMMENT = getattr(settings, "LEADERBOARD_POINTS_PER_COMMENT", 0)
POINT_PER_RATING  = getattr(settings, "LEADERBOARD_POINTS_PER_RATING", 0)
POINT_PER_LIKE    = getattr(settings, "LEADERBOARD_POINTS_PER_LIKE", 0)


# ---------- 유틸 ----------
def _safe_dt(dt):
    """None을 비교 가능한 datetime으로 변환(정렬 위해)."""
    return dt if dt is not None else datetime.min.replace(tzinfo=timezone.utc)

def _parse_date(s: str | None) -> date | None:
    """YYYY-MM-DD 형식만 허용(잘못된 값은 무시)."""
    if not s:
        return None
    try:
        return date.fromisoformat(s)
    except Exception:
        return None

def _get_existing_activity_models():
    """
    settings.LEADERBOARD_ACTIVITY_MODELS에 등록된 모델들 중
    실제로 프로젝트에 '존재하는' 모델만 [(ModelClass, user_field, label)]로 반환한다.
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
    주어진 모델에서 사용자별 개수를 values(<user_field>)로 집계해
    {user_id: count} 딕셔너리로 리턴한다.
    """
    qs = model_cls.objects.all()
    if filters:
        qs = qs.filter(**filters)
    rows = qs.values(user_field).annotate(c=Count("id"))
    # values(user_field) 시 user_field 값은 <필드명> 키에 담긴다.
    return {row[user_field]: row["c"] for row in rows}


# ---------- 페이지네이션 ----------
class LeaderboardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 1000


# ---------- 필터 ----------
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


# ---------- 핵심 집계 ----------
def _base_rows(request):
    """
    사용자별 집계:
      attempts: 총 시도 수
      correct : 정답 수
      points  : 기본 시도/정답 점수 + 활동(댓글/평가/좋아요) 가중치
      last_activity: Attempt.submitted_at의 최대값
    그 뒤 파이썬에서 정렬/동순위(dense rank) 부여한다.
    """
    # 1) Attempt 기반 기본 집계
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
    agg = list(agg_qs)  # 쿼리 평가

    # 2) 사용자 표시명 맵
    user_ids_from_attempts = [r["attempter"] for r in agg]
    user_map = {
        u.id: u.username
        for u in User.objects.filter(id__in=user_ids_from_attempts)
    }

    # 3) 기본 rows 구성
    rows = [
        {
            "user_id": r["attempter"],
            "username": user_map.get(r["attempter"], "Unknown"),
            "attempts": r["attempts"],
            "correct": r["correct"],
            "points": r["points"],
            "last_activity": r["last_activity"],
        }
        for r in agg
    ]
    rows_by_id = {r["user_id"]: r for r in rows}

    # 4) 활동 모델(댓글/평가/좋아요 등) 점수 반영
    #    - settings.LEADERBOARD_ACTIVITY_MODELS에 등록된 모델 중 존재하는 것만 집계
    #    - 사용자별 개수 * 해당 활동 가중치 를 points에 더함
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
            pts = 0  # 정의되지 않은 모델은 0점(원하면 정책 변경 가능)

        if pts == 0:
            continue

        count_map = _count_by_user(model_cls, user_field)

        # 활동만 있고 Attempt가 없는 사용자를 rows에 포함시킬지 여부:
        # - 포함시키면 전체 순위에 보인다(여기서는 포함하도록 구현한다).
        extra_user_ids = set(count_map.keys()) - set(rows_by_id.keys())
        if extra_user_ids:
            # username 채우기
            missing_users = User.objects.filter(id__in=list(extra_user_ids))
            for u in missing_users:
                rows_by_id[u.id] = {
                    "user_id": u.id,
                    "username": u.username,
                    "attempts": 0,
                    "correct": 0,
                    "points": 0,
                    "last_activity": None,
                }

        # 점수 가산
        for uid, cnt in count_map.items():
            r = rows_by_id.get(uid)
            if r:
                r["points"] += cnt * pts

    # 5) dict → list 재구성
    rows = list(rows_by_id.values())

    # 6) 정렬: 점수 ↓, 정답수 ↓, 최근활동 ↓, user_id ↑
    rows.sort(
        key=lambda x: (-x["points"], -x["correct"], _safe_dt(x["last_activity"]), x["user_id"])
    )

    # 7) 동순위(dense rank)
    rank = 0
    prev_key = None
    for r in rows:
        key = (r["points"], r["correct"], r["last_activity"])
        if key != prev_key:
            rank += 1
            prev_key = key
        r["rank"] = rank

    return rows


# ---------- API 뷰 ----------
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
        # DRF 제네릭 뷰 인터페이스 요구사항으로만 존재(실제 쿼리셋은 사용하지 않음)
        return User.objects.none()

    def list(self, request, *args, **kwargs):
        rows = _base_rows(request)
        page = self.paginate_queryset(rows)
        ser = self.get_serializer(page, many=True)
        return self.get_paginated_response(ser.data)


class MyLeaderboardView(RetrieveAPIView):
    """
    GET /api/leaderboard/me/
    나의 순위 + 주변(앞뒤 3명)을 제공한다.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = MyLeaderboardSerializer

    def retrieve(self, request, *args, **kwargs):
        rows = _base_rows(request)
        my_id = request.user.id
        idx = next((i for i, r in enumerate(rows) if r["user_id"] == my_id), None)

        if idx is None:
            # 활동/시도가 전혀 없는 사용자도 '내 순위'를 알 수 있게 한다.
            me = {
                "user_id": my_id,
                "username": request.user.username,
                "attempts": 0,
                "correct": 0,
                "points": 0,
                "last_activity": None,
                "rank": len(rows) + 1,
            }
            around = rows[:5]
        else:
            me = rows[idx]
            lo = max(0, idx - 3)
            hi = min(len(rows), idx + 4)
            around = rows[lo:hi]

        ser = self.get_serializer({"me": me, "around": around})
        return Response(ser.data)
