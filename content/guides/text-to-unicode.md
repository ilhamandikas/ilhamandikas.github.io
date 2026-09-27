---
title: Text to Unicode Guide
description: Show the Unicode code points of a string, and rebuild a string from them.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: text-to-unicode
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

Unicode gives characters numbers called *code points*. [Text to Unicode](/tools/text-to-unicode/) shows those numbers so you can tell similar-looking characters apart. `U+` means the number is written in hexadecimal (base 16).

## Turn a letter into a code point

1. Leave **Direction** on **Text → code points** and type `A` in **Text or code points**. **Result** should show `U+0041`.
2. Change **Direction** to **Code points → text** and replace the input with `U+0041`. The result should show `A` again.
3. Try `AB` in text mode. You should see `U+0041 U+0042`, one number for each of those letters.

The result updates as you type. This is different from **Text to Binary**: one Unicode code point is not necessarily one byte. UTF-8 is one way a computer stores code points as bytes.

## When a character looks strange

A copied space may not be the ordinary space you typed on your keyboard. Put the suspect text in the tool and compare the codes. The tool can show what is there; it cannot decide whether that character belongs in your document. If you paste an invalid code point in decode mode, the tool will report an error rather than invent a replacement.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What is the difference between a code point and a UTF-8 byte?

A code point is the abstract character number. UTF-8 is one particular way of writing that number as bytes, so the same code point can occupy a different number of bytes in a different encoding.

### Why does text I copied have an invisible character in it?

Usually a zero-width space or a non-breaking space picked up from a web page or a word processor. Listing the code points is what makes it visible.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
