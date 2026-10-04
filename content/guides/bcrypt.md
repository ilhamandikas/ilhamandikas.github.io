---
title: bcrypt Guide
description: Hash a password with bcrypt, or verify one against a hash.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: bcrypt
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
about: Hash a password with bcrypt, or verify a password against an existing bcrypt hash.
  The cost factor controls how much work each hash takes, and that expense is the whole point.
faq:
- q: Which cost factor should I use?
  a: Test the cost on the system that will verify the passwords, and follow your application's
    current security policy. Higher costs take more work. **This tool does not measure or
    report hash duration**, so it cannot choose a cost for your server. Cost `4` in the example
    above is for learning only.
- q: Why does the same password give a different hash every time?
  a: Because bcrypt generates a random salt per hash and stores it inside the result. That
    is what stops two users who chose the same password from having the same hash.
---

**bcrypt** turns a password into a value a server can store instead of storing the password itself. It also checks whether a password matches an existing bcrypt hash. [bcrypt](/tools/bcrypt/) shows both operations with test text in your browser.

## Try a throwaway password

Set **Mode** to **Hash** and **Cost** to `4` for this small demonstration. Type `demo-only` in **Text**, then choose **Run**. **Result** should begin with something like `$2a$04$` or `$2b$04$`. It will **not** be identical every time: bcrypt adds a new random salt for each hash.

Copy the result into **Hash to compare**. Switch **Mode** to **Compare** and choose **Run** again with `demo-only` still in **Text**. The result should say `match`. Change **Text** to `different` and run again; it should say `no match`. The stored hash contains what bcrypt needs to check the password; you do not have to supply the salt separately.

## Do not use the demo settings for a real login

Cost `4` keeps this walkthrough quick, not secure by default for your server. A higher cost uses more work per check; choose it through testing on your **own** system and according to your security requirements. Do not paste a real user's password here. Although processing is local, the text remains visible on screen and can end up in your clipboard.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
