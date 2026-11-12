#!/usr/bin/env bash
# Encrypted PostgreSQL backup for Konvo.
#
#   pg_dump | gzip | openssl AES-256-CBC+PBKDF2  →  $BACKUP_DIR/*.sql.gz.enc
#
# Optionally copies the encrypted dump off-server via BACKUP_REMOTE:
#   s3://bucket/prefix/   → aws s3 cp
#   user@host:/path/      → scp
#   host:/path/           → scp (current user)
#
# Required env:
#   DATABASE_URL        postgres connection string (or PG* vars)
#   BACKUP_PASSPHRASE   passphrase for encryption — store in a secret manager,
#                       NEVER in the repo or on the server in plaintext
#
# Optional env:
#   BACKUP_DIR=./backups
#   BACKUP_REMOTE=       off-server destination (see above)
#   BACKUP_RETENTION_DAYS=30
#
# Restore (see README → Backup & restore):
#   openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_PASSPHRASE \
#     -in dump.sql.gz.enc | gunzip | psql "$DATABASE_URL"
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE is required}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/konvo-$TS.sql.gz.enc"

mkdir -p "$BACKUP_DIR"

echo "[backup] dumping $DATABASE_URL -> $OUT"
pg_dump "$DATABASE_URL" --no-owner --no-privileges \
  | gzip -9 \
  | openssl enc -aes-256-cbc -pbkdf2 -salt -pass env:BACKUP_PASSPHRASE \
      -out "$OUT"

# Sanity: file must be non-trivial and actually encrypted (not plaintext SQL).
SIZE="$(stat -c%s "$OUT" 2>/dev/null || stat -f%z "$OUT")"
if [ "$SIZE" -lt 1024 ]; then
  echo "[backup] ERROR: output suspiciously small ($SIZE bytes) — aborting" >&2
  rm -f "$OUT"
  exit 1
fi
if head -c 15 "$OUT" | grep -qi "postgresql\|CREATE\|COPY"; then
  echo "[backup] ERROR: output does not look encrypted — aborting" >&2
  rm -f "$OUT"
  exit 1
fi
echo "[backup] wrote $OUT ($SIZE bytes)"

if [ -n "${BACKUP_REMOTE:-}" ]; then
  case "$BACKUP_REMOTE" in
    s3://*)
      echo "[backup] copying to $BACKUP_REMOTE"
      aws s3 cp "$OUT" "$BACKUP_REMOTE/"
      ;;
    *)
      DEST="${BACKUP_REMOTE%/}/$(basename "$OUT")"
      echo "[backup] copying to $DEST"
      scp -q "$OUT" "$DEST"
      ;;
  esac
fi

# Local retention — off-server copies are the durable ones.
find "$BACKUP_DIR" -name 'konvo-*.sql.gz.enc' -mtime "+$RETENTION_DAYS" -delete
echo "[backup] done"
