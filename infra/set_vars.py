# /// script
# dependencies = [
#    "pygithub",
#    "pydantic<2.10.0",
#    "pydantic-settings",
#    "httpx<0.28.0",
#    "cloudflare",
# ]
# ///

import logging
from typing import Literal

from cloudflare import Cloudflare
from github import Github
from pydantic import SecretStr
from pydantic_settings import BaseSettings


class CommonSettings(BaseSettings):
    environment: Literal["development", "staging", "production"]


class CloudflareSettings(BaseSettings):
    cloudflare_token: SecretStr
    load_balancer_dns: str


class GitHubSettings(BaseSettings):
    github_repository: str = "fastapilabs/cloud"

    github_token: SecretStr
    kubeconfig_data: str
    deployments_bucket_name: str
    ecr_registry_url: str
    redis_server: str
    aws_sqs_builder_queue_name: str


def main():
    logging.basicConfig(level=logging.INFO)
    common_settings = CommonSettings()
    github_settings = GitHubSettings()
    cloudflare_settings = CloudflareSettings()

    g = Github(github_settings.github_token.get_secret_value())
    repo = g.get_repo(github_settings.github_repository)

    logging.info("Getting GitHub environment")
    environment = repo.get_environment(common_settings.environment)
    logging.info("Updating KUBECONFIG_DATA")
    environment.create_secret("KUBECONFIG_DATA", github_settings.kubeconfig_data)
    logging.info("Updating DEPLOYMENTS_BUCKET_NAME")
    environment.delete_variable("DEPLOYMENTS_BUCKET_NAME")
    environment.create_variable(
        "DEPLOYMENTS_BUCKET_NAME", github_settings.deployments_bucket_name
    )
    logging.info("Updating ECR_REGISTRY_URL")
    environment.delete_variable("ECR_REGISTRY_URL")
    environment.create_variable("ECR_REGISTRY_URL", github_settings.ecr_registry_url)
    logging.info("Updating REDIS_SERVER")
    environment.delete_variable("REDIS_SERVER")
    environment.create_variable("REDIS_SERVER", github_settings.redis_server)
    logging.info("Updating AWS_SQS_BUILDER_QUEUE_NAME")
    environment.delete_variable("AWS_SQS_BUILDER_QUEUE_NAME")
    environment.create_variable(
        "AWS_SQS_BUILDER_QUEUE_NAME", github_settings.aws_sqs_builder_queue_name
    )

    cloudflare = Cloudflare(
        api_token=cloudflare_settings.cloudflare_token.get_secret_value()
    )
    match common_settings.environment:
        case "development":
            cluster_domain = "fastapicloud.space"
        case "staging":
            cluster_domain = "fastapicloud.club"
        case "production":
            cluster_domain = "fastapicloud.dev"
    logging.info("Getting Cloudflare zone")
    cluster_zone = cloudflare.zones.list(name=cluster_domain).result[0]
    logging.info("Getting cluster DNS record")
    cluster_record = cloudflare.dns.records.list(
        zone_id=cluster_zone.id, name=f"cluster-fastapicloud.{cluster_domain}"
    ).result[0]
    logging.info("Getting star cluster DNS record")
    star_cluster_record = cloudflare.dns.records.list(
        zone_id=cluster_zone.id, name=f"*.{cluster_domain}"
    ).result[0]
    logging.info("Updating DNS record for cluster domain")
    cloudflare.dns.records.update(
        dns_record_id=cluster_record.id,
        zone_id=cluster_zone.id,
        content=cloudflare_settings.load_balancer_dns,
        name=f"cluster-fastapicloud.{cluster_domain}",
        type="CNAME",
        proxied=True,
    )
    logging.info("Updating DNS record for star domain")
    cloudflare.dns.records.update(
        dns_record_id=star_cluster_record.id,
        zone_id=cluster_zone.id,
        content=cloudflare_settings.load_balancer_dns,
        name=f"*.{cluster_domain}",
        type="CNAME",
        proxied=True,
    )

    logging.info("Finished")


if __name__ == "__main__":
    main()
