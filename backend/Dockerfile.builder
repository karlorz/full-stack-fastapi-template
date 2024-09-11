FROM docker:27-dind

WORKDIR /app/

ENV PYTHONUNBUFFERED=1
ENV VIRTUALENV=/app/.venv
ENV PATH="$VIRTUALENV/bin:$PATH"

RUN apk add --no-cache python3 py3-pip

RUN python3 -m venv $VIRTUALENV

# install poetry
RUN pip install poetry

# Copy poetry.lock* in case it doesn't exist in the repo
COPY ./pyproject.toml ./poetry.lock* /app/

# Export the dependencies to a requirements.txt
RUN poetry export --without-hashes --format=requirements.txt > /tmp/requirements.txt

ENV PYTHONPATH=/app

# Install the dependencies
RUN pip install -r /tmp/requirements.txt

COPY Dockerfile.build /app/Dockerfile
COPY builder_entrypoint.sh /app/builder_entrypoint.sh
RUN chmod +x /app/builder_entrypoint.sh

COPY ./app /app/app

EXPOSE 8080
ENTRYPOINT ["/app/builder_entrypoint.sh"]
