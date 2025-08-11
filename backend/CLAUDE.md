# CLAUDE.md

## Backend Development

- Use modern Python 3.12+ syntax
- Use type annotations for inputs and outputs of functions
- Use Pydantic models for data validation
- Use SQLModel for database models
- Use pytest for testing
- Avoid mocking if possible
- Use `pathlib` instead of `os.path` and `open()` when possible
- Do not use a shebang line in Python scripts
- When writing FastAPI or Typer code, use `Annotated`
- Handle logs with LogFire
- Handle errors with Sentry

```bash
# Install dependencies (from project root)
uv sync --all-packages
source .venv/bin/activate

# Work from the backend directory
cd backend

# Add a new package for the backend
uv add <package-name>

# Run backend locally
uv run fastapi dev

# Run tests
uv run bash scripts/test.sh

# Format code
uv run bash scripts/format.sh

# Lint code
uv run bash scripts/lint.sh

# Database migrations
uv run alembic revision --autogenerate -m "Description of change"
uv run alembic upgrade head
```
