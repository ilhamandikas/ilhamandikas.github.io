---
title: Memory Match Guide
description: Flip cards and find matching pairs, with move count, timer and difficulty levels.
date: '2026-09-27'
tags:
- games
tool_guide_slug: memory-match
broader_guide:
  title: Browser Games and Practice Tools
  url: /guides/browser-games-and-practice-tools/
about: A memory game with three board sizes. Cards start face down; flip two at a time and
  a matching pair stays up. The page counts your moves and times the round from the first
  flip to the last pair, so you can see whether a bigger board costs you speed or accuracy.
  Symbols are shuffled on every new game.
faq:
- q: What do the difficulty levels change?
  a: Only the number of pairs. Easy is a 4 × 4 board with eight pairs, Medium is 6 × 4 with
    twelve, and Hard is 6 × 6 with eighteen. More pairs mean more to remember at once, not
    a stricter rule set.
- q: When does the timer start?
  a: On your first flip, not when the page loads, so thinking time before you begin is not
    counted. It stops the moment the final pair is matched.
- q: Why did my two cards turn back over?
  a: They were not a pair. A mismatch is shown for a moment so you can memorise the symbols,
    then both cards turn face down again. A matching pair is locked face up.
- q: Does a new game reshuffle the same symbols?
  a: A new game reshuffles the chosen difficulty's symbols. Changing difficulty deals a new
    board, and larger difficulties include *more* symbols than Easy.
- q: Is the board different every time?
  a: The shuffle is random on each new game, so no two boards are the same unless you are
    very unlucky. Nothing about the board is stored or shared.
---

[Memory Match](/tools/memory-match/) hides pairs of fruit and vegetable symbols on a board. Reveal two cards at a time and remember where each symbol appeared. A matching pair stays face up; a mismatch turns back after about 700 milliseconds.

## Play a short round

Leave **Difficulty** on **Easy · 4 × 4**. **Moves** starts at `0` and **Time** at `0s`. Choose any hidden card, then a second card. **Moves** becomes `1`: it counts *pairs of flips*, not individual clicks. A matching pair stays visible; if the cards differ, wait for them to turn over again. The timer starts when you flip the first card and stops once all **eight pairs** are found. **New game** reshuffles and resets both counters.

Switch **Difficulty** to **Medium · 6 × 4** or **Hard · 6 × 6** for twelve or eighteen pairs. The board is random, so there is no fixed solution to memorize between rounds. No account or score upload is involved.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser Games and Practice Tools](/guides/browser-games-and-practice-tools/).
