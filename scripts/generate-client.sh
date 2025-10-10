#! /usr/bin/env bash

set -e
set -x

cd backend

# Check if virtual environment exists and activate it
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../openapi.json
cd ..
mv openapi.json frontend/
cd frontend
npm run generate-client