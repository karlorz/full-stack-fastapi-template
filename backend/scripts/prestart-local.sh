#! /usr/bin/env bash

set -e
set -x

echo "Running prestart-local.sh"

python -m app.nats_prestart

# Execute prestart
bash scripts/prestart.sh
