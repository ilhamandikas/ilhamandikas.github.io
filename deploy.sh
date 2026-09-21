#!/usr/bin/env bash
# Build the Hugo site and publish it to a static web root.
# Usage: run from the target directory, or set SITE_DIR explicitly:
#   cd /srv/www/example && /path/to/ilham-dev/deploy.sh
#   SITE_DIR=/srv/www/example ./deploy.sh
# Optional: SUDO=sudo, OWNER=user:group to chown the published files.
set -euo pipefail

SITE_DIR="${SITE_DIR:-$(pwd)}"
SUDO="${SUDO:-}"
OWNER="${OWNER:-}"
cd "$(dirname "$0")"

if [ "$(realpath -m "$SITE_DIR")" = "$(pwd)" ]; then
  echo "error: SITE_DIR resolves to the project directory; refusing to rsync into it" >&2
  exit 1
fi

echo "==> Building"
hugo --minify --gc

rsync_opts=(-a --delete)
[ -n "$OWNER" ] && rsync_opts+=(--chown="$OWNER")

echo "==> Publishing to $SITE_DIR"
$SUDO rsync "${rsync_opts[@]}" public/ "$SITE_DIR"/

echo "==> Done at $(date -Is)"
