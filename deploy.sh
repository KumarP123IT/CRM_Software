#!/usr/bin/env bash
# Konvo deploy — run on the VPS from the project folder (/opt/konvo).
# Safe to run manually or from Jenkins.
set -euo pipefail
cd "$(dirname "$0")"

[ -f .env ] || { echo "ERROR: .env missing — create it from .env.example first"; exit 1; }
[ -d .git ] || { echo "ERROR: $PWD is not a git clone — deploy.sh expects /opt/konvo to be 'git clone'd"; exit 1; }

echo "==> git pull"
git pull --ff-only

echo "==> docker compose build"
docker compose build

echo "==> docker compose up"
docker compose up -d --force-recreate

echo "==> prune dangling images"
docker image prune -f

echo "==> status"
docker compose ps

echo "==> health"
sleep 5
curl -fsS "http://127.0.0.1:${NGINX_HOST_PORT:-8531}/health" || echo "WARN: /health not answering yet — check: docker compose logs backend --tail=50"
