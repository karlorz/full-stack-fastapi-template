# FastAPI Project - Deployment

You can deploy the project using Docker Compose to a remote server.

This template now ships with a bundled [Caddy](https://caddyserver.com) proxy that terminates HTTP/HTTPS for the backend, frontend, and Adminer services. Traefik Compose files are still available under `docker-compose.legacy-traefik.yml` if you need the previous setup, but Caddy is the default going forward.

You can use CI/CD (continuous integration and continuous deployment) systems to deploy automatically, there are already configurations to do it with GitHub Actions.

But you have to configure a couple things first. 🤓

## Preparation

* Have a remote server ready and available.
* Configure the DNS records of your domain to point to the IP of the server you just created.
* Configure a wildcard subdomain for your domain, so that you can have multiple subdomains for different services, e.g. `*.fastapi-project.example.com`. This will be useful for accessing different components, like `dashboard.fastapi-project.example.com`, `api.fastapi-project.example.com`, `traefik.fastapi-project.example.com`, `adminer.fastapi-project.example.com`, etc. And also for `staging`, like `dashboard.staging.fastapi-project.example.com`, `adminer.staging.fastapi-project.example.com`, etc.
* Install and configure [Docker](https://docs.docker.com/engine/install/) on the remote server (Docker Engine, not Docker Desktop).

## Configure Caddy for production

The main `docker-compose.yml` includes a `caddy` service, so you don't need a separate reverse proxy deployment. For local development the bundled `caddy/Caddyfile` disables HTTPS and serves everything over HTTP for simplicity. Before deploying to staging or production you should adjust it for real domains and certificates.

### Update the Caddyfile for HTTPS

1. Edit `caddy/Caddyfile` and remove (or guard behind an environment check) the global options block that contains `auto_https off`. Caddy can then request certificates automatically.
2. Add an email address so Let's Encrypt can contact you about renewals. You can either set it in the global block (e.g. `email {$CADDY_ADMIN_EMAIL}`) or inline in the site definition. The compose file already passes the `CADDY_ADMIN_EMAIL` environment variable; make sure it's set when deploying.
3. Update the site addresses to use `https://api.{$DOMAIN}` and `https://dashboard.{$DOMAIN}` (Caddy will still listen on HTTP and redirect automatically).
4. Redeploy the stack so Caddy reads the new configuration. Caddy will obtain and renew certificates automatically once DNS points to your server.

If you prefer to front the application stack with another proxy (e.g. Traefik, Nginx, a cloud load balancer), you can keep Caddy disabled and use `docker-compose.legacy-traefik.yml` as a starting point for that alternative setup.

## Deploy the FastAPI Project

Now that Caddy (or your chosen reverse proxy) is in place you can deploy your FastAPI project with Docker Compose.

**Note**: You might want to jump ahead to the section about Continuous Deployment with GitHub Actions.

## Environment Variables

You need to set some environment variables first.

Set the `ENVIRONMENT`, by default `local` (for development), but when deploying to a server you would put something like `staging` or `production`:

```bash
export ENVIRONMENT=production
```

Set the `DOMAIN`, by default `localhost` (for development), but when deploying you would use your own domain, for example:

```bash
export DOMAIN=fastapi-project.example.com
```

You can set several variables, like:

* `PROJECT_NAME`: The name of the project, used in the API for the docs and emails.
* `STACK_NAME`: The name of the stack used for Docker Compose labels and project name, this should be different for `staging`, `production`, etc. You could use the same domain replacing dots with dashes, e.g. `fastapi-project-example-com` and `staging-fastapi-project-example-com`.
* `BACKEND_CORS_ORIGINS`: A list of allowed CORS origins separated by commas.
* `SECRET_KEY`: The secret key for the FastAPI project, used to sign tokens.
* `FIRST_SUPERUSER`: The email of the first superuser, this superuser will be the one that can create new users.
* `FIRST_SUPERUSER_PASSWORD`: The password of the first superuser.
* `SMTP_HOST`: The SMTP server host to send emails, this would come from your email provider (E.g. Mailgun, Sparkpost, Sendgrid, etc).
* `SMTP_USER`: The SMTP server user to send emails.
* `SMTP_PASSWORD`: The SMTP server password to send emails.
* `EMAILS_FROM_EMAIL`: The email account to send emails from.
* `POSTGRES_SERVER`: The hostname of the PostgreSQL server. You can leave the default of `db`, provided by the same Docker Compose. You normally wouldn't need to change this unless you are using a third-party provider.
* `POSTGRES_PORT`: The port of the PostgreSQL server. You can leave the default. You normally wouldn't need to change this unless you are using a third-party provider.
* `POSTGRES_PASSWORD`: The Postgres password.
* `POSTGRES_USER`: The Postgres user, you can leave the default.
* `POSTGRES_DB`: The database name to use for this application. You can leave the default of `app`.
* `SENTRY_DSN`: The DSN for Sentry, if you are using it.

## GitHub Actions Environment Variables

There are some environment variables only used by GitHub Actions that you can configure:

* `LATEST_CHANGES`: Used by the GitHub Action [latest-changes](https://github.com/tiangolo/latest-changes) to automatically add release notes based on the PRs merged. It's a personal access token, read the docs for details.
* `SMOKESHOW_AUTH_KEY`: Used to handle and publish the code coverage using [Smokeshow](https://github.com/samuelcolvin/smokeshow), follow their instructions to create a (free) Smokeshow key.

### Generate secret keys

Some environment variables in the `.env` file have a default value of `changethis`.

You have to change them with a secret key, to generate secret keys you can run the following command:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the content and use that as password / secret key. And run that again to generate another secure key.

### Deploy with Docker Compose

With the environment variables in place, you can deploy with Docker Compose:

```bash
docker compose -f docker-compose.yml up -d
```

For production you wouldn't want to have the overrides in `docker-compose.override.yml`, that's why we explicitly specify `docker-compose.yml` as the file to use.

## Continuous Deployment (CD)

You can use GitHub Actions to deploy your project automatically. 😎

You can have multiple environment deployments.

There are already two environments configured, `staging` and `production`. 🚀

### Install GitHub Actions Runner

* On your remote server, create a user for your GitHub Actions:

```bash
sudo adduser github
```

* Add Docker permissions to the `github` user:

```bash
sudo usermod -aG docker github
```

* Temporarily switch to the `github` user:

```bash
sudo su - github
```

* Go to the `github` user's home directory:

```bash
cd
```

* [Install a GitHub Action self-hosted runner following the official guide](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners#adding-a-self-hosted-runner-to-a-repository).

* When asked about labels, add a label for the environment, e.g. `production`. You can also add labels later.

After installing, the guide would tell you to run a command to start the runner. Nevertheless, it would stop once you terminate that process or if your local connection to your server is lost.

To make sure it runs on startup and continues running, you can install it as a service. To do that, exit the `github` user and go back to the `root` user:

```bash
exit
```

After you do it, you will be on the previous user again. And you will be on the previous directory, belonging to that user.

Before being able to go the `github` user directory, you need to become the `root` user (you might already be):

```bash
sudo su
```

* As the `root` user, go to the `actions-runner` directory inside of the `github` user's home directory:

```bash
cd /home/github/actions-runner
```

* Install the self-hosted runner as a service with the user `github`:

```bash
./svc.sh install github
```

* Start the service:

```bash
./svc.sh start
```

* Check the status of the service:

```bash
./svc.sh status
```

You can read more about it in the official guide: [Configuring the self-hosted runner application as a service](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/configuring-the-self-hosted-runner-application-as-a-service).

### Set Secrets

On your repository, configure secrets for the environment variables you need, the same ones described above, including `SECRET_KEY`, etc. Follow the [official GitHub guide for setting repository secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository).

The current Github Actions workflows expect these secrets:

* `DOMAIN_PRODUCTION`
* `DOMAIN_STAGING`
* `STACK_NAME_PRODUCTION`
* `STACK_NAME_STAGING`
* `EMAILS_FROM_EMAIL`
* `FIRST_SUPERUSER`
* `FIRST_SUPERUSER_PASSWORD`
* `POSTGRES_PASSWORD`
* `SECRET_KEY`
* `LATEST_CHANGES`
* `SMOKESHOW_AUTH_KEY`

## GitHub Action Deployment Workflows

There are GitHub Action workflows in the `.github/workflows` directory already configured for deploying to the environments (GitHub Actions runners with the labels):

* `staging`: after pushing (or merging) to the branch `master`.
* `production`: after publishing a release.

If you need to add extra environments you could use those as a starting point.

## URLs

Replace `fastapi-project.example.com` with your domain.

### Production

Frontend: `https://dashboard.fastapi-project.example.com`

Backend API docs: `https://api.fastapi-project.example.com/docs`

Backend API base URL: `https://api.fastapi-project.example.com`

Adminer: `https://adminer.fastapi-project.example.com`

### Staging

Frontend: `https://dashboard.staging.fastapi-project.example.com`

Backend API docs: `https://api.staging.fastapi-project.example.com/docs`

Backend API base URL: `https://api.staging.fastapi-project.example.com`

Adminer: `https://adminer.staging.fastapi-project.example.com`
