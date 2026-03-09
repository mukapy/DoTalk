import os

DEBUG = False

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

# In production, set CORS_ALLOWED_ORIGINS via environment variable (comma-separated)
_cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
if _cors_origins:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in _cors_origins.split(',')]
