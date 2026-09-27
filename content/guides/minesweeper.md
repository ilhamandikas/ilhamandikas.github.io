---
title: Minesweeper Guide
description: Clear a grid without hitting a mine, with flags, first-click safety and difficulty
  levels.
date: '2026-09-27'
tags:
- games
tool_guide_slug: minesweeper
broader_guide:
  title: Browser Games and Practice Tools
  url: /guides/browser-games-and-practice-tools/
---

Minesweeper with first-click safety and three board sizes. Click a cell to open it and right-click to flag a suspected mine. Opening an empty cell clears its neighbours automatically, numbers count the mines touching a cell, and the round is won when every safe cell is open. A timer and a mines-left counter sit above the grid.

## Open the tool

[Use Minesweeper](/tools/minesweeper/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What does first-click safety mean?

The mines are placed only after your first click, and never on that cell or its eight neighbours. Your opening move can therefore never end the game and will always clear a small area to work from.

### How do I flag a mine?

Right-click a closed cell to flag it, and right-click again to remove the flag. Flagging is a note to yourself: it does not open the cell and it does not affect whether you win. The counter shows how many mines are still unaccounted for.

### What do the numbers mean?

A number is how many of the eight surrounding cells contain a mine. The colour of the number changes with its value so a busy cell stands out at a glance.

### How do I win?

Open every cell that is not a mine. You do not need to flag every mine, and you can finish with flags still on the board — the win is based on the safe cells you have cleared.

### Is the board solvable without guessing?

Not always. Minesweeper can produce positions where logic alone leaves two equally likely options, and no amount of care will avoid a guess. The difficulty presets set the mine density, not a guarantee of a purely deductive board.

## Related guide

For more background, read [Browser Games and Practice Tools](/guides/browser-games-and-practice-tools/).
