---
title: HTTP Header Builder Guide
description: Build a tidy header block from key/value lines, with common security headers
  ready to add.
date: '2026-09-27'
tags:
- network
tool_guide_slug: http-header-builder
broader_guide:
  title: HTTP and API Debugging
  url: /guides/http-api-debugging/
---

[HTTP Header Builder](/tools/http-header-builder/) turns lines such as `Content-Type: application/json` into a tidy block you can copy. Each line has a **name**, a colon, and a **value**. It builds text; it does not send a web request or update a server.

## Build two simple headers

Paste this into **Headers, one per line**:

```text
Content-Type: application/json
X-Demo: hello
```

Under **Header block**, you should see both lines. Tick **X-Content-Type-Options**. A new line, `X-Content-Type-Options: nosniff`, should appear. That checkbox offers a starting value; whether to use a security header depends on your application's needs and configuration.

Try typing `Bad Name: test`. The space makes the header name invalid, so the tool skips that line and shows a warning. Correct it to `X-Bad-Name: test` if you meant to keep it. **Sort by name** changes the order of the output, not the values.

## Before using a header block

This builder uses the **last value** when you repeat the **exact same name**. Names typed with different letter casing may remain as two lines here even though HTTP field names are case-insensitive. Review duplicates yourself. Do not paste a live `Authorization` value into a screenshot, log, or shared example. Copying the block is not the same as safely configuring a web server.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What makes a valid header name?

A header name is an HTTP token: letters, digits and a small set of symbols, with no spaces or colons. The builder checks each name against that rule and reports any line it cannot use instead of guessing what you meant.

### What happens if I list the same header twice?

The last line wins when its name uses exactly the **same spelling and case** as an earlier line. This builder can leave `Content-Type` and `content-type` as separate lines, even though HTTP treats field names case-insensitively. Review the output before using it.

### Which security headers can I add?

HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, a starter Content-Security-Policy, Permissions-Policy and a no-store Cache-Control. They are added only if the builder has not seen the same **case-sensitive name** in your input. Review any duplicate with different capitalization; the offered values are starting points, not a complete security policy.

### Does the page send the headers anywhere?

No. It is a text builder: the input is parsed and the output is written back into the page. Nothing is transmitted, which is safe even when the block contains an Authorization value.

## Related guide

For more background, read [HTTP and API Debugging](/guides/http-api-debugging/).
