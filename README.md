# Konvo CRM

Multi-channel customer inbox: WhatsApp, Telegram, web widget, email — with
contacts, groups, templates, broadcasts, campaigns, leads, calls, automation,
team RBAC and outbound webhooks.

- `backend/` — Fastify + Prisma + BullMQ API (`/api`), widget script at `/widget.js`
- `frontend/` — React + Vite + TanStack Query SPA
- `scripts/backup.sh` — encrypted `pg_dump` backups

## Quickstart

```bash
cp backend/.env.example backend/.env   # fill in JWT_SECRET, ENCRYPTION_KEY
npm --prefix backend install
npm --prefix frontend install

# Postgres + Redis (any local instances on the ports in .env work)
npm --prefix backend run db:deploy    # apply migrations
npm --prefix backend run db:seed      # optional demo data

npm --prefix backend run dev          # API on :4000
npm --prefix frontend run dev         # UI on :3000
```

Or everything at once: `docker compose up --build` (set `JWT_SECRET` and
`ENCRYPTION_KEY` in a root `.env` first — see `backend/.env.example`).

## Deploy to a VPS

Follows `VPS_DEPLOYMENT_PLAYBOOK`: one folder (`/opt/konvo`), one compose
project, one docker network. Postgres, Redis, the API and the frontend run
in containers; nginx is the only public port. (Jenkins already runs on this
VPS separately — it is not part of this stack.)

```bash
# 1. On the VPS:
cd /opt && git clone <repo-url> konvo && cd konvo

# 2. Check the ports are free:
sudo ss -tlnp | grep -E '8531|8012|3612'   # must print nothing

# 3. Configure
cp .env.example .env && nano .env          # chmod 600 .env
#    Fill in: POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET, ENCRYPTION_KEY
#    (openssl rand -hex 24 / -hex 32), FRONTEND_URL, PUBLIC_URL, CORS_ORIGIN
#    — all http://<vps-ip>:8531 for IP:port access.
#    Keep COOKIE_SECURE=false on plain HTTP or login cookies are rejected.

# 4. Build and start
docker compose up -d --build
docker compose ps

# 5. Check it
curl http://127.0.0.1:8531/health    # {"status":"ok"}
curl http://127.0.0.1:8531/ready     # 200 only when Postgres + Redis answer
# Browser: http://<vps-ip>:8531
```

How traffic flows: `nginx.conf` (mounted as the container's full
`/etc/nginx/nginx.conf`) listens on :8531 and routes `/api/*`, `/widget.js`,
`/health` and `/ready` to the backend, everything else to the frontend — a
**single origin**, so the httpOnly auth cookies stay first-party. It uses
`Host $http_host` (keeps the port) and SSE is unbuffered. Postgres and Redis
have **no host port at all** — they live only on `konvo_network`.
Backend/frontend are additionally published on `127.0.0.1:8012`/`3612` for
debugging.

Notes:

