---
title: "Posts"
description: "Notes on backend, servers, infrastructure, and automation — what I build, what breaks, and what I fix."
# Match /tools/: the section emits a JSON registry, a search index and a
# Markdown version; every post emits a Markdown twin of its own.
outputs: ["HTML", "RSS", "PostsJSON", "SearchIndex", "Markdown"]
cascade:
  outputs: ["HTML", "Markdown"]
---
