# Environment Variables Configuration Guide

## Quick Setup

1. **Copy template**: `cp .env.example .env`
2. **Edit `.env`** with your actual values
3. **Never commit** `.env` to Git (already in `.gitignore`)

## Required Configuration

```env
SECRET_KEY=your-secret-key-here
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
```

## Gmail SMTP Setup

1. Enable 2-factor authentication at [Google Security](https://myaccount.google.com/security)
2. Generate App Password: Security → App passwords → Mail → Other
3. Copy 16-character password to `EMAIL_HOST_PASSWORD` in `.env`

## Email Configuration

**Development** (prints to console):
```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

**Production** (sends real emails):
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Key Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `dev-secret-key` | Django secret (must change for production) |
| `DEBUG` | `True` | Debug mode |
| `EMAIL_HOST_USER` | - | Email account |
| `EMAIL_HOST_PASSWORD` | - | Gmail app password |
| `DATABASE_URL` | SQLite | PostgreSQL URL (optional) |
| `FRONTEND_ORIGIN` | - | Frontend domain |
| `ADMIN_EMAILS` | - | Admin email list (required in production) |

## Production Deployment

Generate secure key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Example production settings:
```env
SECRET_KEY=generated-key
DEBUG=False
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
ADMIN_EMAILS=admin@example.com
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## Verification

```bash
python manage.py check
```

## Troubleshooting

**Email not sending:**
- Use Gmail app password, not account password
- Enable 2-factor authentication first
- Keep spaces in `EMAIL_HOST_PASSWORD`

**Config not loading:**
- Ensure `.env` is in `backend/` directory
- Restart Django server
- Test: `python manage.py shell` → `from django.conf import settings; print(settings.EMAIL_HOST_USER)`
