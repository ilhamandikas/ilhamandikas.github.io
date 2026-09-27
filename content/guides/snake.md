---
title: Snake Guide
description: Steer a growing snake to eat food without hitting the walls or yourself.
date: '2026-09-27'
tags:
- games
tool_guide_slug: snake
broader_guide:
  title: Browser Games and Practice Tools
  url: /guides/browser-games-and-practice-tools/
---

A grid Snake that runs entirely in the page. Steer with the arrow keys or WASD, or the on-screen pad on touch. The snake starts on your first turn, grows by one each time it eats, and speeds up as the score rises. The game ends on a wall or on the snake's own body, and Space pauses. The best score is kept on this device.

## Open the tool

[Use Snake](/tools/snake/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### When does the snake start moving?

Only after your first direction, so the page never starts a game you did not ask for. After that the snake keeps moving in its current direction until you turn or pause.

### Why can't I reverse direction?

Turning straight back into your own neck would end the game instantly, so a 180-degree turn is ignored. Press a perpendicular direction first and then the reverse if you really need to double back.

### How does the speed work?

Each food makes the step delay a little shorter, down to a floor so the game stays playable. That means the longer you survive, the less time you have to react — the difficulty is the growth, not a separate setting.

### Does eating count on the tail cell?

No. The cell the tail is about to leave is treated as free, so following your own tail closely is safe as long as you keep moving. Only the body that stays behind blocks you.

### Where is my best score stored?

In this browser's local storage, tied to this page. It is never uploaded and disappears if you clear site data.

## Related guide

For more background, read [Browser Games and Practice Tools](/guides/browser-games-and-practice-tools/).
