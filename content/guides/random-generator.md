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

[Random Generator](/tools/random-generator/) picks items from a list for you. You can choose how the result is *revealed*—as a wheel, card, or other animation—but the animation is not the list of choices.

## Draw from a short list

Replace **Items** with two lines: `Tea` on the first and `Coffee` on the second. Leave **Pick** at `1` and choose **Generate**. Wait for the animation to finish. Under **Result**, you should see **one** of those two names. Which one appears cannot be predicted, and running it again may pick the same name.

Set **Pick** to `2` and leave **No duplicates** checked. You should see both items, in an unpredictable order. **Mode** changes the animation, not the text you gave it. If you leave **Items** empty, the tool asks you to add at least one item.

## Before using it for a draw

The tool removes a *picked entry* when **No duplicates** is on. If you typed `Tea` on two separate lines, the same word may still appear twice because those are two entries. Check your list for repeated names before a giveaway. Your list stays in the browser, but a public screenshot of the result can still disclose people's names.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is the animation deciding the result?

No. The choice is made before the animation finishes. The tool draws from the browser's cryptographic random source, but this page does not provide a public audit trail or a guarantee of a perfectly unbiased contest. For high-stakes draws, use an independently verifiable process.

### Can I pick multiple winners?

Yes. Increase **Pick**. With **No duplicates**, each *entry* is picked at most once and the result count cannot exceed the entry count. Identical text entered on separate lines still counts as separate entries.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
