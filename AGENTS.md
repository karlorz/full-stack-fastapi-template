# AGENTS.md

This file provides guidance to Agents when working with code in this repository.

## Development Commands

### Full Stack Development

Start the entire stack with hot-reload:
```bash
docker compose watch
```

Stop specific services to run locally:
```bash
docker compose stop backend  # or frontend
```

### Backend Development

Navigate to backend directory first:
```bash
cd backend
```

Install dependencies:
```bash
uv sync
```

Activate virtual environment:
```bash
source .venv/bin/activate
```

Run backend locally (requires PostgreSQL running):
```bash
fastapi dev app/main.py
```

Run backend tests:
```bash
bash scripts/test.sh  # Full Docker test run
docker compose exec backend bash scripts/tests-start.sh  # Quick tests in running stack
docker compose exec backend bash scripts/tests-start.sh -x  # Stop on first error
```

Run pre-commit hooks manually:
```bash
uv run pre-commit run --all-files
```

Format code:
```bash
bash scripts/format.sh
```

Lint code:
```bash
bash scripts/lint.sh
```

### Frontend Development

Navigate to frontend directory first:
```bash
cd frontend
```

Install Node.js version (using fnm or nvm):
```bash
fnm install && fnm use  # or: nvm install && nvm use
```

Install dependencies:
```bash
npm install
```

Run frontend locally:
```bash
npm run dev
```

Build frontend:
```bash
npm run build
```

Lint/format frontend:
```bash
npm run lint
```

Run E2E tests:
```bash
docker compose up -d --wait backend
npx playwright test
npx playwright test --ui  # UI mode
docker compose down -v  # Clean up test data
```

### Client Generation

After modifying backend API endpoints, regenerate the frontend client:
```bash
./scripts/generate-client.sh
```

This extracts the OpenAPI schema from the backend and generates TypeScript client code in `frontend/src/client`.

### Database Migrations

Create a new migration after modifying models in `backend/app/models.py`:
```bash
docker compose exec backend bash
alembic revision --autogenerate -m "Description of change"
alembic upgrade head
```

## Project Layout

```text
.
├── backend/
│   ├── app/
│   ├── scripts/
│   └── tests/
├── frontend/
│   ├── src/
│   ├── tests/
│   └── public/
├── scripts/
├── hooks/
├── img/
├── docker-compose*.yml
└── *.md, copier.yml, LICENSE
```

- `backend/app/` highlights the FastAPI project with `api/`, `core/`, `models.py`, and Alembic migrations under `alembic/`.
- `frontend/src/` contains generated API client (`client/`), Chakra-based UI components, routing definitions, and theming utilities.
- `scripts/` at the root complements backend scripts by wrapping build, deploy, and client generation workflows.
- Supporting assets (`hooks/`, `img/`, configuration YAMLs, and Markdown guides) provide template automation, visuals, and operational documentation.


## Project Overview

Full-stack web application template with FastAPI backend and React frontend, designed for rapid application development with authentication, database management, and deployment ready out of the box.

**Tech Stack:**
- Backend: FastAPI + SQLModel + PostgreSQL
- Frontend: React + TypeScript + Vite + Chakra UI + TanStack Query/Router
- Infrastructure: Docker Compose + Traefik
- Testing: Pytest (backend), Playwright (E2E)

## Architecture

### Backend Structure

- **Entry point**: `backend/app/main.py` creates the FastAPI app
- **API Router**: `backend/app/api/main.py` aggregates all route modules
- **Models**: `backend/app/models.py` contains all SQLModel classes (both Pydantic schemas and DB tables)
  - Pattern: Base → Create/Update schemas → DB table model → Public response schema
  - Example: `UserBase` → `UserCreate`/`UserUpdate` → `User` (table) → `UserPublic`
- **CRUD**: `backend/app/crud.py` contains database operations (create, update, authenticate, etc.)
- **Routes**: `backend/app/api/routes/` organized by resource (users, items, login, utils)
- **Dependencies**: `backend/app/api/deps.py` contains FastAPI dependency injection (DB session, auth)
  - `SessionDep`: Database session dependency
  - `CurrentUser`: Authenticated user dependency
  - `get_current_active_superuser`: Superuser check
