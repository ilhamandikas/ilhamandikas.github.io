---
title: Password Strength Guide
description: Estimate how long a password would take to crack.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: password-strength
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

A password is harder to guess when it is not obvious or reused. [Password Strength](/tools/password-strength/) shows a **rough estimate**, not a promise that a password is safe. The tool cannot know whether a password was already leaked or whether someone knows your personal details.

## Try a fake password

1. Open the tool and type `password123` in **Password**. Use this only as an example; never use it as a real password.
2. Look at **Strength**. It says **Weak** because the tool recognises the common word `password`, even though numbers were added.
3. Look at **Length** and **Character sets**. They describe what you typed. **Search space**, **Entropy**, and **Time to crack** are estimates made from a simple model; they are not measurements of an attacker.
4. Change the test value and watch what the tool reports. A longer result or a bigger “time” still does not prove the new value is safe if people can guess its pattern.

The field shows what you type in plain text. Do **not** paste a real password where someone can see your screen. This tool calculates in the browser, but your screen and clipboard still matter.

## What to take away

For a real account, use a password manager to make a long, unique password, and turn on an extra sign-in factor when the service offers one. Treat this tool as a way to understand a few signals, not as a test that certifies a password.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does my password score badly?

It may be short or include one of the common words this tool checks. The estimate mostly uses length and character types; it cannot spot every predictable pattern. A high score is not a reason to reuse a password.

### Is my password sent anywhere?

The tool computes its estimate in your browser. Still, the field displays your text openly. Use made-up examples, not a password from a real account.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
