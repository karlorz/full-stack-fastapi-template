FROM python:3.13

ENV PYTHONUNBUFFERED=1

# Install Depot CLI
ENV DEPOT_INSTALL_DIR=/usr/local/bin
ENV DEPOT_VERSION=2.88.0
RUN curl -L https://depot.dev/install-cli.sh | sh -s $DEPOT_VERSION


# Install uv
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv:0.8.4 /uv /uvx /bin/

# Compile bytecode
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#compiling-bytecode
ENV UV_COMPILE_BYTECODE=1

# uv Cache
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#caching
ENV UV_LINK_MODE=copy

# Install Docker ClI, only needed for local development
# Ref: https://docs.docker.com/engine/install/debian/
RUN apt-get update && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli

# Install BuildKit CLI
RUN curl -L "https://github.com/moby/buildkit/releases/latest/download/buildkit-v0.23.2.linux-$(dpkg --print-architecture).tar.gz" \
    | tar -xz -C /usr/local

# Set up user
RUN useradd --create-home -r user -u 1000
# Set user by non-root ID for Knative security compatibility
USER 1000

WORKDIR /app/

# Place executables in the environment at the front of the path
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#using-the-environment
ENV PATH="/app/.venv/bin:$PATH"

# Install dependencies
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#intermediate-layers
RUN --mount=type=cache,target=/user/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --all-packages --no-install-package app --no-install-package fastapi-auth

COPY --chown=user:user ./backend/scripts /app/backend/scripts

COPY --chown=user:user ./backend/pyproject.toml ./backend/alembic.ini /app/backend/

COPY --chown=user:user ./backend/app /app/backend/app

COPY --chown=user:user ./packages /app/packages

COPY --chown=user:user ./backend/builder-context /app/backend/builder-context

# Sync the project
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#intermediate-layers
RUN --mount=type=cache,target=/user/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --all-packages

WORKDIR /app/backend/

CMD ["sh", "-c", "fastapi run app/builder/main.py --port ${PORT:-8001}"]
