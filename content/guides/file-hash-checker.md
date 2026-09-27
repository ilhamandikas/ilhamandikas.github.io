---
title: File Hash Checker Guide
description: Hash a file with MD5, SHA-1, SHA-256 and SHA-512, and check it against a published
  digest.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: file-hash-checker
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Compute MD5, SHA-1, SHA-256 and SHA-512 for a file in your browser, then check the result against a hash you were given. The file is read locally and never uploaded. Pasting a published digest — including a whole sha256sum line — turns the result into a verdict rather than a row of hex for you to compare by eye, and re-pasting a different digest re-compares without reading the file again.

## Open the tool

[Use File Hash Checker](/tools/file-hash-checker/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is MD5 still worth using?

For checking that a download arrived intact, yes, and it is still what a lot of publishers list. For anything where someone might have a reason to give you a file that differs from the one you asked for, no — MD5 and SHA-1 are both broken for that purpose and collisions can be constructed deliberately. Use SHA-256 for anything security-related. The page offers all four because the digest you were given decides which one you need, not the other way round.

### Why is SHA-512 off by default?

Because it is rarely the one published, and every algorithm you tick is another pass over the file. All four can be ticked at once if you want them; the checkboxes only control which rows are computed.

### What happens with a very large file?

It is hashed in chunks, so memory does not grow with the file — but there is a 256 MB ceiling, and the page states it up front rather than failing halfway. Beyond that, use sha256sum on the command line, which is faster and has no such limit.

### I pasted a hash and it said the lengths are not comparable. What does that mean?

That the digest you pasted is a different length from every algorithm currently ticked, so the two cannot be compared at all. Calling that a mismatch would be a false accusation against the file, so the page says which of the two situations you are in and tells you to tick the matching algorithm.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
