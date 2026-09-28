---
title: Tetris Guide
description: Stack falling tetrominoes and clear lines, with next-piece preview, hold and
  levels.
date: '2026-09-27'
tags:
- games
tool_guide_slug: tetris
broader_guide:
  title: Browser Games and Practice Tools
  url: /guides/browser-games-and-practice-tools/
---

[Tetris](/tools/tetris/) is a falling-block game: move and rotate four-square pieces to complete horizontal rows. The board is ten columns by twenty rows; a filled row disappears and earns points. This version runs in the browser and uses **keyboard controls**, not an on-screen touch pad.

## Play a first piece

Open the tool. **Score** and **Lines** start at `0`; **Level** starts at `1`. A piece falls automatically. Press **Left** or **Right** to move it, **Up** to rotate, **Down** to drop one row faster, and **Space** to drop it immediately. **Next** shows the upcoming piece; the faint **ghost** shows where the active piece would land. Press **C** to put the piece in **Hold** (once until a piece locks). **P** or **Pause** stops the fall; **New game** resets the board and counters.

Clearing one line earns `100 × level`, while four at once earns `800 × level`; soft and hard drops also add points. The level rises after every ten total cleared lines. If a new piece cannot enter the board, the round ends. There is no saved score, and a phone without a hardware keyboard may not be practical for this game.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How does the piece randomiser work?

It uses a seven-bag: all seven tetrominoes are shuffled into a bag and dealt one at a time, then a new bag is shuffled. That means you never wait more than twelve pieces for a given shape, which is fairer than pure random drops.

### What is the ghost piece?

The faint outline at the bottom of the falling piece. It shows where the piece will come to rest if you hard-drop right now, so you can judge a placement before committing to it.

### How is scoring calculated?

Clearing one line is 100, two is 300, three is 500 and four is 800, multiplied by the current level. Soft-dropping adds one point per row and a hard drop adds two per row. Level rises every ten lines and speeds the fall up.

### What does the hold slot do?

Press C to park the current piece and bring back whatever was in the hold slot, or to pull the piece out of it if the slot was empty. You can hold only once per piece, so it is a way to defer an awkward shape rather than to cycle freely.

### Why is the board made of divs instead of a canvas?

A DOM grid keeps the theme's flat, crisp look at every zoom level, is selectable by the same styling as the rest of the site and needs no drawing code. It also means the game works even where canvas is unavailable.

## Related guide

For more background, read [Browser Games and Practice Tools](/guides/browser-games-and-practice-tools/).
