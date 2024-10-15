# FastAPI Cloud Infra

This is the infra for FastAPI Cloud. This document contains a short tour.

It will evolve over time. There's a chance that when you read this some things have changed and we forgot to update the README. Sorry. 🙈

![architecture](./architecture.drawio.svg)

**Note**: you can edit this diagram file with draw.io, directly in VS Code.

## AWS Environments

There are **3 AWS accounts**, **development**, **staging**, and **production**.

Pulumi with all the AWS stuff will run on **staging** when merging to `master` and on **production** when making a release. It doesn't run automatically on **development**, we run things there by hand, to test things out.

## AWS CLI

Install the AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

Configure the AWS CLI with SSO (single sign-on). Use the tutorial tabs for for "IAM Identity Center": https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html#cli-configure-sso-configure

It will guide you to run:

```bash
aws configure sso
```

It could ask you for the SSO URL, the region, and the account ID. You can get those from the AWS login for the company: https://fastapilabs.awsapps.com/start/

Then it will ask you for the role name.

Use the role `FastAPILabsPowerUserK8s`.

Use a short profile name instead of the default one so that you can use it later. For example:

* `development`
* `staging`
* `production`

Later, you can configure it again and set the profile name to `default` to use it by default.

**Note**: you only need to do this once per environment.

### AWS SSO Login

Every few hours, you will need to login again to AWS, use the command:

```bash
aws sso login --profile profile_name
```

### Configure `kubectl` with AWS

Follow: https://docs.aws.amazon.com/eks/latest/userguide/create-kubeconfig.html

You will need the name of the cluster, you can get it from the Pulumi output, by going to the AWS web console, going to Elastic Kubernetes Service, and copying the name of the cluster, or by running:

```bash
aws eks --region us-east-1 list-clusters --profile development
```

Adjust the `--profile` to the one you configured before (probably one for `development`, one for `staging`, one for `production`).

Then you can configure `kubectl` with the AWS environment:

```bash
aws eks --region us-east-1 update-kubeconfig --name cluster_name --profile development
```

Adjust the `cluster_name` and `--profile` as needed.

### Configure the kubectl context/environment

After running the steps above for each AWS environment, each with have a `kubectl` "context".

You can to list all the contexts with:

```bash
kubectl config get-contexts
```

Then, to use one context, you can:

```bash
kubectl config use-context context_name
```

By default the context will have the long name of the cluster, you can rename it to something shorter, for example to `development`, `staging`, `production`:

```bash
kubectl config rename-context long_name development
```

After that, you can use that `development` context with:

```bash
kubectl config use-context development
```

## Pulumi

`infra/__main__.py` and other files have the main Pulumi code.

### AWS Resources

Pulumi will create a VPC with the network tags needed by the load balancers used with Kubernetes.

Then it creates an EKS cluster with that VPC.

The infra will need one or more AWS Load Balancers later. Those will be created by another component **from inside of Kubernetes** called "AWS Load Balancer Controller" that we'll install later. That component lives in the Kubernetes side, not the AWS side, but controls things from the AWS side (load balancers). That AWS Load Balancer Controller needs a Kubernetes "Service Account" that is connected to an AWS IAM Role with an AWS IAM Policy that allows it to manage the Load Balancers.

