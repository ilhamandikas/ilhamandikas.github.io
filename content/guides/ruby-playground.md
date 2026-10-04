---
title: Ruby Playground Guide
description: Read Ruby output, prepare standard input and try classes, prime-number exercises and pyramid patterns.
date: '2026-10-04'
tags:
- web
tool_guide_slug: ruby-playground
about: >-
  Run Ruby 3.4 in a disposable browser Worker using ruby.wasm 2.10.1 and
  a WASI adapter. The runtime downloads from jsDelivr only on Run or when
  Auto-run is enabled. Exercises cover arithmetic, logic, arrays, classes
  and pyramid patterns. Code and input are not saved or uploaded by the tool.
  Ruby's JavaScript bridge can still access browser APIs and make requests;
  only run code you trust.
faq:
- q: How do I read input?
  a: Fill Standard input before Run, one answer per line, then use STDIN.readline.chomp. Missing answers raise EOFError. This is prepared input, not a live terminal.
- q: Why does the first Run take longer?
  a: The Ruby WASM binary is approximately 16 MiB before compression. It downloads from jsDelivr and initializes in a fresh Worker. Runtime loading has a 90-second timeout, followed by a separate 30-second execution limit. Normal HTTP caching can reuse assets between runs.
- q: Can I install gems or run Rails?
  a: This runner provides a browser WASI build, not a desktop Ruby installation or a web server. No gems are installed automatically; arbitrary native extensions and OS subprocesses are unavailable.
- q: Does selecting an example erase my code?
  a: No. It adds code above the existing snippet and pauses Auto-run. Clear first to run just the example. Ruby examples share the snippet's namespace, so later definitions can replace earlier ones.
- q: Is this a security sandbox?
  a: No. A Worker prevents direct DOM access and can be terminated, but Ruby's JavaScript bridge can make network requests. The tool itself does not upload or persist code or input. Each Run starts fresh; output is limited to 500 rows.
---

Open the [Ruby Playground](/tools/ruby-playground/) for small Ruby experiments without a backend.

## Read the default result

The initial snippet maps `[1, 2, 3, 4]` to `[2, 4, 6, 8]` and prints its sum, `20`. `inspect` makes the array readable; `puts` writes a newline. `print` does not add a newline, but its final fragment still appears in the output.

## Find prime numbers

Clear the editor and choose **Find prime numbers**. It prints:

```text
[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
```

The predicate rejects integers below 2, then tests divisors up to `Integer.sqrt(n)`. Any larger factor would have a matching smaller factor. Ruby's `(2..30)` includes both endpoints; change it to `(2..50)` to extend the exercise.

## Classes and patterns

Choose **OOP: bank account** to see a class whose `deposit` and `withdraw` methods update `@balance`. Depositing `100` and withdrawing `30` prints `Balance: 70`. `attr_reader` exposes the balance without adding a setter.

**Centered pyramid** prints:

```text
    *
   ***
  *****
 *******
*********
```

String multiplication repeats the spaces and stars. Row `r` uses `height - r` spaces and `2 * r - 1` stars. Copy output preserves the indentation. Other examples include sorting, binary search, word counts, odd/even numbers and hollow or inverted pyramids.

## Prepare input and recover from errors

The **Read standard input** example fills an empty input field with `Ilham`:

```ruby
name = STDIN.readline.chomp
puts "Hello, #{name}!"
```

It prints `Hello, Ilham!`. Provide another line for each additional read. If an EOFError appears, add the missing answer and Run again; your code remains in the editor. Syntax errors and raised exceptions also appear in the output. Stop terminates a stuck loop.

Runtime assets are fetched from jsDelivr; an unavailable CDN prevents execution, not editing. Each Run uses a fresh virtual filesystem and loses earlier variables. The plain editor works without Monaco, and no Ruby formatter is bundled.

## Related playgrounds

- [Python Playground](/tools/python-playground/)
- [JavaScript Playground](/tools/javascript-playground/)
- [TypeScript Playground](/tools/typescript-playground/)
- [C Playground](/tools/c-playground/)
- [C++ Playground](/tools/cpp-playground/)

## References

- [ruby.wasm](https://github.com/ruby/ruby.wasm)
- [Ruby IO.readline](https://docs.ruby-lang.org/en/3.4/IO.html#method-i-readline)
- [Runtime notices](/licenses/playground-runtimes/NOTICE.txt)
