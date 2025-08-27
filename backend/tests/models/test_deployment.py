import uuid

from app.models import App, Deployment


def test_s3_object_key_generation() -> None:
    app = App(
        id=uuid.uuid4(),
        name="Test App",
        slug="test-app",
        team_id=uuid.uuid4(),
    )

    deployment = Deployment(
        slug="test-deployment",
        app_id=app.id,
        app=app,
    )

    assert deployment.s3_object_key == f"{app.id}/{deployment.id}.tar"
