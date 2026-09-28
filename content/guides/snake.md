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

[Snake](/tools/snake/) is a grid game: steer toward the food without hitting a wall or the snake's body. Each food adds one segment and one point. The game runs in your browser; only the **Best** score is stored locally.

## Start and pause a round

Open the tool. **Score** starts at `0`, and the snake is not moving yet. Press **Up** (arrow key, `W`, or the on-screen ▲ button) to start in that direction. The snake continues moving even if you do not press another key. **Pause** stops it; the button becomes **Resume**. Press **New game** to reset the current score and position while keeping **Best**. Pressing Space also pauses or resumes.

The snake starts facing right and ignores an immediate left turn, since that would reverse into its body. Avoid the edges and steer toward the food square. The step interval gets shorter as your score rises, so plan the next turn early. **Best** survives a reload in this browser's local storage but is not synchronized across devices.

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
