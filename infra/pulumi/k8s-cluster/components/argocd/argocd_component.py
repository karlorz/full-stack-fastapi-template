"""ArgoCD Component - Encapsulates ArgoCD deployment with Google OAuth"""

import json
import pulumi
import pulumi_kubernetes as k8s
import pulumi_kubernetes.helm.v4 as helm
from typing import Optional, Dict, Any, List
from dataclasses import dataclass


@dataclass
class RepositoryConfig:
    """Configuration for a single repository"""
    name: str
    url: str
    type: str = "git"  # git, helm
    ssh_private_key: Optional[pulumi.Output[str]] = None
    username: Optional[str] = None
    password: Optional[pulumi.Output[str]] = None
    enable_oci: bool = False
    insecure: bool = False


@dataclass
class ArgoCDConfig:
    """Configuration for ArgoCD component"""

    domain: str
    namespace: str = "argo-cd"
    enable_oauth: bool = True
    google_client_id: Optional[pulumi.Output[str]] = None
    google_client_secret: Optional[pulumi.Output[str]] = None
    acm_certificate_arn: Optional[pulumi.Output[str]] = None
    admin_emails: list[str] = None
    repositories: List[RepositoryConfig] = None
    # Root application configuration
    # expecting one of: development, staging, production
    environment: str = "development"
    root_app_repo_url: Optional[str] = None  # defaults to first repository URL
    root_app_target_revision: str = "HEAD"
    root_app_project: str = "default"


