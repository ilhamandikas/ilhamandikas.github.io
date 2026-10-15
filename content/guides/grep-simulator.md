---
title: grep Simulator Guide
description: Read matching lines, inverted selection, context separators, counts, and matching-text output using a local sample instead of files.
date: 2026-10-15
tags:
- linux
- text
tool_guide_slug: grep-simulator
about: Simulate grep on one pasted ASCII text sample. Choose fixed strings, basic regex, or extended regex, with case-insensitive matching, line numbers, whole-word matching, inverted selection, context, selected-line counts, and matching-text output. No file paths, directory traversal, or remote requests are involved.
faq:
- q: Is this a complete GNU grep implementation?
  a: No. It uses a bounded local regex engine for a documented ASCII/C-locale subset, with leftmost-longest whole-match selection. Perl regex, backreferences, GNU shorthand/word-boundary escapes, locale-specific matching, binary inputs, and file searching are not implemented.
- q: Does count show matching occurrences or matching lines?
  a: It counts selected lines, like grep -c, not the number of individual matches. With invert enabled, it counts lines that do not match. Count takes precedence over matching-text output.
- q: Why is there no output with invert and matching text only?
  a: With zero context, invert selects non-matching lines, so there are no matching substrings to print. The summary can still report selected lines and a simulated successful exit status. With context enabled, matching context rows may print match fragments instead.
- q: Is my text sent anywhere or stored?
  a: The simulator processes the pasted sample in the browser without tool input storage or upload. Its output and source are separate. Copy output uses only the result, not the original sample.
---

A grep command can select the right lines but format them differently depending on its flags. [grep Simulator](/tools/grep-simulator/) lets you inspect line numbers, context, and selected-line counts without giving a website access to your files.

## Find warning and error lines

Keep extended regex, ignore case, and line numbers enabled. Use pattern `ERROR|WARN` on:

```text
INFO startup
WARN retry scheduled
ERROR database timeout
INFO shutdown complete
```

The result is:

```text
2:WARN retry scheduled
3:ERROR database timeout
```

The pipe is alternation in extended mode. In basic mode, use `ERROR\|WARN` for GNU-style alternation. In fixed-string mode, `ERROR|WARN` searches for that exact literal text, including the pipe.

Fixed-string mode is useful for input such as `192.0.2.10` or `[error]`, where punctuation should not behave as regex syntax.

## Context and counts

Set context to `1` with line numbers on:

```text
1-INFO startup
2:WARN retry scheduled
3:ERROR database timeout
4-INFO shutdown complete
```

Matching lines use a colon after the line number; surrounding context uses a hyphen. Separate, non-adjacent context groups have a `--` separator line. Overlapping context is merged rather than printed twice.

Enable **Count selected lines** and the output is `2`, not a listing. A line containing both `WARN` and `ERROR` still contributes one selected line. Invert selection changes which lines are counted. Zero disables context in this interface. Context has no effect with count. With matching-text output, only non-empty matches are printed, but context can still separate output groups. Combined with invert selection, matches from context rows can appear with the context-line prefix.

## Match occurrences rather than whole lines

Enable **Matching text only** to print each non-empty, non-overlapping match separately. Whole matches use leftmost-longest selection: `a|ab` matches `ab` in `ab`, regardless of alternative order. Empty matches can select a line but produce no `-o` output.

Whole-word matching uses ASCII letters, digits, and underscores as word characters. Searching for `error` selects `error!` but not `error_count`. This corresponds to C-locale matching, not arbitrary Unicode word segmentation.

No matches is a normal result. The summary shows a simulated grep exit status of `0` when at least one line is selected and `1` otherwise; syntax or resource-limit errors appear separately. The simulator is not launching a process.

## Boundaries of the simulation

Supported regex includes literals, `.`, branch-start/end anchors, bracket and common POSIX character classes, grouping, alternation, and greedy repetition. Finite repetition bounds are limited to 50. BRE mode uses escaped groups/intervals and supports GNU `\+`, `\?`, and `\|`. Empty alternatives/groups, shorthand escapes such as `\d`, backreferences, collating/equivalence classes, and backslashes inside brackets are rejected rather than guessed.

Input must be ASCII without NUL, with at most 50,000 characters, 5,000 lines, and 5,000 characters per line. Patterns are limited to 256 characters, context to 50, and compiled expressions to 500 states. Work and output limits prevent large simulations from continuing indefinitely.

The source is one text sample, not multiple files. There are no include/exclude globs, recursion, filename prefixes, binary-file handling, or filesystem access. Original text is unchanged; editing any setting clears the old result until you simulate again. Grep-style selected-line output ends each printed line with a newline, including when the source's final line did not have one.

Use [grep Pattern Builder](/tools/grep-pattern-builder/) separately to assemble a terminal command with paths and file filters. For substitutions or deleting lines, use the separate [sed Simulator](/tools/sed-simulator/).

## References

- [GNU grep manual](https://www.gnu.org/software/grep/manual/grep.html)
