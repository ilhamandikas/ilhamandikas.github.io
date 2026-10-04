---
title: Token Generator Guide
description: Generate random tokens and passwords of a chosen length and charset.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: token-generator
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
about: Generate random tokens and passwords of a chosen length from a chosen character set,
  drawn from the browser's cryptographic random source. Useful for API keys, session secrets
  and share links.
faq:
- q: How long should a token be?
  a: For a machine-generated secret, 32 characters from a mixed alphabet is about 190 bits
    of entropy, which is far past brute force. Length buys you more than character variety
    does.
- q: Is Math.random good enough for this?
  a: No. Math.random is a fast seeded generator whose output can be predicted from previous
    values. This tool uses crypto.getRandomValues instead.
---

A **token** is a string a program may use as a secret or as an identifier. [Token Generator](/tools/token-generator/) makes random strings using your browser's cryptographic random source. The **output itself** is sensitive if you use it as a real secret.

## Check the controls with throwaway values

Set **How many** to `2` and **Length** to `12`, then choose **Generate**. Under **Tokens**, you should see two lines with twelve characters each. The exact characters are different each time. **a-z**, **A-Z**, and **0-9** are checked by default; **symbols** adds punctuation if you enable it.

If you uncheck everything, this implementation falls back to lowercase letters rather than returning an error. A checked set makes characters *available*; it does not guarantee every generated string contains one character from every selected set. If an application demands a particular character type, inspect the result against that rule.

## Before using a real token

Choose the length and allowed characters your receiving application expects. Store the result in a secret manager or another appropriate place; do not put it in a URL, issue comment, or screenshot. **Copy** puts it on the clipboard, where other software on your device may read it. The generator does not upload the values, but it cannot protect what you do with them afterward.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
