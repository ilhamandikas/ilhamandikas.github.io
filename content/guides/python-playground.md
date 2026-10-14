---
title: Python Playground Guide
description: Run Python with Pyodide, answer interactive input and read output from coding exercises and pyramid patterns.
date: '2026-10-04'
lastmod: '2026-10-14'
tags:
- web
tool_guide_slug: python-playground
about: >-
  Run Python in a disposable browser Worker using Pyodide 0.28.2. The runtime
  and core standard library load from jsDelivr only on Run or when Auto-run is
  enabled. Answer interactive input in the console or prepare input before Run. Read print output,
  expression results and errors in the console. Examples include prime numbers,
  odd/even lists, sorting, classes and pyramid patterns. No extra packages are
  installed automatically. The tool does not save or upload code or input;
  Python's JavaScript bridge can still make network requests.
faq:
- q: How does input() work?
  a: In Interactive terminal mode, input() waits for a line in the console. Type an answer and press Enter. EOF (or Ctrl + D) ends input and can raise EOFError. Prepared standard input still accepts one answer per line before Run.
- q: Why does the first Run take longer?
  a: It downloads and initializes Pyodide and its core standard library. Runtime loading has a 90-second timeout. Execution outside input waits has a 30-second limit; each answer may wait up to 2 minutes. Each Run starts a fresh Worker; asset requests can use normal HTTP caching.
- q: Can I use pip or any Python package?
  a: No packages are installed automatically by this tool. Pure Python packages and specially built Pyodide packages may be possible through additional runtime APIs, but arbitrary native desktop packages do not work unchanged.
- q: Does choosing an example erase my code?
  a: Yes. Selecting immediately replaces code and standard input, and pauses Auto-run. If the editor contains more than one line, a confirmation warns that existing code will be deleted. Cancel to keep code and input.
- q: Is this a security sandbox?
  a: No. Python runs in a Worker without direct DOM access, but the JavaScript bridge can use browser APIs and make network requests. Only run code you trust. Stop terminates the Worker; code and input are not saved by the tool.
---

Python's list comprehensions and ranges are easier to check with a few values than with a large dataset. [Python Playground](/tools/python-playground/) runs the examples below in the browser and shows their printed output.

## Read the default result

The initial snippet doubles `[1, 2, 3, 4]` with a list comprehension. **Run** prints the doubled list `[2, 4, 6, 8]` and its sum, `20`. The first Run must download the runtime; an unavailable CDN produces an error without clearing your code.

## Find prime numbers

Choose **Find prime numbers** in the **Code example** picker, confirm replacement if asked, then press **Run**. The output lists:

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

Other exercises cover arithmetic, conditions, odd/even numbers, factorial, Fibonacci, FizzBuzz, palindrome, bubble sort, binary search, list transformations, word counts and classes. Selecting replaces code and input and pauses Auto-run, with confirmation when the editor contains more than one line.

## Answer input in the console

Choose **Read standard input** and keep **Interactive terminal** selected. Run the snippet, then type `Ilham` in the console and press Enter. In **Prepared standard input** mode, the example fills the stdin field with `Ilham` before Run. The snippet uses:

```python
name = input('What is your name? ')
print(f'Hello, {name}!')
```

For two calls to `input()`, answer each prompt in turn. Empty Enter sends an empty line; EOF ends the stream. An EOFError means the program still expected an answer after EOF, or prepared input ran out. Add an answer and Run again.

Interactive stdin requires HTTPS and service workers. On the first interactive Run, a service worker scoped to `/tools/` handles reserved input requests locally; it does not cache pages or persist answers. If registration is blocked, switch to prepared input. This is line-based input, not a shell or full terminal emulator.

## Runtime boundaries

Each Run uses a fresh Worker, so imports, variables and virtual files are not preserved between runs. The tool loads the core Pyodide runtime, not a full desktop installation or every optional standard-library package. Arbitrary native Python packages and OS subprocesses are not available.

Stop interrupts an infinite loop. Execution outside input waits is limited to 30 seconds; each answer may wait up to 2 minutes, and output is capped at 500 rows. The tool does not save or upload code or stdin. Runtime assets are fetched from jsDelivr, and user-written code can make network requests through the JavaScript bridge. Only execute code you trust.

## Related playgrounds

- [JavaScript Playground](/tools/javascript-playground/)
- [TypeScript Playground](/tools/typescript-playground/)
- [Ruby Playground](/tools/ruby-playground/)
- [C Playground](/tools/c-playground/)
- [C++ Playground](/tools/cpp-playground/)

## References

- [Pyodide: running in a Web Worker](https://pyodide.org/en/0.28.2/usage/webworker.html)
- [Pyodide: standard streams](https://pyodide.org/en/0.28.2/usage/streams.html)