- **Config**: `backend/app/core/config.py` uses Pydantic settings from `.env` file
- **Security**: `backend/app/core/security.py` handles JWT tokens and password hashing
- **Migrations**: `backend/app/alembic/` contains database migration files

### Frontend Structure

- **Entry point**: `frontend/src/main.tsx` initializes React app
- **Routing**: `frontend/src/routes/` uses TanStack Router with file-based routing
  - `__root.tsx`: Root layout with error boundary
  - `_layout.tsx`: Authenticated layout wrapper
  - `_layout/`: Protected pages (admin, items, settings, index)
  - Root level: Public pages (login, signup, recover-password, reset-password)
- **API Client**: `frontend/src/client/` is auto-generated from backend OpenAPI schema
- **Components**: `frontend/src/components/` organized by feature and UI primitives
  - `ui/`: Chakra UI wrapper components
  - Feature folders (Admin/, etc.): Feature-specific components
- **Theme**: `frontend/src/theme.tsx` configures Chakra UI theme with dark mode support
- **Hooks**: `frontend/src/hooks/` contains custom React hooks (queries, mutations)

### Authentication Flow

1. User submits credentials to `/api/v1/login/access-token`
2. Backend validates via `crud.authenticate()` in `backend/app/crud.py:40`
3. Returns JWT token (created in `backend/app/core/security.py`)
4. Frontend stores token and includes in subsequent requests
5. Protected endpoints use `CurrentUser` dependency which decodes JWT via `get_current_user()` in `backend/app/api/deps.py:30`

### Database Session Management

FastAPI uses dependency injection for database sessions:
- `get_db()` generator in `backend/app/api/deps.py:21` creates SQLModel sessions
- `SessionDep` type alias provides the session to route handlers
- Sessions auto-commit and close after request completion

### Environment Configuration

- Root `.env` file contains all configuration (backend reads from `../.env`)
- Backend reads via Pydantic settings in `backend/app/core/config.py:26`
- Frontend reads via Vite env vars (prefixed with `VITE_`)
- Docker Compose uses `.env` for container configuration

### Docker Compose Files

- `docker-compose.yml`: Base configuration for all environments
- `docker-compose.override.yml`: Local development overrides (volume mounts, hot-reload)
- `docker-compose.traefik.yml`: Production Traefik configuration

### Local Development URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- API Docs (ReDoc): http://localhost:8000/redoc
- Adminer (DB UI): http://localhost:8080
- Traefik UI: http://localhost:8090
- MailCatcher: http://localhost:1080

### Pre-commit Hooks

Pre-commit runs automatically before each git commit:
- Install: `uv run pre-commit install`
- Runs Ruff (Python), ESLint, Prettier, YAML/TOML checks
- Files must be restaged after auto-formatting

## Common Workflows

### Adding a new model/table
1. Add model classes in `backend/app/models.py` (Base → Create/Update → Table → Public)
2. Add CRUD functions in `backend/app/crud.py` if needed
3. Create migration: `alembic revision --autogenerate -m "Add Model"`
4. Apply migration: `alembic upgrade head`
5. Add API routes in `backend/app/api/routes/`
6. Register router in `backend/app/api/main.py`
7. Regenerate frontend client: `./scripts/generate-client.sh`

### Adding a new API endpoint
1. Create or modify route in `backend/app/api/routes/`
2. Use `SessionDep` for DB access, `CurrentUser` for authenticated user
3. Follow pattern: define response model, use CRUD functions
4. Regenerate frontend client to get TypeScript types

### Adding a new frontend page
1. Create route file in `frontend/src/routes/` (authenticated) or `frontend/src/routes/_layout/` (protected)
2. Use TanStack Query hooks for data fetching
3. Import auto-generated client from `frontend/src/client/`
4. Use Chakra UI components from `frontend/src/components/ui/`
