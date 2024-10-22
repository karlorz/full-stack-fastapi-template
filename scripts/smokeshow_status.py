import logging

from github import Github
from pydantic import SecretStr
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_ignore_empty": True}
    github_repository: str
    github_token: SecretStr
    commit_sha: str


def main():
    logging.basicConfig(level=logging.INFO)
    settings = Settings()

    logging.info(f"Using config: {settings.model_dump_json()}")
    g = Github(settings.github_token.get_secret_value())
    repo = g.get_repo(settings.github_repository)
    commit = repo.get_commit(settings.commit_sha)
    commit.create_status(
        state="success",
        description="Smokeshow finished",
        context="smokeshow-status",
    )
    logging.info("Finished")


if __name__ == "__main__":
    main()
