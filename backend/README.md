# FastAPI Cloud - Backend

## Requirements

* [Docker](https://www.docker.com/).
* [uv](https://docs.astral.sh/uv/) for Python package and environment management using [uv workspaces](https://docs.astral.sh/uv/concepts/projects/workspaces/).

## Local Development

* Start the stack with Docker Compose, everything minus the backend:

```bash
docker compose up -d db redis adminer mailcatcher
```

You can also start the frontend if you want:

```bash
docker compose up -d frontend
```

To check the logs, run:

```bash
docker compose logs
```

To check the logs of a specific service, add the name of the service, e.g.:

```bash
docker compose logs db
```

Read more about the Docker Compose setup in [development.md](../development.md), including how to start the required services but not the backend, to be able to run the development server locally.

Then you can start the local development server:

```bash
uv sync --all-packages
source .venv/bin/activate
cd backend
fastapi dev app/main.py
```

You could also start the app through the editor debugger.

## Backend local development, additional details

### General workflow

By default, the dependencies are managed with [uv](https://docs.astral.sh/uv/), go there and install it.

From the top level directory of the repo, install all the dependencies with:

```bash
uv sync --all-packages
```

Then you can activate the virtual environment with:

```bash
source .venv/bin/activate
```

Make sure your editor is using the correct Python virtual environment, with the interpreter at `.venv/bin/python`.

Modify or add SQLModel models for data and SQL tables in `./backend/app/models.py`, API endpoints in `./backend/app/api/`, CRUD (Create, Read, Update, Delete) utils in `./backend/app/crud.py`.

### VS Code

There are already configurations in place to run the backend through the VS Code debugger, so that you can use breakpoints, pause and explore variables, etc.

The setup is also already configured so you can run the tests through the VS Code Python tests tab.

### Docker Compose Local Development

You might prefer to simply run the local server, or start it through the debugger in your editor, but if you want to start the entire Docker Compose stack, including the backend, there are some configurations to simplify your work.

The directory with the backend code is mounted as a Docker "host volume", mapping the code you change live to the directory inside the container. That allows you to test your changes right away, without having to build the Docker image again. It should only be done during development, for production, you should build the Docker image with a recent version of the backend code. But during development, it allows you to iterate very fast.

There is also a command override that runs `/start-reload.sh` (included in the base image) instead of the default `/start.sh` (also included in the base image). It starts a single server process (instead of multiple, as would be for production) and reloads the process whenever the code changes. Have in mind that if you have a syntax error and save the Python file, it will break and exit, and the container will stop. After that, you can restart the container by fixing the error and running again:

```console
$ docker compose watch
```

There is also a commented out `command` override, you can uncomment it and comment the default one. It makes the backend container run a process that does "nothing", but keeps the container alive. That allows you to get inside your running container and execute commands inside, for example a Python interpreter to test installed dependencies, or start the development server that reloads when it detects changes.

To get inside the container with a `bash` session you can start the stack with:

```console
$ docker compose watch
```

and then `exec` inside the running container from another terminal:

```console
$ docker compose exec backend bash
```

You should see an output like:

```console
root@7f2607af31c3:/app#
```

that means that you are in a `bash` session inside your container, as a `root` user, under the `/app` directory, this directory has another directory called "app" inside, that's where your code lives inside the container: `/app/app`.

There you can use the `fastapi run --reload` command to run the debug live reloading server.

If there's a syntax error, it will just stop with an error. But as the container is still alive and you are in a Bash session, you can quickly restart it after fixing the error, running the same command ("up arrow" and "Enter").

...this previous detail is what makes it useful to have the container alive doing nothing and then, in a Bash session, make it run the live reload server.

### Backend tests

To test the backend run:

```bash
source .venv/bin/activate
cd backend
bash scripts/test.sh
```

The tests run with Pytest, modify and add tests to `./backend/app/tests/`.

#### Test running stack

If your stack is already up and you just want to run the tests, you can:

* Run the DB migrations:

```bash
docker compose run backend bash scripts/prestart.sh
```

Then run the tests:

```bash
docker compose exec backend bash scripts/tests-start.sh
```

That `app/scripts/tests-start.sh` script just calls `pytest` after making sure that the rest of the stack is running. If you need to pass extra arguments to `pytest`, you can pass them to that command and they will be forwarded.

For example, to stop on first error:

```bash
docker compose exec backend bash scripts/tests-start.sh -x
```

#### Test Coverage

When the tests are run, a file `htmlcov/index.html` is generated, you can open it in your browser to see the coverage of the tests.

### Migrations

After you load your virtual environment and install dependencies, you can run the migrations with `alembic` commands.

Make sure you create a "revision" of your models and that you "upgrade" your database with that revision every time you change them. As this is what will update the tables in your database. Otherwise, your application will have errors.

* Alembic is already configured to import your SQLModel models from `./backend/app/models.py`.

* After changing a model (for example, adding a column), inside the container, create a revision, e.g.:

```console
$ alembic revision --autogenerate -m "Add column last_name to User model"
```

* Commit to the git repository the files generated in the alembic directory.

* After creating the revision, run the migration in the database (this is what will actually change the database):

```console
$ alembic upgrade head
```

## Lint and Format

There are two scripts you can use to manually lint and format the backend code.

Format:

```bash
cd backend
bash scripts/format.sh
```

Lint:

```bash
cd backend
bash scripts/lint.sh
```
