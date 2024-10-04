import logging

from github import Github
from pydantic import SecretStr
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_ignore_empty": True}
    github_repository: str
    github_token: SecretStr
    deploy_url: str | None = None
    commit_sha: str
    pr_number: int | None = None
    environment: str = "local"


def main():
    logging.basicConfig(level=logging.INFO)
    settings = Settings()

    logging.info(f"Using config: {settings.model_dump_json()}")
    g = Github(settings.github_token.get_secret_value())
    repo = g.get_repo(settings.github_repository)
    use_pr = repo.get_pull(settings.pr_number) if settings.pr_number else None
    if not use_pr:
        logging.error(f"No PR found for hash: {settings.commit_sha}")
        return
    message = f"🎨 Dashboard UI preview in environment `{settings.environment}` for commit {settings.commit_sha} at: {settings.deploy_url}"

    print(message)
    use_pr.as_issue().create_comment(message)

    logging.info("Finished")


if __name__ == "__main__":
    main()
