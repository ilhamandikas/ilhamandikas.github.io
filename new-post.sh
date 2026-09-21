#!/usr/bin/env bash
# Create a new draft post: ./new-post.sh my-post-slug
set -euo pipefail
cd "$(dirname "$0")"
if [ $# -lt 1 ]; then
  echo "usage: $0 <slug>" >&2
  exit 1
fi
hugo new "posts/$1.md"
echo "Edit content/posts/$1.md, set draft: false, then commit and push"
