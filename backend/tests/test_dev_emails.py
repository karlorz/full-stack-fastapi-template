from typing import Literal

import pytest
from logfire.testing import CaptureLogfire

from app.core.config import CommonSettings, MainSettings
from app.utils import send_email

settings = MainSettings.get_settings()


@pytest.mark.parametrize("environment", ["local", "staging"])
def test_send_email_not_allowed(
    capfire: CaptureLogfire,
    environment: Literal["local", "staging"],
    common_settings: CommonSettings,
) -> None:
    common_settings.ENVIRONMENT = environment
    settings.SMTP_HOST = "externalemailhost"
    send_email(email_to="notallowed@example.com", subject="Test", html_content="Test")

    assert capfire.exporter.exported_spans_as_dict() == [
        {
            "attributes": {
                "code.filepath": "utils.py",
                "code.function": "send_email",
                "code.lineno": 123,
                "email_to": "notallowed@example.com",
                "environment": environment,
                "logfire.json_schema": '{"type":"object","properties":{"environment":{},"smtp_host":{},"email_to":{}}}',
                "logfire.level_num": 13,
                "logfire.msg": f"In environment {environment} with SMTP_HOST "
                "externalemailhost recipient email is not "
                "allowed: notallowed@example.com",
                "logfire.msg_template": "In environment {environment} with "
                "SMTP_HOST {smtp_host} recipient "
                "email is not allowed: {email_to}",
                "logfire.span_type": "log",
                "smtp_host": "externalemailhost",
            },
            "context": {"is_remote": False, "span_id": 1, "trace_id": 1},
            "end_time": 1000000000,
            "name": "In environment {environment} with SMTP_HOST {smtp_host} recipient "
            "email is not allowed: {email_to}",
            "parent": None,
            "start_time": 1000000000,
        },
    ]


def test_send_email_external_with_mailcatcher_local(
    common_settings: CommonSettings,
) -> None:
    common_settings.ENVIRONMENT = "local"
    settings.SMTP_HOST = "mailcatcher"
    # This should not raise
    send_email(email_to="notallowed@example.com", subject="Test", html_content="Test")


def test_send_email_external_with_mailcatcher_staging(
    common_settings: CommonSettings,
) -> None:
    common_settings.ENVIRONMENT = "staging"
    settings.SMTP_HOST = "mailcatcher"
    # This should not raise
    send_email(email_to="notallowed@example.com", subject="Test", html_content="Test")


def test_send_email_external_allowed_prod(common_settings: CommonSettings) -> None:
    common_settings.ENVIRONMENT = "production"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This next line shouldn't raise
    send_email(email_to="notallowed@example.com", subject="Test", html_content="Test")


def test_send_email_allowed_domain_local(common_settings: CommonSettings) -> None:
    common_settings.ENVIRONMENT = "local"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="anyone@fastapilabs.com", subject="Test", html_content="Test")


def test_send_email_allowed_domain_staging(common_settings: CommonSettings) -> None:
    common_settings.ENVIRONMENT = "staging"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="anyone@fastapilabs.com", subject="Test", html_content="Test")


def test_send_email_allowed_domain_prod(common_settings: CommonSettings) -> None:
    common_settings.ENVIRONMENT = "production"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="anyone@fastapilabs.com", subject="Test", html_content="Test")


def test_send_email_allowed_email_local(common_settings: CommonSettings) -> None:
    common_settings.ENVIRONMENT = "local"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="tiangolo@gmail.com", subject="Test", html_content="Test")


def test_send_email_allowed_email_staging(common_settings: CommonSettings) -> None:
    common_settings.ENVIRONMENT = "staging"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="tiangolo@gmail.com", subject="Test", html_content="Test")


def test_send_email_allowed_email_prod(common_settings: CommonSettings) -> None:
    common_settings.ENVIRONMENT = "production"
    assert settings.SMTP_HOST in {
        "mailcatcher",
        "localhost",
    }, "do not send actual emails in tests"
    # This should not raise
    send_email(email_to="tiangolo@gmail.com", subject="Test", html_content="Test")
