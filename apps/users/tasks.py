import random

from celery import shared_task
from django.core.cache import cache

from shared.utils import logger


def register_key(email):
    return f"register:{email}"


@shared_task
def send_sms_code(email, msg):
    logger.info(f"[DoTalk] Email to {email}: {msg}")


@shared_task
def register_sms(email: str):
    key = register_key(email)
    existing = cache.get(key)
    if existing:
        # Code already exists and hasn't expired, re-send it
        code = existing
    else:
        code = random.randint(100000, 999999)
        cache.set(key, code, 300)  # 5 minutes TTL

    text = f"Verification Code: {code}"
    send_sms_code.delay(email, text)
