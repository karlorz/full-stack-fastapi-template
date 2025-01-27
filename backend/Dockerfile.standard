FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

# Install uv
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv:0.4.23 /uv /bin/uv

# Compile bytecode
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#compiling-bytecode
ENV UV_COMPILE_BYTECODE=1

# uv Cache
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#caching
ENV UV_LINK_MODE=copy

# Set up user
RUN useradd --create-home -r user -u 1000

WORKDIR /app/

# When not run with BuildKit, the directory still belongs to root
RUN chown user /app

# Set user by non-root ID for Knative security compatibility
USER 1000

# Place executables in the environment at the front of the path
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#using-the-environment
ENV PATH="/app/.venv/bin:$PATH"

# https://docs.docker.com/reference/dockerfile/#pattern-matching-1
# instead of directly adding the files, we are using the [t] pattern matching
# syntax to ignore the file if it doesn't exist (requirements.tx[t] basically means
# the same as requirements.txt, but if it doesn't exist, it will be ignored by Docker,
# instead of throwing an error).
COPY --chown=user:user requirements.tx[t] pyproject.[t]oml uv.[l]ock /app/

COPY --chown=user:user install_dependencies.sh /app/
# Make the script executable and run it
RUN chmod +x install_dependencies.sh && ./install_dependencies.sh
RUN rm install_dependencies.sh

COPY --chown=user:user . .

CMD ["sh", "-c", "fastapi run --host 0.0.0.0 --port ${PORT:-8000}"]
