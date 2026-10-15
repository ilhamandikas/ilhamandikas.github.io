---
title: sed Simulator Guide
description: See how first versus global replacement, whole-match insertion, deletion, and selected-line printing affect sample text.
date: 2026-10-15
tags:
- linux
- text
tool_guide_slug: sed-simulator
about: Simulate a bounded subset of sed on pasted ASCII text. Choose substitution, deleting matching lines, or printing matching lines. Substitutions support first or global replacement, case-insensitive matching, whole-match insertion with &, and printing only lines with a substitution. This tool does not execute arbitrary sed scripts or edit files.
faq:
- q: Is this GNU sed running in the browser?
  a: No. A local bounded regex engine implements the documented ASCII/C-locale subset with leftmost-longest whole-match selection. It does not implement full sed, capture backreferences, case-conversion escapes, hold space, multiline commands, or arbitrary script execution.
- q: Can I use captured groups in the replacement?
  a: Grouping can organize a pattern, but replacement backreferences such as \1 are not implemented. Use & for the complete match. Unsupported replacement escapes are rejected rather than guessed.
- q: Does this overwrite my original text or save it?
  a: No. The output is separate from the original sample. Processing happens locally without tool input storage or upload. Clear sample removes the sample and result while leaving the selected options unchanged.
- q: What are the simulation limits?
  a: Up to 50,000 ASCII input characters, 5,000 lines, 5,000 characters per line, 256 pattern characters, and 1,000 replacement characters. Finite repetition bounds are limited to 50, compiled patterns to 500 states, and output to 200,000 characters. A bounded work budget rejects expensive simulations.
---

Replacing the first occurrence on each line differs from replacing every occurrence in the file. [sed Simulator](/tools/sed-simulator/) shows that distinction on a separate output, without modifying the pasted source.

## First occurrence versus global

Use pattern `cat`, replacement `dog`, and this sample:

```text
cat cat
Cat and dog
nothing to replace
```

With global replacement enabled and case sensitivity unchanged, the output is:

```text
dog dog
Cat and dog
nothing to replace
```

Turn global off and the first line becomes `dog cat`. The second line remains unchanged until **Ignore case** is enabled. Global means all non-overlapping occurrences **within each input line**, not an instruction to process only one line or the entire input as a single pattern space.

Enable **Only print lines with a substitution** to suppress lines on which no substitution occurs. A matching replacement that inserts the same text still counts as a substitution.

## Insert the complete match

With extended regex on, use `[[:digit:]]+` and replacement `[&]`:

```text
attempt=12 elapsed=345
```

The global result is:

```text
attempt=[12] elapsed=[345]
```

`&` refers to the complete match. `\&` inserts a literal ampersand, `\\` a literal backslash, and `\n` or `\t` insert a newline or tab. Replacement group references such as `\1` are rejected. Groups in the pattern are useful for matching structure and alternation, but captures are not exposed.

Whole matches use leftmost-longest selection: `cat|cater` matches `cater` in `cater`, rather than choosing `cat` just because it is the first alternative.

## Delete and print operations

Select **Delete matching lines** with `^DEBUG` to remove entire lines that start with `DEBUG`. It does not remove only the matching substring. Select **Print matching lines only** with the same pattern to keep those lines instead. Replacement, global, and substitution-print options are hidden for these operations because they do not apply.

Deleting every line can legitimately produce empty output. It is not a parser error. The source remains intact, and changing the sample or options invalidates the previous result until you simulate again.

## Supported regex, not every sed feature

The simulator accepts ASCII patterns with literals, `.`, branch-start/end `^` and `$`, bracket expressions, common POSIX classes such as `[[:digit:]]`, groups, alternation, and `*`, `+`, `?`, or bounded intervals. With extended regex disabled, groups and intervals use BRE escapes, and GNU `\+`, `\?`, and `\|` are supported. Empty groups/alternatives, collating/equivalence classes, backslashes inside bracket expressions, and GNU shorthand or word-boundary escapes are not supported.

Matching uses ASCII/C-locale rules. Unicode and binary/NUL input are rejected; do not assume the same behavior as a machine using a different locale. The simulator processes lines separately, preserving whether the source ended with a newline. It does not simulate address ranges, hold space, loops, multiple commands, in-place edits, or reads/writes to files.

For a real terminal command, [sed Replacement Builder](/tools/sed-replacement-builder/) remains a separate tool. Test generated commands on disposable data before editing actual files. For finding lines rather than changing them, use the separate [grep Simulator](/tools/grep-simulator/).

## References

- [GNU sed manual](https://www.gnu.org/software/sed/manual/sed.html)
- [GNU sed: regular expressions](https://www.gnu.org/software/sed/manual/html_node/Regular-Expressions.html)
