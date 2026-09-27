---
title: URL Encoder Guide
description: Percent-encode and decode URL components.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: url-encoder
broader_guide:
  title: Writing and Publishing Text for the Web
  url: /guides/writing-for-the-web/
---

A web address can contain small pieces called *parameters*. For example, the value after `?q=` in `https://example.com/search?q=tea` is a search term. Some characters in a parameter need a special spelling so they are not mistaken for parts of the address. [URL Encoder](/tools/url-encoder/) spells those characters with `%` and two digits.

## Encode a search term

1. Type `red & blue` in **Text or URL**. Leave **Decode instead of encode** off.
2. The **Result** should be `red%20%26%20blue`. `%20` stands for a space; `%26` stands for `&`.
3. Turn on **Decode instead of encode** and paste `red%20%26%20blue` into the input. You should see `red & blue` again.

The result updates as you type. This tool uses `encodeURIComponent`: it encodes the text you paste as **one piece**. If you are making a search URL, encode only the value `red & blue`, then place the result after `?q=`. Do **not** paste the whole URL to encode it: the `:`, `/`, `?`, and `=` would be changed too, and the result would no longer work as an ordinary web address.

## If decoding shows an error

A percent sign must be followed by two valid hexadecimal digits. `red%2` is incomplete, so fix the input rather than trying to use the broken result. Keep secrets out of URL parameters: addresses can be saved in history and logs.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Should I encode the whole URL or just a parameter?

Usually only the parameter value. This tool encodes its entire input as one component; it has no separate whole-URL mode. To build a URL, encode a value first, then add it after the parameter name.

## Related guide

For more background, read [Writing and Publishing Text for the Web](/guides/writing-for-the-web/).