class ArgoCDComponent(pulumi.ComponentResource):
    """ArgoCD Component with Google OAuth via AWS ALB"""

    def __init__(
        self,
        name: str,
        config: ArgoCDConfig,
        k8s_provider: k8s.Provider,
        tags: Dict[str, str],
        opts: Optional[pulumi.ResourceOptions] = None,
    ):
        super().__init__("fastapicloud:argocd", name, None, opts)

        self.config = config
        self.k8s_provider = k8s_provider
        self.tags = tags

        # Create namespace
        self.namespace = self._ensure_namespace()

        # Set up OAuth secrets if enabled
        if config.enable_oauth:
            self._create_oauth_secret()

        # Create repository secrets
        self.repository_secrets = {}
        if config.repositories:
            self._create_repository_secrets()

        # Deploy ArgoCD
        self._deploy_argocd()

        # Create root application - this is a special application that
        # will deploy all other applications of the environment
        self._create_root_application()
        self._create_multi_chart_apps_applicationset()

        # Register outputs
        self.register_outputs(
            {
                "namespace": self.namespace.metadata.name,
                "service_name": "argocd-server",
                "domain": config.domain,
                "oauth_enabled": config.enable_oauth,
                "repositories_configured": len(config.repositories or []),
            }
        )

    def _ensure_namespace(self) -> k8s.core.v1.Namespace:
        """Create ArgoCD namespace"""
        return k8s.core.v1.Namespace(
            f"{self.config.namespace}-ns",
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name=self.config.namespace,
                labels={
                    **self.tags,
                    "app.kubernetes.io/name": "argocd",
                    "app.kubernetes.io/component": "namespace",
                },
            ),
            opts=pulumi.ResourceOptions(
                parent=self, provider=self.k8s_provider, protect=True
            ),
        )

    def _create_repository_secrets(self):
        """Create secrets for repository authentication"""
        for repo in self.config.repositories:
            if repo.ssh_private_key:
                # Create secret for SSH private key
                secret_name = f"argocd-repo-{repo.name}-ssh"
                self.repository_secrets[repo.name] = k8s.core.v1.Secret(
                    secret_name,
                    metadata=k8s.meta.v1.ObjectMetaArgs(
                        name=secret_name,
                        namespace=self.config.namespace,
                        labels={
                            **self.tags,
                            "app.kubernetes.io/name": "argocd",
                            "app.kubernetes.io/component": "repository-secret",
                            "app.kubernetes.io/part-of": "argocd",
                            "argocd.argoproj.io/secret-type": "repository",
                        },
                    ),
                    string_data={
                        "url": repo.url,  # Required for ArgoCD to match this secret to repositories
                        "sshPrivateKey": repo.ssh_private_key,
                    },
                    opts=pulumi.ResourceOptions(
                        parent=self,
                        provider=self.k8s_provider,
                        depends_on=[self.namespace]
                    ),
                )
            elif repo.password:
                # Create secret for username/password auth
                secret_name = f"argocd-repo-{repo.name}-creds"
                self.repository_secrets[repo.name] = k8s.core.v1.Secret(
                    secret_name,
                    metadata=k8s.meta.v1.ObjectMetaArgs(
                        name=secret_name,
                        namespace=self.config.namespace,
                        labels={
                            **self.tags,
                            "app.kubernetes.io/name": "argocd",
                            "app.kubernetes.io/component": "repository-secret",
                            "app.kubernetes.io/part-of": "argocd",
                            "argocd.argoproj.io/secret-type": "repository",
                        },
                    ),
                    string_data={
                        "url": repo.url,
                        "username": repo.username or "",
                        "password": repo.password,
                    },
                    opts=pulumi.ResourceOptions(
                        parent=self,
                        provider=self.k8s_provider,
                        depends_on=[self.namespace]
                    ),
                )

    def _create_oauth_secret(self):
        """Create OAuth secrets for both ALB and ArgoCD"""
        if not self.config.google_client_id or not self.config.google_client_secret:
            raise ValueError(
                "Google OAuth credentials required when oauth is enabled")

        # Create secret for ArgoCD internal OAuth
        self.oauth_secret = k8s.core.v1.Secret(
            "argocd-oauth-secret",
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name="argocd-oauth-secret",
                namespace=self.config.namespace,
                labels={
                    **self.tags,
                    "app.kubernetes.io/name": "argocd",
                    "app.kubernetes.io/component": "oauth",
                    "app.kubernetes.io/part-of": "argocd",
                },
            ),
            string_data={
                "oidc.google.clientId": self.config.google_client_id,
                "oidc.google.clientSecret": self.config.google_client_secret,
            },
            opts=pulumi.ResourceOptions(
                parent=self, provider=self.k8s_provider, depends_on=[
                    self.namespace]
            ),
        )

        # Create secret for ALB OAuth with correct format
        self.alb_oauth_secret = k8s.core.v1.Secret(
            "argocd-alb-oauth-secret",
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name="argocd-alb-oauth-secret",
                namespace=self.config.namespace,
                labels={
                    **self.tags,
                    "app.kubernetes.io/name": "argocd",
                    "app.kubernetes.io/component": "alb-oauth",
                },
            ),
            string_data={
                "clientID": self.config.google_client_id,
                "clientSecret": self.config.google_client_secret,
            },
            opts=pulumi.ResourceOptions(
                parent=self, provider=self.k8s_provider, depends_on=[
                    self.namespace]
            ),
        )

        # Create Role for ALB controller to read the OAuth secret
        self.alb_secret_reader_role = k8s.rbac.v1.Role(
            "alb-oauth-secret-reader",
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name="alb-oauth-secret-reader",
                namespace=self.config.namespace,
                labels={
                    **self.tags,
                    "app.kubernetes.io/name": "argocd",
                    "app.kubernetes.io/component": "alb-rbac",
                },
            ),
            rules=[
                k8s.rbac.v1.PolicyRuleArgs(
                    api_groups=[""],
                    resources=["secrets"],
                    verbs=["get", "list", "watch"],
                )
            ],
            opts=pulumi.ResourceOptions(
                parent=self, provider=self.k8s_provider, depends_on=[
                    self.namespace]
            ),
        )

        # Create RoleBinding to allow ALB controller to read the secret
        self.alb_secret_reader_binding = k8s.rbac.v1.RoleBinding(
            "alb-oauth-secret-reader-binding",
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name="alb-oauth-secret-reader-binding",
                namespace=self.config.namespace,
                labels={
                    **self.tags,
                    "app.kubernetes.io/name": "argocd",
                    "app.kubernetes.io/component": "alb-rbac",
                },
            ),
            role_ref=k8s.rbac.v1.RoleRefArgs(
                api_group="rbac.authorization.k8s.io",
                kind="Role",
                name="alb-oauth-secret-reader",
            ),
            subjects=[
                k8s.rbac.v1.SubjectArgs(
                    kind="ServiceAccount",
                    name="aws-load-balancer-controller",
                    namespace="kube-system",
                )
            ],
            opts=pulumi.ResourceOptions(
                parent=self,
                provider=self.k8s_provider,
                depends_on=[self.alb_secret_reader_role],
            ),
        )

    def _deploy_argocd(self):
        """Deploy ArgoCD using Helm"""
        # Build Helm values
        helm_values = self._build_helm_values()

        # Create Redis secret that ArgoCD expects (Pulumi does not run hook to create it)
        self.redis_secret = k8s.core.v1.Secret(
            "argocd-redis",
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name="argocd-redis",
                namespace=self.config.namespace,
                labels={
                    "app.kubernetes.io/name": "argocd-redis",
                    "app.kubernetes.io/component": "redis",
                    "app.kubernetes.io/part-of": "argocd",
                },
            ),
            string_data={
                "auth": pulumi.Output.secret("argocd-redis-password"),
            },
            opts=pulumi.ResourceOptions(
                parent=self, provider=self.k8s_provider, depends_on=[
                    self.namespace]
            ),
        )

        # Deploy ArgoCD Helm chart
        depends_on = [self.namespace, self.redis_secret]
        if self.repository_secrets:
            depends_on.extend(list(self.repository_secrets.values()))

        self.helm_chart = helm.Chart(
            "argocd",
            helm.ChartArgs(
                chart="../../helm/charts/argo-cd/argo-cd",
                dependency_update=True,
                namespace=self.config.namespace,
                values=helm_values,
                skip_crds=False,
            ),
            opts=pulumi.ResourceOptions(
                parent=self,
                provider=self.k8s_provider,
                depends_on=depends_on,
            ),
        )

    def _build_helm_values(self) -> Dict[str, Any]:
        """Build Helm values for ArgoCD deployment"""
        # Build the inner ArgoCD chart values
        argocd_values = {
            "global": {
                "domain": self.config.domain,
            },
            "configs": {
                "params": {
                    "server.insecure": True,  # Required for ALB TLS termination
                },
            },
            "server": {
                "service": {
                    "type": "ClusterIP",
                    "servicePortHttp": 80,
                    "servicePortHttps": 443,
                }
            },
        }

        # Add OAuth configuration if enabled
        if self.config.enable_oauth:
            # Configure ArgoCD OIDC for second layer authentication
            argocd_values["configs"]["cm"] = {
                "url": self.external_url,
                "oidc.config": """name: Google
issuer: https://accounts.google.com
clientId: $argocd-oauth-secret:oidc.google.clientId
clientSecret: $argocd-oauth-secret:oidc.google.clientSecret
requestedScopes: ["openid", "profile", "email"]
requestedIDTokenClaims: {"groups": {"essential": true}}""",
            }

            # Add RBAC configuration
            admin_emails = self.config.admin_emails or []

            # Build policy CSV with deny-all and admin roles
            policy_lines = [
                # Deny all access by default
                "p, role:deny-all, *, *, *, deny",
                # Admin role gets full access
                "p, role:admin, *, *, */*, allow",
            ]

            # Add admin email mappings
            for email in admin_emails:
                policy_lines.append(f"g, {email}, role:admin")

            policy_csv = "\n".join(policy_lines)

            argocd_values["configs"]["rbac"] = {
                "policy.default": "role:deny-all",
                "policy.csv": policy_csv,
                "scopes": "[email, groups]",
            }

        # Build ingress configuration separately to handle Pulumi Outputs
        def build_ingress_config(cert_arn):
            ingress_config = {
                "enabled": True,
                "ingressClassName": "alb",
                "annotations": {
                    "alb.ingress.kubernetes.io/scheme": "internet-facing",
                    "alb.ingress.kubernetes.io/target-type": "ip",
                    "alb.ingress.kubernetes.io/healthcheck-path": "/healthz",
                    "alb.ingress.kubernetes.io/listen-ports": '[{"HTTP":80}, {"HTTPS":443}]',
                    "alb.ingress.kubernetes.io/ssl-redirect": "443",
                    "alb.ingress.kubernetes.io/tags": "Application=ArgoCD",
                },
            }

            # Only add certificate ARN if provided
            if cert_arn:
                ingress_config["annotations"][
                    "alb.ingress.kubernetes.io/certificate-arn"
                ] = cert_arn

            # Add OAuth annotations if enabled
            if self.config.enable_oauth:
                oauth_config = {
                    "issuer": "https://accounts.google.com",
                    "authorizationEndpoint": "https://accounts.google.com/o/oauth2/v2/auth",
                    "tokenEndpoint": "https://oauth2.googleapis.com/token",
                    "userInfoEndpoint": "https://openidconnect.googleapis.com/v1/userinfo",
                    "secretName": "argocd-alb-oauth-secret",
                }
                ingress_config["annotations"].update(
                    {
                        "alb.ingress.kubernetes.io/auth-type": "oidc",
                        "alb.ingress.kubernetes.io/auth-idp-oidc": json.dumps(
                            oauth_config
                        ),
                        "alb.ingress.kubernetes.io/auth-on-unauthenticated-request": "authenticate",
                        "alb.ingress.kubernetes.io/auth-session-cookie": "AWSELBAuthSessionCookie",
                        "alb.ingress.kubernetes.io/auth-session-timeout": "86400",
                    }
                )

            ingress_config["hosts"] = [self.config.domain]
            ingress_config["paths"] = ["/"]
            ingress_config["tls"] = [{"hosts": [self.config.domain]}]

            return ingress_config

        # Handle Pulumi Outputs properly
        if self.config.acm_certificate_arn:
            # Certificate ARN is a Pulumi Output
            values = self.config.acm_certificate_arn.apply(
                lambda cert_arn: {
                    "argo-cd": {
                        **argocd_values,
                        "server": {
                            **argocd_values["server"],
                            "ingress": build_ingress_config(cert_arn),
                        },
                    }
                }
            )
        else:
            # No certificate ARN (during initial bootstrap)
            values = {
                "argo-cd": {
                    **argocd_values,
                    "server": {
                        **argocd_values["server"],
                        "ingress": build_ingress_config(None),
                    },
                }
            }

        return values

    def _create_root_application(self):
        """Create root ArgoCD Application for app-of-apps pattern"""
        # Determine repository URL
        repo_url = self.config.root_app_repo_url
        if not repo_url and self.config.repositories:
            repo_url = self.config.repositories[0].url

        if not repo_url:
            raise ValueError(
                "No repository URL available for root application. Either provide root_app_repo_url or configure at least one repository.")

        # Create the root ArgoCD Application
        self.root_application = k8s.apiextensions.CustomResource(
            "argocd-root-application",
            api_version="argoproj.io/v1alpha1",
            kind="Application",
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name=f"root-{self.config.environment}",
                namespace=self.config.namespace,
                labels={
                    **self.tags,
                    "app.kubernetes.io/name": "argocd-root-app",
                    "app.kubernetes.io/component": "root-application",
                    "app.kubernetes.io/part-of": "argocd",
                },
            ),
            spec={
                "project": self.config.root_app_project,
                "source": {
                    "repoURL": repo_url,
                    "targetRevision": self.config.root_app_target_revision,
                    "path": f"infra/argocd/{self.config.environment}",
                    "directory": {
                        "include": "*.yaml",
                        "exclude": "root.yaml",  # Exclude any existing root.yaml files
                    },
                },
                "destination": {
                    "server": "https://kubernetes.default.svc",
                    "namespace": "argo-cd",  # Deploy other apps to argo-cd namespace by default
                },
                # temporarily disabled during heavy development
                # "syncPolicy": {
                #     "automated": {
                #         "prune": False if self.config.environment == "production" else True,
                #         "selfHeal": True,
                #     },
                # },
            },
            opts=pulumi.ResourceOptions(
                parent=self,
                provider=self.k8s_provider,
                depends_on=[self.helm_chart],  # Wait for ArgoCD to be deployed
            ),
        )

    def _create_multi_chart_apps_applicationset(self):
        """
        Create a multi-chart application for a given environment.
        This will create an ApplicationSet that will deploy all the charts in the given environment.
        """
        # Determine repository URL
        repo_url = self.config.root_app_repo_url
        if not repo_url and self.config.repositories:
            repo_url = self.config.repositories[0].url

        if not repo_url:
            raise ValueError(
                "No repository URL available for root application. Either provide root_app_repo_url or configure at least one repository.")

        # Create the root ArgoCD Application
        self.multi_chart_apps_application_set = k8s.apiextensions.CustomResource(
            "multi-chart-apps-application-set",
            api_version="argoproj.io/v1alpha1",
            kind="ApplicationSet",
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name=f"multi-chart-apps-{self.config.environment}",
                namespace=self.config.namespace,
                labels={
                    **self.tags,
                    "app.kubernetes.io/name": "argocd-multi-chart-apps",
                    "app.kubernetes.io/component": "multi-chart-apps",
                    "app.kubernetes.io/part-of": "argocd",
                },
            ),
            spec={
                "generators": [
                    {
                        "git": {
                            "repoURL": repo_url,
                            "revision": self.config.root_app_target_revision,
                            "directories": [
                                # Include all charts
                                {"path": "infra/helm/charts/**/**"},
                            ],
                        },
                        "selector": {
                            "matchExpressions": [
                                {
                                    "key": "path.basename",
                                    "operator": "NotIn",
                                    "values": [
                                        "argo-cd",
                                        "service-account",
                                        "templates",
                                    ],
                                }
                            ]
                        },
                    }
                ],
                "template": {
                    "metadata": {
                        "name": "{{path.basename}}",
                        # Prevent App deletion when AppSet is deleted
                        "finalizers": [
                            "resources-finalizer.argocd.argoproj.io"
                        ]
                    },
                    "spec": {
                        "project": self.config.root_app_project,
                        "source": {
                            "repoURL": repo_url,
                            "targetRevision": self.config.root_app_target_revision,
                            "path": "{{path}}",
                            "helm": {
                                "ignoreMissingValueFiles": True,
                                "valueFiles": [
                                    # relative path from Helm Chart location
                                    f"../../../../argocd/{self.config.environment}/{{{{path[3]}}}}/{{{{path[4]}}}}.yaml",
                                ]
                            }
                        },
                        "destination": {
                            "server": "https://kubernetes.default.svc",
                            "namespace": '{{path[3]}}',
                        },
                        # temporarily disabled during heavy development
                        # "syncPolicy": {
                        #     "automated": {
                        #         "prune": False if self.config.environment == "production" else True,
                        #         "selfHeal": True,
                        #     },
                        # },
                    }
                },
                "syncPolicy": {
                    # Prevent appset controller from deleting App
                    "applicationsSync": "create-update"
                }
            },
            opts=pulumi.ResourceOptions(
                parent=self,
                provider=self.k8s_provider,
                depends_on=[self.helm_chart],  # Wait for ArgoCD to be deployed
            ),
        )

    @property
    def namespace_name(self) -> pulumi.Output[str]:
        return self.namespace.metadata.name

    @property
    def service_endpoint(self) -> pulumi.Output[str]:
        return pulumi.Output.format(
            "argocd-server.{0}.svc.cluster.local", self.namespace_name
        )

    @property
    def external_url(self) -> str:
        return f"https://{self.config.domain}"
