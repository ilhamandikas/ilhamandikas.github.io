---
title: Base64 Text Guide
description: Encode and decode UTF-8 text to and from Base64, URL-safe optional.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: base64-string-converter
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Base64 changes text into a set of letters and numbers that is easier to carry through systems that expect plain text. It does **not** hide the text. [Base64 Text](/tools/base64-string-converter/) has two boxes: the top turns text into Base64, and the bottom turns it back.

## Try a round trip

1. Type `Hi` into the top **Text** box. The **Base64** box below it should show `SGk=`. The `=` is part of the Base64 format.
2. Copy `SGk=` into the lower **Base64** input. The **Text** output should say `Hi` again. This is a *round trip*: you changed the representation and then changed it back.
3. Try a word with an accent, such as `café`. It should return as the same word after you encode and decode it. The tool handles the text as UTF-8 bytes, so it does not have to throw away the accent.

No button is needed: each output updates as you type. Each **Copy** button copies the result beside it, not the text in the other box.

## If decoding fails

Check that you copied only the Base64 text. A missing character or an extra space inside the string can make it invalid. **URL-safe** changes two characters used by normal Base64 (`+` and `/`) to `-` and `_`; select the matching option when decoding URL-safe input. It is still readable by anyone who decodes it, so do not use Base64 to protect a password or token.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What is URL-safe Base64 for?

Standard Base64 uses + and /, both of which have to be escaped inside a URL. The URL-safe variant swaps them for - and _ so the value can sit in a query string or a filename untouched.

### Is Base64 a form of encryption?

No. It is a reversible encoding with no key, and anyone can decode it. Use the AES tool if you need actual confidentiality.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
