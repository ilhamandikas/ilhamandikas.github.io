---
title: Working With URLs
description: Parsing URLs, encoding query strings, reading slugs, and checking redirected
  or wrapped links.
date: '2026-09-27'
tags:
- web
aliases:
- /posts/how-to-break-a-url-into-parts/
- /posts/how-to-decode-outlook-safelinks-before-clicking/
- /posts/how-to-make-url-slugs-from-titles/
- /posts/how-to-url-encode-text-without-breaking-query-strings/
---

A URL has parts with different jobs: scheme, host, path, query, and fragment. When you encode the whole thing as one string, you can accidentally change where it points.

## Identify the part you are changing

To add a query parameter, encode its name and value rather than encoding the entire URL. A fragment (`#...`) stays in the browser and is not sent in an ordinary HTTP request. Check whether a trailing slash or a change from `http` to `https` matters to the service you are calling.

## Be careful with what you share

URLs can appear in browser history, server logs, screenshots, and referrer information. Do not put passwords or live tokens in a query string. A shortened or decoded link is still just a link: inspect the destination before visiting it.

## Related tools

- [SafeLink Decoder](/tools/safelink-decoder/) — Extract the real destination behind an Outlook SafeLink.
