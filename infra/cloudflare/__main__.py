"""Cloudflare DNS management with Pulumi."""

import pulumi
from dns_domain import DNSDomain

# Get configuration
config = pulumi.Config()
stack = pulumi.get_stack()

# Get zone ID from config
madinfra_zone_id = config.require("madinfra_zone_id")

# Domain configuration
domains = {
    "madinfra.wtf": {
        "zone_id": madinfra_zone_id,
        "records": [
            {
                "name": "argocd.dev",
                "type": "CNAME",
                "value": "k8s-argocd-argocdse-766f224e6e-375472841.us-east-1.elb.amazonaws.com",
                "proxied": False,
            },
            {
                "name": "argocd.staging",
                "type": "CNAME",
                "value": "k8s-argocd-argocdse-c4b5cebe6f-926241929.us-east-1.elb.amazonaws.com",
                "proxied": False,
            },
            {
                "name": "argocd.prod",
                "type": "CNAME",
                "value": "k8s-argocd-argocdse-f97df9857d-1251066385.us-east-1.elb.amazonaws.com",
                "proxied": False,
            },
        ]
    }
}

# Create DNS domains
created_domains = {}
for domain_name, domain_config in domains.items():
    dns_domain = DNSDomain(
        name=domain_name.replace(".", "-"),
        zone_id=domain_config["zone_id"],
        records=domain_config["records"]
    )
    created_domains[domain_name] = dns_domain

# Export useful information
pulumi.export("environment", stack)
pulumi.export("managed_domains", list(domains.keys()))
pulumi.export("total_records", sum(len(d["records"]) for d in domains.values()))
