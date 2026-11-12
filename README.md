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
