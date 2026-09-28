---
title: Math Evaluator Guide
description: Evaluate a mathematical expression, with variables and functions.
date: '2026-09-27'
tags:
- math
tool_guide_slug: math-evaluator
broader_guide:
  title: Calculators and Unit Conversion
  url: /guides/calculators-and-unit-conversion/
---

[Math Evaluator](/tools/math-evaluator/) calculates arithmetic you type as an **expression**—a line such as `2 * (3 + 4)`. It supports numbers, parentheses, operators, named functions like `sqrt`, and constants like `pi`. It does **not** support assigning variables.

## Check the order of operations

Enter `2 * (3 + 4)` into **Expression**. **Result** should be `14`: the parentheses make `3 + 4` happen before multiplication. Try `sqrt(9)` and you should get `3`. The result updates as you type; **Copy** takes it and **Download** saves `result.txt`.

If the tool reports **Unknown name**, check the available function names in the hint under the input; arbitrary variables and JavaScript commands are not accepted. A malformed expression, such as a missing `)`, reports an error instead of a number. This is a quick calculator using floating-point numbers, not an exact decimal or financial calculator.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is it safe to paste an expression in?

Yes. The expression is parsed and evaluated as arithmetic. It is not handed to eval, so it cannot run arbitrary code.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
