#!/bin/bash

BACKUP_DIR="./sanity-data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz"

echo "Exporting Sanity dataset..."
npx sanity dataset export production "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  echo "✅ Backup created successfully: ${BACKUP_FILE}"

  ln -sf "backup-${TIMESTAMP}.tar.gz" "${BACKUP_DIR}/latest.tar.gz"
  echo "✅ Updated latest backup symlink"
else
  echo "❌ Backup failed"
  exit 1
fi