- `JWT_SECRET`, `ENCRYPTION_KEY`, `POSTGRES_PASSWORD` and `REDIS_PASSWORD`
  are required — compose refuses to start without them, and the backend
  refuses placeholder secrets in production. DB/Redis passwords must be
  hex/alphanumeric (they're interpolated into connection URLs).
- `prisma migrate deploy` runs automatically on every backend container
  start, so redeploys apply pending migrations.
- Redis uses AOF persistence; Postgres uses the `konvo_postgres_data` volume.
- Backups: since the DB has no host port, dump via compose:
  `docker compose exec -T db pg_dump -U konvo konvo | gzip > backup.sql.gz`
  (or `scripts/backup.sh` with `DATABASE_URL` pointed through an SSH tunnel /
  `docker compose exec`).
- Updates: `git pull && docker compose up -d --build --force-recreate`;
  frontend changes need `docker compose build --no-cache frontend`.
- To put the app behind a domain + HTTPS later: follow playbook §10 — add a
  server block on the host nginx for your domain proxying to
  `127.0.0.1:8531`, then set `COOKIE_SECURE=true` and update the
  `*_URL`/`CORS_ORIGIN` values to `https://…`.

## Health probes

| Endpoint | Meaning | Use for |
|---|---|---|
| `GET /health` | process is up (no dependency checks) | liveness / restart decisions |
| `GET /ready` | Postgres `SELECT 1` **and** Redis `PING` answer | load-balancer / deploy readiness |

`/ready` returns `503` with per-check status when a dependency is down, and is
also mounted under `/api/ready` for compatibility.

## Configuration

All backend env vars are documented in `backend/.env.example`. Notable:

- `JWT_SECRET`, `ENCRYPTION_KEY` — required; production refuses placeholder values.
- `CORS_ORIGIN` — comma-separated browser origins allowed to call the API.
- `SENTRY_DSN` — optional; error reporting is fully disabled when unset.
- `LOG_LEVEL` — pino level, default `info`.
- `WIDGET_LEGACY_VISITOR_ID` — `false` (default) requires signed widget visitor
  tokens; `true` is a migration grace period only.
- `PUBLIC_URL`, `FRONTEND_URL`, `SMTP_*` — provider webhook registration and
  transactional email.

## Website chat widget

Settings → Website Chat Widget shows the install snippet. The script is served
at `GET /widget.js` with `Cross-Origin-Resource-Policy: cross-origin`,
`X-Content-Type-Options: nosniff`, an `ETag` and a 5-minute public cache — it is
embeddable from any customer site via a plain `<script>` tag.

Visitor identity uses short-lived signed tokens issued by
`POST /api/webhooks/web/:accountId/token`; allowed domains are enforced via the
workspace `widgetAllowedDomains` list (Origin header).

> Note: widget appearance controls (colors, enable toggle) in the UI are
> currently local-only — they are **not** persisted yet.

## Backups

`scripts/backup.sh` runs `pg_dump`, compresses, and encrypts with
AES-256-CBC + PBKDF2 (openssl) before writing `$BACKUP_DIR/konvo-<ts>.sql.gz.enc`.
Set `BACKUP_REMOTE` (`s3://bucket/prefix` or `user@host:/path`) to copy the
encrypted dump off the server — **the passphrase is the only thing protecting
the data, so keep it in a secret manager, not on the server**. Local copies
older than `BACKUP_RETENTION_DAYS` (default 30) are pruned.

Cron example (daily, 03:15):

```cron
15 3 * * * cd /opt/konvo && BACKUP_PASSPHRASE=$(cat /etc/konvo/backup-pass) DATABASE_URL=$(cat /etc/konvo/db-url) BACKUP_REMOTE=s3://my-bucket/konvo scripts/backup.sh >> /var/log/konvo-backup.log 2>&1
```

### Restore

```bash
# 1. Decrypt + decompress + load into a target database
openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_PASSPHRASE \
  -in konvo-20261112T031500Z.sql.gz.enc \
  | gunzip | psql "$DATABASE_URL"

# 2. Apply any migrations newer than the dump
npm --prefix backend run db:deploy
```

Test a restore at least once per release: spin up a scratch Postgres,
`createdb konvo_restore`, run the pipeline above, then point a backend at it and
hit `/ready` + log in.

## Logging & error reporting

- Request logs are pino JSON. Redaction covers authorization/cookie headers,
  passwords, tokens (access/refresh/visitor/widget/API keys), TOTP secrets,
  emails, phone numbers, contact notes and message bodies — at any object depth.
- `SENTRY_DSN` enables Sentry; events pass through the same scrubber (key-based
  redaction plus email/phone/JWT patterns inside strings) and
  `sendDefaultPii` is off. Without a DSN the SDK is never initialized.
- Outbound mail logs the subject only — recipient addresses are never logged.

## CI

`.github/workflows/ci.yml` runs, per push/PR:

- backend: `npm ci` → `prisma migrate deploy` on a **fresh** database →
  `migrate deploy` on a database restored to the **previous** schema (all but
  the newest migration applied by hand, then `migrate resolve --applied`) →
  typecheck, lint, vitest (serial — tests share one Postgres).
- frontend: typecheck, lint, tests.

## Security notes

- Outbound webhook URLs are validated by an SSRF guard (`src/lib/ssrf.ts`):
  https only, port 443 only, DNS must resolve exclusively to public addresses
  (loopback/private/link-local/CGNAT/multicast/reserved rejected, IPv6 incl.
  IPv4-mapped). At delivery time the resolved IPs are **pinned** via a custom
  undici `lookup`, closing the DNS-rebinding window; redirects are not
  followed.
- Channel credentials and webhook secrets are AES-256-GCM encrypted at rest
  (`ENCRYPTION_KEY`).
- Widget endpoints are rate-limited per IP and require the workspace widget
  token plus a signed visitor token.
- Graceful shutdown: SIGINT/SIGTERM drains Fastify, closes BullMQ workers,
  disconnects Prisma and flushes Sentry, with a 15s force-exit backstop.

## Known gaps / roadmap

- Widget appearance settings are not yet persisted (see above).
- Webhook delivery retries are fixed-interval; no dead-letter UI yet.
- S3 lifecycle/rotation policies for `BACKUP_REMOTE` are your cloud config.
