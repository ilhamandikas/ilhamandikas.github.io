---
title: Text to Binary Guide
description: Convert text to its binary representation and back.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: text-to-binary
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

Computers store text as bytes. A *byte* is eight bits, and each bit is a `0` or `1`. [Text to Binary](/tools/text-to-binary/) shows those bytes, using UTF-8 for the text.

## Try one letter

Open the tool and type `A` in **Text or binary**. Leave **Decode binary to text** off. **Result** should show `01000001`. Count the digits: there are eight, so this is one byte.

Now type `AB`. The result should be `01000001 01000010`. The space is only there to help you see the two bytes. To go back, turn on **Decode binary to text**, replace the input with `01000001 01000010`, and check that the result says `AB`.

## If one character takes more space

Try `é`. In UTF-8, it needs more than one byte, so you will see more than one eight-bit group. This is normal. When decoding, the tool keeps `0` and `1` and ignores other characters in the input. If the number of bits is not a multiple of eight, it reports an error; check that you copied every digit. Binary is a representation of text, **not** a way to keep text secret.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is one character sometimes more than eight bits?

Because it is not ASCII. UTF-8 uses one byte for ASCII characters and up to four for others, so an accented letter or an emoji comes out as two or more groups of eight bits.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
