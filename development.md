# FastAPI Project - Development

## Docker Compose

* Start the local stack with Docker Compose:

```bash
docker compose watch
```

* Now you can open your browser and interact with these URLs:

Frontend, built with Docker, with routes handled based on the path: http://localhost:5173

Backend, JSON based web API based on OpenAPI: http://localhost:8000

Automatic interactive documentation with Swagger UI (from the OpenAPI backend): http://localhost:8000/docs

Adminer, database web administration: http://localhost:8080

Caddy reverse proxy exposes subdomains that mirror production routing:
- Frontend dashboard: http://dashboard.localhost
- Backend API: http://api.localhost
- Adminer: http://adminer.localhost

**Note**: The first time you start your stack, it might take a minute for it to be ready. While the backend waits for the database to be ready and configures everything. You can check the logs to monitor it.

To check the logs, run (in another terminal):

```bash
docker compose logs
```

To check the logs of a specific service, add the name of the service, e.g.:

```bash
docker compose logs backend
```

## Local Development

The Docker Compose files are configured so that each of the services is available in a different port in `localhost`.

For the backend and frontend, they use the same port that would be used by their local development server, so, the backend is at `http://localhost:8000` and the frontend at `http://localhost:5173`.

This way, you could turn off a Docker Compose service and start its local development service, and everything would keep working, because it all uses the same ports.

For example, you can stop that `frontend` service in the Docker Compose, in another terminal, run:

```bash
docker compose stop frontend
```

And then start the local frontend development server:

```bash
cd frontend
npm run dev
```

Or you could stop the `backend` Docker Compose service:

```bash
docker compose stop backend
```

And then you can run the local development server for the backend:

```bash
cd backend
fastapi dev app/main.py
```

## Caddy subdomain routing

When you deploy the stack (even locally) each service is available on its native port (8000, 5173, 8080, etc.), and Caddy also listens on ports 80/443 to provide the same subdomain pattern you would use in production.

The base domain comes from the `.env` variable `DOMAIN` (default: `localhost`). With that default, Caddy maps:

- `http://dashboard.localhost` → frontend
- `http://api.localhost` → backend
- `http://adminer.localhost` → Adminer

Any subdomain of `localhost` resolves to `127.0.0.1`, so no extra host configuration is required.

If you prefer to test with another suffix (for example `localhost.tiangolo.com` or `example.test`), update the `.env` value:

```dotenv
DOMAIN=example.test
```

and then restart the stack:

```bash
docker compose watch
```

For real domains you can reuse the same Caddy service defined in `docker-compose.yml`, customizing `caddy/Caddyfile` (e.g. enable automatic HTTPS and set `CADDY_ADMIN_EMAIL`). Legacy Traefik configurations remain in `docker-compose.legacy-traefik.yml` if you need to reuse them.

## Docker Compose files and env vars

There is a main `docker-compose.yml` file with all the configurations that apply to the whole stack, it is used automatically by `docker compose`.

And there's also a `docker-compose.override.yml` with overrides for development, for example to mount the source code as a volume. It is used automatically by `docker compose` to apply overrides on top of `docker-compose.yml`.

These Docker Compose files use the `.env` file containing configurations to be injected as environment variables in the containers.

They also use some additional configurations taken from environment variables set in the scripts before calling the `docker compose` command.

After changing variables, make sure you restart the stack:

```bash
docker compose watch
```

## The .env file

The `.env` file is the one that contains all your configurations, generated keys and passwords, etc.

Depending on your workflow, you could want to exclude it from Git, for example if your project is public. In that case, you would have to make sure to set up a way for your CI tools to obtain it while building or deploying your project.

One way to do it could be to add each environment variable to your CI/CD system, and updating the `docker-compose.yml` file to read that specific env var instead of reading the `.env` file.

## Pre-commits and code linting

we are using a tool called [pre-commit](https://pre-commit.com/) for code linting and formatting.

When you install it, it runs right before making a commit in git. This way it ensures that the code is consistent and formatted even before it is committed.

You can find a file `.pre-commit-config.yaml` with configurations at the root of the project.

#### Install pre-commit to run automatically

`pre-commit` is already part of the dependencies of the project, but you could also install it globally if you prefer to, following [the official pre-commit docs](https://pre-commit.com/).

After having the `pre-commit` tool installed and available, you need to "install" it in the local repository, so that it runs automatically before each commit.

Using `uv`, you could do it with:

```bash
❯ uv run pre-commit install
pre-commit installed at .git/hooks/pre-commit
```

Now whenever you try to commit, e.g. with:

```bash
git commit
```

...pre-commit will run and check and format the code you are about to commit, and will ask you to add that code (stage it) with git again before committing.

Then you can `git add` the modified/fixed files again and now you can commit.

#### Running pre-commit hooks manually

you can also run `pre-commit` manually on all the files, you can do it using `uv` with:

```bash
❯ uv run pre-commit run --all-files
check for added large files..............................................Passed
check toml...............................................................Passed
check yaml...............................................................Passed
ruff.....................................................................Passed
ruff-format..............................................................Passed
eslint...................................................................Passed
prettier.................................................................Passed
```

## URLs

The production or staging URLs would use these same paths, but with your own domain.

### Development URLs

Local development via direct service ports:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Automatic Interactive Docs (Swagger UI): http://localhost:8000/docs
- Automatic Alternative Docs (ReDoc): http://localhost:8000/redoc
- Adminer: http://localhost:8080
- MailCatcher: http://localhost:1080

### Development URLs via Caddy

Using the Caddy proxy and the configured `DOMAIN` (defaults to `localhost`):

- Frontend: http://dashboard.localhost
- Backend: http://api.localhost
- Automatic Interactive Docs (Swagger UI): http://api.localhost/docs
- Automatic Alternative Docs (ReDoc): http://api.localhost/redoc
- Adminer: http://adminer.localhost