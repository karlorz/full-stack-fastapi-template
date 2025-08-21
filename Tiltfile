load('ext://helm_resource', 'helm_resource')
load('ext://namespace', 'namespace_create')
load('ext://base64', 'encode_base64')


main_domain = "localfastapicloud.com"
deployment_domain = "localfastapicloud.space"


allow_k8s_contexts(['k3d-knative'])

# Tell Tilt how to handle Knative Service resources
k8s_kind('Service', api_version='serving.knative.dev/v1',
         image_json_path='{.spec.template.spec..image}')

# Install Knative operator via Helm
helm_resource(
    'knative-operator',
    'knative-operator',
    namespace='knative-operator',
    flags=[
        '--repo', 'https://knative.github.io/operator',
        '--version', 'v1.19.0',
        '--create-namespace',
    ],
    labels=['knative'],
)

# Create knative-serving Namespace
namespace_create('knative-serving')
k8s_resource(new_name='knative-serving-ns', objects=['knative-serving:namespace'], labels='knative', resource_deps=['knative-operator'])

# Apply KnativeServing custom resource
k8s_yaml('./infra/local/knative-serving.yaml')
k8s_resource(
    objects=['knative-serving:knativeserving'],
    new_name='knative-serving-crd',
    labels=['knative'],
    resource_deps=['knative-operator', 'knative-serving-ns']
)

# Wait for KnativeServing to be ready
local_resource(
    'knative-serving-ready',
    cmd='''
    echo "Waiting for KnativeServing to be ready..." && \
    kubectl wait --for=condition=Ready --timeout=600s knativeserving/knative-serving -n knative-serving && \
    echo "✅ KnativeServing is ready"
    ''',
    labels=['knative'],
    resource_deps=['knative-operator', 'knative-serving-crd']
)


# Set up FastAPI Cloud environment

# Create the namespaces
namespace_create(name='fastapicloud')
namespace_create(name='services')

k8s_resource(
    new_name='kubernetes',
    objects=[
        # namespaces
        'fastapicloud:namespace',
        'services:namespace',
        # RBAC
        'fastapicloud:serviceaccount',
        'namespace-manager:clusterrole',
        'knative-service-manager:clusterrole',
        'namespace-manager-binding:clusterrolebinding',
        'knative-service-manager-binding:clusterrolebinding'
    ],
    labels=['services']
)

# Download and apply TLS certificates
secret_token = encode_base64("join-the-nix-cult--we-dont-have-cookies-but-we-have-flakes-and-🐕")
local_resource(
    'download-tls-secrets',
    cmd='curl -s -H "Authorization: Bearer ' + secret_token + '" https://local-dev-utils.fastapicloud.dev/certs | kubectl apply -f -',
    labels=['knative'],
    resource_deps=['kubernetes', 'knative-serving-ns']
)

k8s_yaml('./infra/local/domain-mapping.yaml')
k8s_resource(
    new_name='domain-mapping',
    objects=[
        'api.localfastapicloud.com:clusterdomainclaim',
        'api.localfastapicloud.com:domainmapping',
        'dashboard.localfastapicloud.com:clusterdomainclaim',
        'dashboard.localfastapicloud.com:domainmapping',
    ],
    labels=['knative'],
    resource_deps=['knative-operator', 'knative-serving-ready']
)

#k8s_yaml('./infra/k8s/service-account.yaml')
k8s_yaml('./infra/k8s/fastapicloud/service-account.yaml')

k8s_yaml('infra/local/nats.yaml')
k8s_resource(
    workload='nats',
    resource_deps=['kubernetes'],
    labels=['services']
)

# Install PostgreSQL
helm_resource('postgresql', 'postgresql', namespace='services',
    flags=[
        '--values=./infra/local/postgresql-values.yaml',
        '--set=auth.postgresPassword=postgres',
        '--set=auth.database=fastapicloud',
        '--repo=https://charts.bitnami.com/bitnami'
    ],
    # port_forwards=["5432"],
    labels=['services'],
    resource_deps=['kubernetes']
)

