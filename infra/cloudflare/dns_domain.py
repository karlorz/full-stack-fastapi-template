"""Pulumi component for managing DNS domains and records in Cloudflare."""

import pulumi
import pulumi_cloudflare as cloudflare
from typing import List, Dict, Any, Optional


class DNSDomain(pulumi.ComponentResource):
    """
    A Pulumi component that manages all DNS records for a single domain.

    This component creates and manages DNS records as a logical unit,
    making it easy to manage multiple records for a domain together.
    """

    def __init__(
        self,
        name: str,
        zone_id: str,
        records: List[Dict[str, Any]],
        opts: Optional[pulumi.ResourceOptions] = None
    ):
        """
        Create a new DNS domain component.

        Args:
            name: The unique name of this component
            zone_id: The Cloudflare zone ID for this domain
            records: List of DNS records to create
            opts: Optional Pulumi resource options
        """
        super().__init__("cloudflare:dns:Domain", name, None, opts)

        self.zone_id = zone_id
        self.dns_records = []

        # Create each DNS record
        for idx, record_config in enumerate(records):
            record_name = record_config.get("name", "@")
            record_type = record_config["type"]
            record_value = record_config["value"]

            # Generate a clean resource name
            resource_name = self._generate_resource_name(record_name, record_type, idx)

            # Create the DNS record
            dns_record = cloudflare.DnsRecord(
                resource_name,
                zone_id=zone_id,
                name=record_name,
                type=record_type,
                content=record_value,
                ttl=record_config.get("ttl", 1 if record_config.get("proxied", False) else 300),
                proxied=record_config.get("proxied", False),
                priority=record_config.get("priority"),  # For MX records
                opts=pulumi.ResourceOptions(parent=self)
            )

            self.dns_records.append(dns_record)

        # Register outputs
        self.register_outputs({
            "zone_id": zone_id,
            "record_count": len(self.dns_records),
            "record_names": [r.name for r in self.dns_records]
        })

    def _generate_resource_name(self, record_name: str, record_type: str, index: int) -> str:
        """Generate a valid Pulumi resource name from DNS record details."""
        # Clean up special characters
        clean_name = (
            record_name
            .replace("*", "wildcard")
            .replace(".", "-")
            .replace("@", "root")
        )

        return f"{self._name}-{clean_name}-{record_type.lower()}-{index}"