The Pulumi code creates that IAM Policy, the IAM Role, connects them, and makes them accessible via a Kubernetes Service Account name (that we haven't created yet, but we will, using that same name).

Up to this point, Pulumi has been creating and managing AWS resources only.

### Kubernetes Resources

Then, Pulumi uses the EKS Kubernetes created as a Pulumi "provider" that is used for the next parts involving Kubernetes.

It creates a Kubernetes Service Account with the same name we defined above, and it attaches the AWS IAM Role we created above.

This part of the Kubernetes setup is done in Pulumi because it's strongly connected to the AWS resources just created, so it's easier to do that in the Pulumi side.

Next we will install some Helm Charts. And although Pulumi has (in theory) some support for Helm Charts with two different resources, I couldn't make it work yet. So, for now, we won't use Pulumi for the rest of the Kubernetes setup.

### Pulumi Export

At the end, Pulumi exports several values from the outcome. Some can be useful during debugging, one in particular is needed for the rest of the setup, the Kubernetes "Kubeconfig".

### Pulumi Deploy GitHub Action

`.github/workflows/pulumi-deploy.yml` is the GitHub Action that starts the deployment automatically.

It uses GitHub Action Secrets and environment variables in a GitHub Environment to configure credentials for Pulumi and AWS (staging or production).

Then it runs the Pulumi deployment.

It will also run on "workflow dispatch", which means, run manually from the GitHub Actions UI. When it's run that way, there's an option to run it with debug enabled. When that is done, at the end, it starts a Tmate session that can be used to manually deploy the rest of the Kubernetes components.

### Pulumi Manually

If you are deploying a cluster manually, for example the `development` cluster, you can do the following.

Export the AWS environment variables for Pulumi for that AWS account (e.g. `development`):

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

Then run Pulumi:

```bash
pulumi up
```

Check on the web UI the diagnostics, you might need to subscribe to an Ubuntu license and run it again.

After it, create a new terminal so that any commands you run don't use the same environment variables, for example, communicating with Kubernetes using `kubectl`.

### Pulumi Outputs

After Pulumi finishes, take note of the Pulumi outputs.

Update the environment variables in the GitHub Action Secrets and environment variables for the GitHub environment:

* `s3_deployment_customer_apps`: `AWS_DEPLOYMENT_BUCKET` environment variable
* `ecr_registry_url`: `ECR_REGISTRY_URL` environment variable
* `redis_backend`: `REDIS_SERVER` environment variable

## Tmate

For staging, when the GitHub Action is run with debug enabled, after the Pulumi code is run, it starts a Tmate session.

It is shown in the logs with a line that says something like:

```
SSH: ssh z6b7h5TBUbFEctKyzzLy5tUzc@nyc1.tmate.io
or: ssh -i <path-to-private-SSH-key> z6b7h5TBUbFEctKyzzLy5tUzc@nyc1.tmate.io
```

If you have SSH keys configured in your GitHub account, it will use them to enable you to SSH into the GitHub Action runner machine by executing that command:

```bash
ssh z6b7h5TBUbFEctKyzzLy5tUzc@nyc1.tmate.io
```

It will only allow you to SSH into the machine using your SSH key, just by typing that same command.

Once you are in the machine, you can continue the deployment manually.

You will have some environment variables available, defined in the GitHub Action. For example, including the Kubeconfig that will be needed to interact with the Kubernetes cluster.

You will be shown some instructions, after reading, you can type `q` to have the remote SSH session.

In the Tmate session, you can continue the deployment of Kubernetes resources manually.

This step was done once by Sebastián, it (normally) doesn't need to be done again, unless we are updating versions or similar.

Once you are done with the next steps, you can terminate the Tmate session by creating a file called `continue` in the main directory, e.g.:

```bash
touch continue
```

Tmate will read it, terminate the SSH session and continue the GitHub Action execution (just finishing it).

## Kubernetes Deployment

Once you have access to the Kubernetes cluster from `kubectl` you can deploy the rest of the Kubernetes components.

If you just deployed the cluster, you need to go read above and [Configure `kubectl` with AWS](#configure-kubectl-with-aws), and [Change the `kubectl` context/environment](#configure-the-kubectl-contextenvironment).

### Build TriggerMesh

AWS S3 sends events to AWS SQS, we listen to those events with a TriggerMesh.

But TriggerMesh was discontinued/abandoned, so, while we refactor and migrate that, we are building our own container images from the TriggerMesh source code: https://github.com/triggermesh/triggermesh

We need to manually build the images and push them to our AWS ECR.

#### Clone TriggerMesh Core

```bash
git clone git@github.com:triggermesh/triggermesh.git
git clone git@github.com:triggermesh/triggermesh-core.git
git clone git@github.com:triggermesh/brokers.git

```

#### Install Go

https://go.dev/doc/install

#### Install Ko

Install ko following the guide: https://ko.build/install/

Move `ko` to a location in the `PATH`, for example.

#### Login to AWS ECR

`ko` will use the Docker credentials to push the images to the AWS ECR.

Get  the container registry ID with:

```bash
aws ecr describe-registry --profile development
```

That will output something like:

```json
{
    "registryId": "961341535962",
    "replicationConfiguration": {
        "rules": []
    }
}
```

Set an env var with this registry ID, for example:

```bash
export REGISTRY_ID=961341535962
```

Set an env var with the full registry name:

```bash
export REGISTRY_NAME=$REGISTRY_ID.dkr.ecr.us-east-1.amazonaws.com
```

Then login to the registry:

```bash
aws ecr get-login-password --region us-east-1 --profile development | docker login --username AWS --password-stdin $REGISTRY_NAME
```

#### Set up Ko Repo

Ko depends on the `KO_DOCKER_REPO` environment variable to know where to push the images.

Set it with:

```bash
export KO_DOCKER_REPO=$REGISTRY_NAME
```

#### Build the TriggerMesh Core Image

From inside the `triggermesh-core` directory, build the image with:

```bash
ko build -t latest --base-import-paths --local ./cmd/core-controller
```

That will tag the image with `latest`, will use the plain image name `core-controller` (without a hash at the end) and will save it to the local Docker.

#### Build the TriggerMesh Redis Image

From inside the `brokers` directory, build the image with:

```bash
ko build -t latest --base-import-paths --local ./cmd/redis-broker
```

#### Build the TriggerMesh Controller Image

From inside the `triggermesh` directory, build the images with:

```bash
ko build -t latest --base-import-paths --local ./cmd/triggermesh-controller
ko build -t latest --base-import-paths --local ./cmd/triggermesh-webhook
ko build -t latest --base-import-paths --local ./cmd/awssqssource-adapter
```

### Push the Images

Push the images to the AWS ECR with:

```bash
docker push $REGISTRY_NAME/core-controller:latest
docker push $REGISTRY_NAME/redis-broker:latest
docker push $REGISTRY_NAME/triggermesh-controller:latest
docker push $REGISTRY_NAME/triggermesh-webhook:latest
docker push $REGISTRY_NAME/awssqssource-adapter:latest
```

---

Now you can continue with the rest of the scripts that will use these images.

### Helm Charts

Start with `infra/deploy-helm.sh`.

This script expects an environment variable `CLUSTER_NAME`. If it's run in GitHub Actions, it will be set by automatically. If you are running it locally, get it from Pulumi:

```bash
export CLUSTER_NAME=$(pulumi stack output cluster_name --stack 'fastapilabs/development')
```

Set the stack accordingly.

Then run:

```bash
cd infra
bash deploy-helm.sh
```

This script will:

* Expects `kubectl` to be already configured, in the GitHub Action, it's set up before starting Tmate, if you are running it locally, you need to set it up manually.
* Use Helm to install the following Helm Charts:
    * AWS Load Balancer Controller: this creates the AWS Load Balancers allow the external world to communicate with our Kubernetes cluster. This uses the Kubernetes Service Account we created with Pulumi.
    * Cert Manager: this will manage the TLS (HTTPS) certificates obtained from Let's Encrypt. We'll configure more things later for it.
        * It seems this needs to call the AWS Load Balancer Controller, and it might not be ready yet, so this might take a second run to install successfully.
    * Ingress Nginx Controller: this manages ingress resources we deploy manually, with Kubernetes Deployments (currently none), in contrast to doing that with Knative. This uses customization values from `infra/helm-values/ingress-nginx-external-values.yaml` to enable it to use the AWS Load Balancer Controller.
* At the end it obtains and shows the DNS name of the load balancer.

We need to update the DNS records in Cloudflare to use it (with a `CNAME`). This is normally done once by hand (by Sebastián) and left configured. Later we might want to set up ExternalDNS to do it automatically. (To be reviewed and updated).

* `fastapicloud.dev` is configured later, for production for Knative.
* `fastapicloud.club` is configured later, for staging for Knative.
* `fastapicloud.space` is configured later, for development for Knative.

**Note**: we currently don't use the following, we might want to refactor or remove them.

* `fastapicloud.com` points to production at the Ingress Nginx.
* `fastapicloud.work` points to staging at the Ingress Nginx.
* `fastapicloud.site` points to development at the Ingress Nginx.

### Cloudflare DNS

* Add a `CNAME` record in Cloudflare to point the domain to the AWS Load Balancer for the star subdomain, e.g. `*.fastapicloud.work`.
* Configure SSL/TLS encryption encryption mode: Full (strict): SSL/TLS -> Overview -> Configure.

### Kubernetes Manifests

After having the Helm Charts installed, install other non-Helm Kubernetes resources.

Continue with: `infra/deploy-kubectl.sh`.

This script expects some environment variables to be set. If running on the GitHub Action, they are set automatically. If running locally, set them manually.

* `CLOUDFLARE_API_TOKEN_DNS` with the Cloudflare DNS token for Knative serving:

```bash
export CLOUDFLARE_API_TOKEN_DNS=...
```

* `SQS_SOURCE_ARN` with the ARN of the SQS queue that will be used by the S3 event listener, you can read it from the Pulumi output:

```bash
export SQS_SOURCE_ARN=$(pulumi stack output sqs_deployment_customer_apps_arn --stack 'fastapilabs/development')
```

* `REGISTRY_ID` with the AWS ECR registry ID, you can get it from [Login to AWS ECR](#login-to-aws-ecr):

```bash
export REGISTRY_ID=961341535962...
```

It also expects a `DEPLOY_ENVIRONMENT` with the name of the environment, from `development`, `staging`, or `production`. By default it is set to `development`, which is what you would use when deploying locally.

Then run:

```bash
cd infra
bash deploy-kubectl.sh
```

This script will:

* Expect `kubectl` to be already configured.
* Add the Cloudflare token, so that the Cert Manager can create the DNS records needed for TLS (HTTPS) certificates from Let's Encrypt.
* Add the Cert Manager resources: the staging and production issuers and the wildcard certificates for the Ingress Nginx controller and Knative.
* Install the Knative CRDs (Custom Resource Definitions for Kubernetes).
* Install Knative Serving and Kourier as the Knative network layer. This uses Kustomize with the files and directories in `infra/k8s/knative` (described below).
* Install the Knative role to allow it to create Knative services.
* Install the TriggerMesh components.
* Show the DNS of the Knative AWS Load Balancer to update the DNS records in Cloudflare (with a `CNAME`). This is done by hand by Sebastián.

We need to update the DNS records in Cloudflare manually with this DNS name.

* `fastapicloud.dev` points to production at the Knative ingress with Kourier, people's apps would have a subdomain here.
* `fastapicloud.club` points at staging at the Knative ingress with Kourier.
* `fastapicloud.space` points at development at the Knative ingress with Kourier.

`fastapicloud.com`, `fastapicloud.work`, `fastapicloud.site` were configured previously.

### Knative Kustomize

Knative uses Kourier for the network. Kourier is in charge of handling the network traffic from the outside world into Knative, through Kubernetes.

Kourier uses the AWS Load Balancer Controller to create an AWS Load Balancer.

To explore the Knative Kustomize installation start with `infra/k8s/knative/base/kustomization.yaml`.

It uses the Knative and Kourier releases from GitHub (as described in the Knative and Kourier installation instructions).

Then it uses Kustomize to patch (update) several configs.

* It patches Knative to make it use Kourier.
* It patches Knative to update the default domain name for apps, to make them top-level sub-domains (e.g. of `fastapicloud.dev` or `fastapicloud.club`).
  * That way the final customer app is something like `my-awesome-app-12acs.fastapicloud.dev`, otherwise, it would include the Kubernetes namespace by default, like `my-awesome-app-12acs.team-avengers.fastapicloud.dev`.
  * But second level sub-domains are not allowed by Let's Encrypt for wildcard certificates, only one level of wildcard certs. Having a single wildcard certificate allows us to start serving an app right after it's deployed, without waiting for the potentially slow dance to acquire certs from Let's Encrypt.
* It patches Kourier to make it use the AWS Load Balancer Controller so that it creates an AWS Load Balancer to communicate with the external world.
* It patches Kourier to use the custom certificate for the Knative domain created before.

### Knative Kustomize Overlay

The previous file is not really used directly.

Instead, one of two Kustomize "overlays" is used, one for production, one for staging, and one for development.

These overlays extend the `base` Kustomize configuration and add the Knative domain used for production (`fastapicloud.dev`), staging (`fastapicloud.club`), or development (`fastapicloud.site`).

## Github Runner k8s deployment

### Connect to the GitHub Runner

Go to the AWS web Console -> EC2 -> Instances -> Select the GitHub Runner instance, click on "Connect" via the web UI.

### Install docker adding the official repositories

https://docs.docker.com/engine/install/ubuntu/

### Install AWS CLI

https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

### Install the GitHub Runner

Follow the guide on: https://github.com/fastapi/full-stack-fastapi-template/blob/master/deployment.md#install-github-actions-runner

### Setup kubeconfig

Get the kubeconfig content from Pulumi, execute locally:

```bash
pulumi stack output kubeconfig --stack 'fastapilabs/development'
```

Create the directory for the kubeconfig for GitHub:

```bash
mkdir -p /home/github/.kube
```

Copy the content output from pulumi under `/home/github/.kube/config`. You can open the file with:

```bash
nano /home/github/.kube/config
```

## Deploy Backend and Builder

Go to GitHub Actions and "dispatch" a workflow run for the "Deploy Backend" and "Deploy Builder" workflows, select the environment to use.

## Create a new Environment from Scratch

You would normally follow the steps above, this is only if there's a new environment needed (apart from the existing ones, `development`, `staging`, `production`).

### Create a new AWS Account

* Open the `fastapilabs` account with an admin account (Sebastián).
* Go to AWS Organizations -> Accounts -> Create Account.
* Set the account email to `sebastian+aws-{environment name}@fastapilabs.com` e.g.: `sebastian+aws-development@fastapilabs.com`.

### Confirm Permission sets are available

There should be some Multi-account "permission sets" already configured, this step is just to confirm they are there.

* While still in the `fastapilabs` account, go to IAM Identity Center -> Multi-account permissions -> Permissions sets.
* There should be 3 permission sets: `AdministratorAccess`, `PowerUserAccess`, `FastAPILabsPowerUserK8s`.
* `AdministratorAccess`, `PowerUserAccess` are managed by AWS, there's a custom role `FastAPILabsPowerUserK8s` that gives access to the Kubernetes cluster.
* `FastAPILabsPowerUserK8s` should include `PowerUserAccess` and the inline policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Action": [
                "eks:ListFargateProfiles",
                "eks:DescribeNodegroup",
                "eks:ListNodegroups",
                "eks:ListUpdates",
                "eks:AccessKubernetesApi",
                "eks:ListAddons",
                "eks:DescribeCluster",
                "eks:DescribeAddonVersions",
                "eks:ListClusters",
                "eks:ListIdentityProviderConfigs",
                "iam:ListRoles"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "ssm:GetParameter",
            "Resource": [
                "arn:aws:ssm:*:730335251839:parameter/*",
                "arn:aws:ssm:*:471112862740:parameter/*"
            ]
        }
    ]
}
```

### Add Users to new Account

* While still in the `fastapilabs` account, go to IAM Identity Center -> Multi-account permissions -> AWS accounts. Click the new account.
* The list of "Assigned users and groups" would be empty. Click on "Assign users and groups". Click the tab Users (not Groups).
* Select all the users that should have some permissions. Probably all should have at least `FastAPILabsPowerUserK8s`. Then click on Next.
* Select the roles that should be added to these selected users (probably `FastAPILabsPowerUserK8s`). Then click on Next.
* Review and click on Submit.
* Repeat for any extra roles needed. For example, anyone that needs to create AWS resources by hand while testing them could have `AdministratorAccess`.

### Create Pulumi IAM User

* Go to the main AWS access portal, open the new account with the `AdministratorAccess` role.
* Go to IAM -> Users -> Create user.
* Create a user `pulumi` with `AdministratorAccess` permissions.
* Attach the `AdministratorAccess` policy. There's no need to create a group as this will be only used by Pulumi.
* Click on the user, then click the link to "Create access key".
* Select "Third-party service".
* There's no need for a description, create the access key.
* Copy the Access key ID and the Secret access key. Save them in a secure location (Sebastián would be the one doing this).

### Add Kustomize files

A new environment would need its own versions of some files.

#### CertManager

A new environment would need:

* Its own certmanager domain config `k8s/cert-manager/wildcard-cert-${DEPLOY_ENVIRONMENT}.yaml`
* Its own certmanager domain config for Knative Serving `k8s/cert-manager/wildcard-cert-serving-${DEPLOY_ENVIRONMENT}.yaml`

**Note**: Let's encrypt has a concept of `staging` and `production`, this is different from our staging and production environments. Their concept refers to debugging the setup to acquire certificates in *their* staging environment and getting the actual real certificates from their production environment. The files refer to `letsencrypt-production`, leave it as is, even for our development environment. This `letsencrypt-production` refers to Let's Encrypt creating real HTTPS certificates for our real domain name (that points to one of our environments).

#### Knative Serving

* Kustomize files in `infra/k8s/knative/overlays/` to configure the domains for Knative.

### Add Pulumi stack files

A new environment would need its own versions of `infra/Pulumi.{environment}.yaml`.

## Destroy an AWS Environment

To destroy an environment in AWS do the following.

* Destroy the Pulumi stack:

```bash
pulumi destroy
```

While Pulumi is destroying the cluster, some additional steps need to be done manually for it to be able to finish.

* Delete the `default` service account:

```bash
kubectl delete serviceaccounts default
```

* Delete the AWS Load Balancers from the AWS Console, those were created by the AWS Load Balancer Controller. The VPC could hang deleting if there are dependencies.

* Delete the ECR repositories from the AWS Console, those were created by our code.

* Delete the S3 bucket's contents and the bucket.

After that, the `pulumi destroy` command should be able to finish.
