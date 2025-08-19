# FastAPI Cloud

## URLs

Development frontend dashboard: https://dashboard.fastapicloud.site
Development API: https://api.fastapicloud.site

Staging frontend dashboard: https://dashboard.fastapicloud.work
Staging API: https://api.fastapicloud.work

Production frontend dashboard: https://dashboard.fastapicloud.com
Production API: https://api.fastapicloud.com

## Additional Docs

This project started from: https://github.com/tiangolo/full-stack-fastapi-template

It evolved and many things changed. But some general instructions in that repo might be useful, for example, to edit `.env` files, generate keys, etc.

## Ecosystem initial flow

- Ensure your backend is running by accessing the `/docs` endpoint (example [development](https://api.fastapicloud.site/docs))
- Run `python scripts/use_env.py {env}` (i.e. where `env` = `development`)

## Backend Development

Backend docs: [backend/README.md](./backend/README.md).

## Frontend Development

Frontend docs: [frontend/README.md](./frontend/README.md).

## Development

General development docs: [development.md](./development.md).

This includes using Docker Compose, custom local domains, `.env` configurations, etc.

## Release Notes

Check the file [release-notes.md](./release-notes.md).
