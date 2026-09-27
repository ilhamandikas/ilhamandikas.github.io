---
title: HTTP and API Debugging
description: Requests, headers, auth headers, status codes, curl, MIME types, and
  small checks before blaming the API.
date: '2026-09-27'
tags:
- web
aliases:
- /posts/how-to-build-a-basic-auth-header-for-testing/
- /posts/how-to-build-an-http-header-block/
- /posts/how-to-convert-curl-commands-into-code/
- /posts/how-to-look-up-http-status-codes-during-debugging/
- /posts/how-to-read-a-curl-command-before-running-it/
- /posts/how-to-read-http-headers/
- /posts/how-to-test-an-http-request-before-writing-code/
---

An HTTP request asks a server to do something; the response tells you what happened from that server's point of view. Debugging gets easier when you inspect both sides instead of focusing only on the status code.

## Check one layer at a time

Confirm the URL, method, query parameters, headers, and body actually sent. Then read the status, response headers, and response body. A `200` with unexpected JSON is a different problem from a connection failure; a `400` may include a useful validation message.

## Reproduce the smallest failing request

Remove optional fields until you can explain which input changes the outcome. If a browser fails but the same call works from `curl`, compare credentials, origins, cookies, redirects, and preflight behavior. Never share a raw `Authorization` header in a screenshot or reproduction.

## Related tools

- [Basic Auth Header](/tools/basic-auth-generator/) — Build an HTTP Basic Authorization header from a user and password.
- [curl Converter](/tools/curl-converter/) — Convert curl commands into JavaScript fetch, Axios or Python requests code.
- [curl Tester](/tools/curl-tester/) — Parse, explain and rebuild curl commands locally.
- [HTTP Header Builder](/tools/http-header-builder/) — Build a tidy header block from key/value lines, with common security headers ready to add.
- [HTTP Header Parser](/tools/http-header-parser/) — Turn a pasted header block into a clean table, including cookies and repeated fields.
- [HTTP Request Tester](/tools/http-request-tester/) — Send an HTTP request from the page, import it from curl and export it back to curl.
- [HTTP Status Codes](/tools/http-status-codes/) — Reference list of HTTP response status codes and their meaning.
- [MIME Types](/tools/mime-types/) — Look up the MIME type for a file extension.
