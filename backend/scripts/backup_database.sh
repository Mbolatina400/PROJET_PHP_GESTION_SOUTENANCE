#!/usr/bin/env bash
set -euo pipefail

: "${DB_HOST:?DB_HOST est obligatoire}"
: "${DB_PORT:=3306}"
: "${DB_NAME:?DB_NAME est obligatoire}"
: "${DB_USERNAME:?DB_USERNAME est obligatoire}"
: "${BACKUP_DIR:=./backups}"

mkdir -p "$BACKUP_DIR"
backup_file="$BACKUP_DIR/${DB_NAME}-$(date +%Y%m%d-%H%M%S).sql.gz"
mysqldump --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USERNAME" --single-transaction --routines --events "$DB_NAME" | gzip > "$backup_file"
find "$BACKUP_DIR" -type f -name "${DB_NAME}-*.sql.gz" -mtime +30 -delete
printf 'Backup créé : %s\n' "$backup_file"
