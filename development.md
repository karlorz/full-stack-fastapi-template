# FastAPI Cloud - Development

## Docker Compose

Start the local stack with:

```bash
docker compose watch
```

That starts everything, including the backend, frontend, database, mailcatcher, Redis, etc. And it will watch for changes in the backend to synchronize the files in the Docker container.

If you need to make changes, edit `compose.yml`.

These Docker Compose file use the `.env` file containing configurations to be injected as environment variables in the containers, it is declared in the services in `compose.yml`.

Docker Compose also reads the `.env` file itself, so the environment variables are also available inside of the `compose.yml` file, even if the file `.env` is not declared.

## The .env file

The `.env` file is the one that contains all your local development configurations, generated keys and passwords, etc.

For deployment, many of those environment variables will be overwrote.

### Pre-commits and code linting

We are using a tool called [pre-commit](https://pre-commit.com/) for code linting and formatting.

When you install it, it runs right before making a commit in git. This way it ensures that the code is consistent and formatted even before it is committed.

You can find a file `.pre-commit-config.yaml` with configurations at the root of the project.

#### Install pre-commit to run automatically

`pre-commit` is already part of the dependencies of the project, but you could also install it globally if you prefer to, following [the official pre-commit docs](https://pre-commit.com/).

After having the `pre-commit` tool installed and available, you need to "install" it in the local repository, so that it runs automatically before each commit.

Using Poetry, you could do it with:

```bash
❯ poetry run pre-commit install
pre-commit installed at .git/hooks/pre-commit
```

Now whenever you try to commit, e.g. with:

```bash
git commit
```

...pre-commit will run and check and format the code you are about to commit, and will ask you to add that code (stage it) with git again before committing.

Then you can `git add` the modified/fixed files again and now you can commit.

#### Running pre-commit hooks manually

you can also run `pre-commit` manually on all the files, you can do it using Poetry with:

```bash
❯ poetry run pre-commit run --all-files
check for added large files..............................................Passed
check toml...............................................................Passed
check yaml...............................................................Passed
ruff.....................................................................Passed
ruff-format..............................................................Passed
eslint...................................................................Passed
prettier.................................................................Passed
```

## URLs

### Development URLs

Development URLs, for local development.

Frontend: http://localhost:5173

Backend docs: http://localhost:8000

Automatic Interactive Docs (Swagger UI): http://localhost:8000

Adminer: http://localhost:8080

## Run Locally

### Develop the Frontend

If you are developing the frontend, you might want to start the backend, database, etc, with Docker Compose, but not the frontend, so that you can run the local development frontend server.

You can start a single Docker Compose service with its name, for example, to only start the `backend` (not the `frontend`), you can do:

```bash
docker compose up -d backend
```

As the `backend` depends on `db`, `redis` and `mailcatcher`, Docker Compose will start them automatically.

Then you can run the frontend development server with:

```bash
cd frontend
npm run start
```

### Develop the Backend

If you are developing the backend, you might want to start the database, redis, etc, with Docker Compose, but not the backend, so that you can run the local development backend server.

You can start the database and other required components (without the backend and frontend) with:

```bash
docker compose up -d db redis adminer mailcatcher
```

Then you can run the backend development server with:

```bash
cd backend
source .venv/bin/activate
fastapi dev backend/app/main.py
```

If you want to start the frontend in Docker to test the backend (but don't want to start the local development frontend server), you can do:

```bash
docker compose up -d frontend
```

## Ports

The services in Docker Compose use the same ports that would be used by the local development servers for the frontend and backend.

This allows you to stop a Docker Compose service (for example the `frontend`), or just not run it, and then start the local development frontend server and it will communicate with the backend on the same ports.

If you stop the `backend` Docker Compose service, you can start the local development backend server and it will use the same ports, so the frontend will communicate with it.

This way you don't have to keep changing configs to test one thing or the other.

But have in mind that both the development servers and Docker Compose use the same ports.

If you are not sure if you are communicating with the Docker Compose version or the local development server, you can check if the Docker Compose service is running with:

```bash
docker compose ps
```

If it's running and you want to use instead your local development server, you can stop it, for example to stop the `frontend`:

```bash
docker compose stop frontend
```
