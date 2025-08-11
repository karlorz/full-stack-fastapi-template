# CLAUDE.md

Claude Code guidelines.

## Project Overview

FastAPI Cloud is a platform for deploying FastAPI applications to the cloud with automatic container builds and Kubernetes deployments. The project consists of a FastAPI backend, React frontend, and infrastructure components for managing deployments.

## Environment Variables

The application uses `.env` files for configuration:

- `.env`: Main configuration file
- `.env.override`: Local overrides (not committed)
