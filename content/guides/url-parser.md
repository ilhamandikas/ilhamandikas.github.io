---
title: URL Parser Guide
description: Break a URL into its parts and query parameters.
date: '2026-09-27'
tags:
- web
tool_guide_slug: url-parser
broader_guide:
  title: Writing and Publishing Text for the Web
  url: /guides/writing-for-the-web/
about: Break a URL into its parts — scheme, host, port, path, query parameters and fragment
  — and show each one both raw and decoded. It is the quickest way to see what a tracking-heavy
  link is really carrying.
faq:
- q: Why is each parameter shown twice?
  a: The **Query** row shows the encoded query as part of the URL. Individual **Param** rows
    show decoded values. Not every URL part gets a raw-and-decoded pair.
- q: Why does a repeated parameter appear twice in the list?
  a: Because it is genuinely there twice. Repeated parameters are legal and often significant,
    so every occurrence is kept rather than the last one winning.
---

A URL is a web address made of pieces. The **protocol** tells the browser how to connect; the **host** names where to go; the **path** points to a page. A **query** can carry extra values. [URL Parser](/tools/url-parser/) lists those pieces so you can read them separately.

## Take apart a safe example

Replace the text in **URL** with `https://example.com/docs?q=hello%20world#intro`. Look for:

- **Protocol:** `https:` — use HTTPS.
- **Hostname:** `example.com` — the named host.
- **Pathname:** `/docs` — the path on that host.
- **Query:** `?q=hello%20world` — the query exactly as it appears in the URL.
- **Param · q:** `hello world` — the browser has decoded `%20` into a space.
- **Hash:** `#intro` — the fragment, often used to point to part of a page.

The results update as you type. Nothing is fetched: this tool reads the address as text. A **Valid URL** result means its shape can be parsed; it does not mean the website exists or is safe to visit.

## If it says the URL is invalid

Type the full address, including `https://`. `example.com/docs` alone is not an absolute URL for this tool. Do not paste a link containing a live password or token into a shared screenshot. A URL's query can appear in browser history and server logs.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Writing and Publishing Text for the Web](/guides/writing-for-the-web/).
