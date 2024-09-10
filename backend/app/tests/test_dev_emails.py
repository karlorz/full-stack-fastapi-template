import pytest

from app.core.config import settings
from app.utils import send_email


def test_send_email_not_allowed_local() -> None:
    settings.ENVIRONMENT = "local"
    settings.SMTP_HOST = "externalemailhost"
    with pytest.raises(AssertionError) as er:
        send_email(
            email_to="notallowed@example.com", subject="Test", html_content="Test"
        )
    assert "recipient email is not allowed" in str(er.value)


def test_send_email_not_allowed_staging() -> None:
    settings.ENVIRONMENT = "staging"
    settings.SMTP_HOST = "externalemailhost"
    with pytest.raises(AssertionError) as er:
        send_email(
            email_to="notallowed@example.com", subject="Test", html_content="Test"
        )
    assert "recipient email is not allowed" in str(er.value)


def test_send_email_external_with_mailcatcher_local() -> None:
    settings.ENVIRONMENT = "local"
    settings.SMTP_HOST = "mailcatcher"
    # This should not raise
    send_email(email_to="notallowed@example.com", subject="Test", html_content="Test")


def test_send_email_external_with_mailcatcher_staging() -> None:
    settings.ENVIRONMENT = "staging"
    settings.SMTP_HOST = "mailcatcher"
    # This should not raise
    send_email(email_to="notallowed@example.com", subject="Test", html_content="Test")


def test_send_email_external_allowed_prod() -> None:
    settings.ENVIRONMENT = "production"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This next line shouldn't raise
    send_email(email_to="notallowed@example.com", subject="Test", html_content="Test")


def test_send_email_allowed_domain_local() -> None:
    settings.ENVIRONMENT = "local"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="anyone@fastapilabs.com", subject="Test", html_content="Test")


def test_send_email_allowed_domain_staging() -> None:
    settings.ENVIRONMENT = "staging"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="anyone@fastapilabs.com", subject="Test", html_content="Test")


def test_send_email_allowed_domain_prod() -> None:
    settings.ENVIRONMENT = "production"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="anyone@fastapilabs.com", subject="Test", html_content="Test")


def test_send_email_allowed_email_local() -> None:
    settings.ENVIRONMENT = "local"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="tiangolo@gmail.com", subject="Test", html_content="Test")


def test_send_email_allowed_email_staging() -> None:
    settings.ENVIRONMENT = "staging"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="tiangolo@gmail.com", subject="Test", html_content="Test")


def test_send_email_allowed_email_prod() -> None:
    settings.ENVIRONMENT = "production"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="tiangolo@gmail.com", subject="Test", html_content="Test")
