---
title: User Agent Parser Guide
description: Read the browser, engine, OS and device from a user-agent string.
date: '2026-09-27'
tags:
- web
tool_guide_slug: user-agent-parser
broader_guide:
  title: Browser Debugging Notes
  url: /guides/browser-debugging/
about: Break a user-agent string into browser, version, engine and operating system, and explain
  what each part is for.
faq:
- q: Why is the browser detected wrongly?
  a: Because user-agent strings lie, deliberately. Every browser claims to be Mozilla, and
    some reduce or freeze the rest of the string. Treat any detection as a hint, and feature-detect
    instead whenever you can.
---

A **User-Agent string** is text a browser can send with a web request to describe itself. [User Agent Parser](/tools/user-agent-parser/) searches that text for familiar browser, engine, and operating-system names. It makes a **guess**, not a verified report about the device.

## Try the browser you are using

Choose **Use my browser**. The tool fills **User-Agent string** with the value your browser exposes to this page. Under **Parsed result**, look for **Browser**, **Engine**, **OS**, **Mobile**, and **Bot**. An engine is the software used to process and display web pages. **Unknown** is a possible answer when the tool cannot recognise a field.

You can paste a test string into the input instead. The result changes as you type; **Copy** takes the parsed labels, not the original string.

## Do not use a guess as proof

User-Agent strings can be changed, shortened, or made to look like another browser. A **Mobile: yes** or **Bot: yes** label only means the string matched this tool's simple rules. It does not prove a person is on a phone or that a request came from a real crawler. For a feature on your site, check whether the browser actually supports that feature instead of deciding only from its User-Agent.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser Debugging Notes](/guides/browser-debugging/).
