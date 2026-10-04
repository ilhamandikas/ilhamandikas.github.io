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
about: Compute MD5, SHA-1, SHA-256 and SHA-512 for a file in your browser, then check the
  result against a hash you were given. The file is read locally and never uploaded. Pasting
  a published digest — including a whole sha256sum line — turns the result into a verdict
  rather than a row of hex for you to compare by eye, and re-pasting a different digest re-compares
  without reading the file again.
faq:
- q: Is MD5 still worth using?
  a: An MD5 value may still help spot an accidental transfer error if that is the only digest
    you have, but it is not strong evidence against deliberate tampering. Prefer a trusted
    SHA-256 or SHA-512 digest when security matters. The tool offers older algorithms so you
    can compare what a publisher actually supplied; it does not make them safe.
- q: Why is SHA-512 off by default?
  a: Because it is rarely the one published, and every algorithm you tick is another pass
    over the file. All four can be ticked at once if you want them; the checkboxes only control
    which rows are computed.
- q: What happens with a very large file?
  a: The page reads the file into memory. It warns when a file is over 256 MB, but **does
    not enforce** a 256 MB limit. A large file may work on one device and fail on another.
    If it fails, use a local command such as `sha256sum` and compare against a digest from
    a source you trust.
- q: I pasted a hash and it said the lengths are not comparable. What does that mean?
  a: That the digest you pasted is a different length from every algorithm currently ticked,
    so the two cannot be compared at all. Calling that a mismatch would be a false accusation
    against the file, so the page says which of the two situations you are in and tells you
    to tick the matching algorithm.
---

A file hash is a short fingerprint made from the file's **bytes**. If even one byte changes, the fingerprint usually changes too. [File Hash Checker](/tools/file-hash-checker/) lets you compare a downloaded file with a digest published by its source.

## Compare a download with its published SHA-256

1. Get a file and its **SHA-256** digest from a source you trust. Keep the original digest page open; a hash copied from the same untrusted download is not independent proof.
2. Open the tool and choose the downloaded file under **File**. Leave **SHA-256** checked. Wait for **Done.**, then find the **SHA-256** row under **Hashes**.
3. Paste the source's digest into **Expected hash**. The tool accepts a bare digest or a whole `sha256sum` line. If it says **Match**, the bytes it read agree with the digest you pasted. If it says **No match**, check that you chose the right file and copied the right digest; do not install a file you did not expect.

**Uppercase** only changes how letters in the digest look. **Copy all** and **Download as text** export the calculated hashes, not the file. If you have only a SHA-512 digest, tick **SHA-512** so the tool computes something of the same kind to compare.

## What a match does not prove

A matching hash is useful only if you trust where the expected digest came from. If an attacker could replace both the download and the published digest, the two could still match. This tool reads the chosen file in your browser; it does not upload the file. The file has to fit in the browser's memory, so if hashing fails on a large download, try a local command such as `sha256sum` rather than trusting an unfinished comparison.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
