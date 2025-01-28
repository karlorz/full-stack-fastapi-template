#!/bin/sh
if [ -f requirements.txt ]; then
    uv venv && uv pip install -r requirements.txt
elif [ -f uv.lock ]; then
    uv venv && uv sync
elif [ -f pyproject.toml ]; then
    uv venv && uv pip install .
else
    uv venv && uv pip install 'fastapi[standard]'
fi
