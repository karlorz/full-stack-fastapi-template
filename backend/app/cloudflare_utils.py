from functools import lru_cache

from cloudflare import Cloudflare
from cloudflare.types.custom_hostnames import (
    CustomHostnameCreateResponse,
    CustomHostnameEditResponse,
    CustomHostnameGetResponse,
)

from app.core.config import CloudflareSettings


@lru_cache
def get_cloudflare_client() -> Cloudflare:
    cloudflare_settings = CloudflareSettings.get_settings()
    return Cloudflare(
        api_token=cloudflare_settings.CLOUDFLARE_API_TOKEN_SSL,
    )


def create_custom_domain(*, domain: str) -> CustomHostnameCreateResponse:
    cloudflare_settings = CloudflareSettings.get_settings()
    client = get_cloudflare_client()
    hostname = client.custom_hostnames.create(
        zone_id=cloudflare_settings.CLOUDFLARE_ZONE_ID,
        hostname=domain,
        ssl={"method": "http", "type": "dv"},
    )
    assert hostname
    return hostname


def trigger_custom_domain_update(*, domain_id: str) -> CustomHostnameEditResponse:
    # If the CNAME was not set up before creating the domain, it needs a trigger
    # to validate it with a PATCH request
    # Ref: https://developers.cloudflare.com/api/operations/custom-hostname-for-a-zone-create-custom-hostname
    cloudflare_settings = CloudflareSettings.get_settings()
    client = get_cloudflare_client()
    hostname = client.custom_hostnames.edit(
        custom_hostname_id=domain_id,
        zone_id=cloudflare_settings.CLOUDFLARE_ZONE_ID,
        ssl={"method": "http", "type": "dv"},
    )
    assert hostname
    return hostname


def get_custom_domain(*, domain_id: str) -> CustomHostnameGetResponse:
    cloudflare_settings = CloudflareSettings.get_settings()
    client = get_cloudflare_client()
    hostname = client.custom_hostnames.get(
        custom_hostname_id=domain_id,
        zone_id=cloudflare_settings.CLOUDFLARE_ZONE_ID,
    )
    assert hostname
    return hostname
