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
about: Minesweeper with first-click safety and three board sizes. Click a cell to open it
  and right-click to flag a suspected mine. Opening an empty cell clears its neighbours automatically,
  numbers count the mines touching a cell, and the round is won when every safe cell is open.
  A timer and a mines-left counter sit above the grid.
faq:
- q: What does first-click safety mean?
  a: The mines are placed only after your first click, and never on that cell or its eight
    neighbours. Your opening move can therefore never end the game and will always clear a
    small area to work from.
- q: How do I flag a mine?
  a: 'Right-click a closed cell to flag it, and right-click again to remove the flag. Flagging
    is a note to yourself: it does not open the cell and it does not affect whether you win.
    The counter shows how many mines are still unaccounted for.'
- q: What do the numbers mean?
  a: A number is how many of the eight surrounding cells contain a mine. The colour of the
    number changes with its value so a busy cell stands out at a glance.
- q: How do I win?
  a: Open every cell that is not a mine. You do not need to flag every mine, and you can finish
    with flags still on the board — the win is based on the safe cells you have cleared.
- q: Is the board solvable without guessing?
  a: Not always. Minesweeper can produce positions where logic alone leaves two equally likely
    options, and no amount of care will avoid a guess. The difficulty presets set the mine
    density, not a guarantee of a purely deductive board.
---

[Minesweeper](/tools/minesweeper/) hides mines on a grid. Open safe cells; a number tells you how many mines touch it in the eight surrounding positions. Open **every non-mine cell** to win; you do not have to mark every mine.

## Make a safe first move

Leave **Difficulty** on **Easy · 9 × 9 · 10 mines**. **Mines left** starts at `10`, and **Time** at `0s`. Click any cell: the first click and its immediate neighbors are kept free of mines. An empty cell can reveal a group of safe neighbors; a numbered cell shows how many adjacent mines there are. Right-click a closed cell to add a flag; right-click again to remove it. **Mines left** is `10` minus your flags, *not* a verified count of unmarked mines. **New game** resets the round.

The timer starts on your first reveal, not on the first flag. A later click on a mine ends the round. If right-click is unavailable on your device, note that this interface provides no separate flag button—try a device with a context-menu gesture. The board is randomized each game; do not assume a marked cell is actually a mine.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser Games and Practice Tools](/guides/browser-games-and-practice-tools/).
