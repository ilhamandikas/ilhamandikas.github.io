---
title: Random Generator Guide
description: Pick from a list with a spin wheel, slot machine, random card, dice or ticker
  animation.
date: '2026-09-27'
tags:
- math
tool_guide_slug: random-generator
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Pick one or more random items from a list, with a choice of simple animations: spin wheel, slot machine, random card, dice roll or ticker. The draw uses the browser's crypto random source and runs entirely on the page, so your list is not uploaded. Turn off "No duplicates" if the same item is allowed to win more than once.

## Open the tool

[Use Random Generator](/tools/random-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is the animation deciding the result?

No. The result is picked with crypto.getRandomValues, then the animation is only a reveal. That keeps the draw fair even if the animation frame rate changes.

### Can I pick multiple winners?

Yes. Increase the Pick number. With No duplicates enabled, an item can appear only once and the count is capped by the number of items in the list.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
