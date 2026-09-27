---
title: JavaScript Playground Guide
description: Write JavaScript with syntax highlighting and run it in the page, reading its
  console output, return value and timing.
date: '2026-09-27'
tags:
- web
tool_guide_slug: javascript-playground
broader_guide:
  title: Browser Debugging Utilities
  url: /guides/browser-debugging/
---

A console for trying JavaScript without leaving the page, built on the Monaco editor — the same editor that powers Visual Studio Code — so the code gets syntax highlighting, bracket matching, code folding and a formatter. Write or paste a snippet, press Run, and see everything it logs, the value it returns and how long it took. Monaco is a large bundle, so it is fetched from a CDN only when you press Enable Monaco; until then, and if the fetch fails, the page uses a plain text area with the same run, copy, download and clear actions. Nothing you type is ever sent anywhere.

## Open the tool

[Use JavaScript Playground](/tools/javascript-playground/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does the Monaco editor not appear straight away?

Monaco is several megabytes, so loading it on every visit would slow the page down for people who only want a quick text box. It is fetched on demand when you press Enable Monaco. Until then a plain text area is used, and it keeps working if the fetch fails.

### Can I use top-level await?

Yes. The snippet is wrapped in an async function, so await works at the top level and return gives back a value. That also means you do not need to wrap everything in an async IIFE yourself.

### Is the code sandboxed?

No. It runs in the page with the page's own privileges, exactly like the browser's developer console. That keeps it simple and lets it touch real APIs, but it also means you should only run code you trust.

### Why did my console.log output not appear?

Only output produced while the snippet runs is captured, and the snippet has to finish for the run to end. If it throws, the error is shown instead and anything logged before the throw is still listed.

### Can I edit other languages?

The playground is for JavaScript, so the editor stays in JavaScript mode. The plain text area still holds whatever you paste, but the highlighting and the formatter are the JavaScript ones.

### Does it remember my code between visits?

The editor starts from a small example each time. If you want to keep a snippet, use Copy before you leave, or paste it into your own notes.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