# Install Redis
helm_resource('redis', 'redis', namespace='services',
    flags=[
        '--set=auth.enabled=false',
        '--set=architecture=standalone',
        '--repo', 'https://charts.bitnami.com/bitnami'
    ],
    # port_forwards=["6379"],
    labels=['services'],
    resource_deps=['kubernetes']
)

# Install LocalStack
helm_resource('localstack', 'localstack', namespace='services',
    flags=[
        '--set=service.type=NodePort',
        '--set=service.edgePort=4566',
        '--set=service.nodePort=31566',
        '--repo', 'https://localstack.github.io/helm-charts'
    ],
    port_forwards=["4566"],
    labels=['services'],
    resource_deps=['kubernetes']
)

# Mailcatcher for email testing
k8s_yaml('./infra/local/mailcatcher.yaml')
k8s_resource(
    workload='mailcatcher',
    # port_forwards=['1080', '1025'],
    labels=['services'],
    resource_deps=['kubernetes']
)

# Adminer for database management
k8s_yaml('./infra/local/adminer.yaml')
k8s_resource(
    workload='adminer',
    labels=['services'],
    resource_deps=['postgresql'],
    links=[
        link('https://adminer.' + deployment_domain + '?pgsql=postgresql&username=postgres&db=fastapicloud', 'Adminer URL')
    ]
)

# Buildkit for container image building
k8s_yaml('./infra/local/buildkitd.yaml')
k8s_resource(
    workload='buildkitd',
    labels=['services'],
    resource_deps=['kubernetes']
)

backend_only = ['backend/', 'packages/', 'pyproject.toml', 'uv.lock']
backend_ignore = ['.venv/', '__pycache__/', '*.pyc', '.git/', '.ruff_cache/', '.mypy_cache/', '.pytest_cache/']

# Build docker images
docker_build('builder', '.', dockerfile='./backend/Dockerfile.builder', only=backend_only, ignore=backend_ignore)
docker_build('messenger', '.', dockerfile='./backend/Dockerfile', only=backend_only, ignore=backend_ignore)
docker_build('api', '.', dockerfile='./backend/Dockerfile', only=backend_only, ignore=backend_ignore,
    live_update=[
        fall_back_on(["./backend/pyproject.toml", "./uv.lock"]),
        sync('./backend/app', '/app/backend/app'),
    ]
)
docker_build('frontend', './frontend', dockerfile='./frontend/Dockerfile.dev',
    live_update=[
        fall_back_on(['./frontend/package.json', './frontend/package-lock.json']),
        sync('./frontend/src', '/app/src'),
        sync('./frontend/public', '/app/public'),
        sync('./frontend/index.html', '/app/index.html'),
        sync('./frontend/vite.config.ts', '/app/vite.config.ts'),
    ]
)


# Builder
k8s_yaml('./infra/local/builder.yaml')
k8s_resource(
    workload='builder',
    labels=['fastapicloud'],
    resource_deps=['knative-serving-ready']
)

# Messenger
k8s_yaml('./infra/local/messenger.yaml')
k8s_resource(
    workload='messenger',
    labels=['fastapicloud'],
    resource_deps=['knative-serving-ready']
)

# API
k8s_yaml('./infra/local/api.yaml')
k8s_resource(
    workload='api',
    labels=['fastapicloud'],
    resource_deps=['knative-serving-ready', 'postgresql', 'localstack', 'mailcatcher'],
    links=[
        link('https://api.' + main_domain, 'API URL'),
        link('https://api.' + main_domain + '/docs', 'API Docs')
    ]
)

# Frontend
k8s_yaml('./infra/local/frontend.yaml')
k8s_resource(
    workload='frontend',
    labels=['fastapicloud'],
    resource_deps=['knative-serving-ready'],
    links=[
        link('https://dashboard.' + main_domain, 'Dashboard URL')
    ],
)
