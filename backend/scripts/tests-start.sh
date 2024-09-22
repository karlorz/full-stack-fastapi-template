#! /usr/bin/env bash
# To be run inside of the Docker container

set -e
set -x

python app/tests_pre_start.py

bash scripts/test.sh "$@"
