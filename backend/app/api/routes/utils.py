from fastapi import APIRouter, Depends
from pydantic import BaseModel
from pydantic.networks import EmailStr

from app.api.deps import RedisDep, get_first_superuser
from app.models import Message
from app.utils import generate_test_email, send_email

router = APIRouter()


@router.post(
    "/test-email/",
    dependencies=[Depends(get_first_superuser)],
    status_code=201,
)
def test_email(email_to: EmailStr) -> Message:
    """
    Test emails.
    """
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


class HealthCheckResponse(BaseModel):
    redis: bool


@router.get("/health-check/")
async def health_check(redis: RedisDep) -> HealthCheckResponse:
    """
    Health check.
    """
    is_redis_available: bool = False

    try:
        is_redis_available = redis.ping()
    except Exception:
        pass

    return HealthCheckResponse(redis=is_redis_available)
