---
title: Python Playground Guide
description: Run Python with Pyodide, prepare standard input and read output from coding exercises and pyramid patterns.
date: '2026-10-04'
tags:
- web
tool_guide_slug: python-playground
about: >-
  Run Python in a disposable browser Worker using Pyodide 0.28.2. The runtime
  and core standard library load from jsDelivr only on Run or when Auto-run is
  enabled. Prepare standard input before execution and read print output,
  expression results and errors in the console. Examples include prime numbers,
  odd/even lists, sorting, classes and pyramid patterns. No extra packages are
  installed automatically. The tool does not save or upload code or input;
  Python's JavaScript bridge can still make network requests.
faq:
- q: How does input() work?
  a: Fill Standard input before Run, with one answer per line. Each input() consumes the next line. Missing answers produce an EOFError. This is prepared input, not a live interactive terminal.
- q: Why does the first Run take longer?
  a: It downloads and initializes Pyodide and its core standard library. Runtime loading has a 90-second timeout. Execution then has a separate 30-second limit. Each Run starts a fresh Worker; asset requests can use normal HTTP caching.
- q: Can I use pip or any Python package?
  a: No packages are installed automatically by this tool. Pure Python packages and specially built Pyodide packages may be possible through additional runtime APIs, but arbitrary native desktop packages do not work unchanged.
- q: Does choosing an example erase my code?
  a: No. It adds the example above your code and pauses Auto-run. Clear the editor first to run only the example. The input example fills standard input only if that field is empty.
- q: Is this a security sandbox?
  a: No. Python runs in a Worker without direct DOM access, but the JavaScript bridge can use browser APIs and make network requests. Only run code you trust. Stop terminates the Worker; code and input are not saved by the tool.
---

Open the [Python Playground](/tools/python-playground/) for small Python experiments without a backend.

## Read the default result

The initial snippet doubles `[1, 2, 3, 4]` with a list comprehension. **Run** prints the doubled list `[2, 4, 6, 8]` and its sum, `20`. The first Run must download the runtime; an unavailable CDN produces an error without clearing your code.

## Find prime numbers

Clear the editor and choose **Find prime numbers** under **Code examples**. The output lists:

```text
2, 3, 5, 7, 11, 13, 17, 19, 23, 29
```

The example rejects numbers below 2, then checks divisors up to the integer square root. A larger factor would have a matching smaller factor, so checking every number below the candidate is unnecessary.

Try changing the upper bound from `31` to `51`. Python's `range` excludes its upper bound: `range(2, 31)` considers numbers 2 through 30.

## Pyramid patterns

Choose **Centered pyramid** to print five rows with 1, 3, 5, 7 and 9 stars:

```text
    *
   ***
  *****
 *******
*********
```

The leading spaces are `height - row`; the star count is `2 * row - 1`. There are also right-triangle, inverted-pyramid, diamond, hollow-pyramid and number-pyramid examples. Output is monospace; **Copy output** preserves indentation and line breaks.

Other exercises cover arithmetic, conditions, odd/even numbers, factorial, Fibonacci, FizzBuzz, palindrome, bubble sort, binary search, list transformations, word counts and classes. Selecting an example adds it above existing code and pauses Auto-run. Clear first if you only want the selected exercise.

## Prepare answers before Run

Choose **Read standard input**, which fills the empty stdin field with `Ilham`. The snippet uses:

```python
name = input('What is your name? ')
print(f'Hello, {name}!')
```

Replace `Ilham` with another name before pressing Run. For two calls to `input()`, provide two lines. An EOFError means there were not enough answers; add them and run again. This playground does not pause for live terminal input.

## Runtime boundaries

Each Run uses a fresh Worker, so imports, variables and virtual files are not preserved between runs. The tool loads the core Pyodide runtime, not a full desktop installation or every optional standard-library package. Arbitrary native Python packages and OS subprocesses are not available.

Stop interrupts an infinite loop. Execution is limited to 30 seconds; output is capped at 500 rows. The tool does not save or upload code or stdin. Runtime assets are fetched from jsDelivr, and user-written code can make network requests through the JavaScript bridge. Only execute code you trust.

## Related playgrounds

- [JavaScript Playground](/tools/javascript-playground/)
- [TypeScript Playground](/tools/typescript-playground/)
- [Ruby Playground](/tools/ruby-playground/)
- [C Playground](/tools/c-playground/)
- [C++ Playground](/tools/cpp-playground/)

## References

- [Pyodide: running in a Web Worker](https://pyodide.org/en/0.28.2/usage/webworker.html)
- [Pyodide: standard streams](https://pyodide.org/en/0.28.2/usage/streams.html)
