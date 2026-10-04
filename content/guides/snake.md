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
about: A grid Snake that runs entirely in the page. Steer with the arrow keys or WASD, or
  the on-screen pad on touch. The snake starts on your first turn, grows by one each time
  it eats, and speeds up as the score rises. The game ends on a wall or on the snake's own
  body, and Space pauses. The best score is kept on this device.
faq:
- q: When does the snake start moving?
  a: Only after your first direction, so the page never starts a game you did not ask for.
    After that the snake keeps moving in its current direction until you turn or pause.
- q: Why can't I reverse direction?
  a: Turning straight back into your own neck would end the game instantly, so a 180-degree
    turn is ignored. Press a perpendicular direction first and then the reverse if you really
    need to double back.
- q: How does the speed work?
  a: Each food makes the step delay a little shorter, down to a floor so the game stays playable.
    That means the longer you survive, the less time you have to react — the difficulty is
    the growth, not a separate setting.
- q: Does eating count on the tail cell?
  a: No. The cell the tail is about to leave is treated as free, so following your own tail
    closely is safe as long as you keep moving. Only the body that stays behind blocks you.
- q: Where is my best score stored?
  a: In this browser's local storage, tied to this page. It is never uploaded and disappears
    if you clear site data.
---

[Snake](/tools/snake/) is a grid game: steer toward the food without hitting a wall or the snake's body. Each food adds one segment and one point. The game runs in your browser; only the **Best** score is stored locally.

## Start and pause a round

Open the tool. **Score** starts at `0`, and the snake is not moving yet. Press **Up** (arrow key, `W`, or the on-screen ▲ button) to start in that direction. The snake continues moving even if you do not press another key. **Pause** stops it; the button becomes **Resume**. Press **New game** to reset the current score and position while keeping **Best**. Pressing Space also pauses or resumes.

The snake starts facing right and ignores an immediate left turn, since that would reverse into its body. Avoid the edges and steer toward the food square. The step interval gets shorter as your score rises, so plan the next turn early. **Best** survives a reload in this browser's local storage but is not synchronized across devices.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser Games and Practice Tools](/guides/browser-games-and-practice-tools/).
