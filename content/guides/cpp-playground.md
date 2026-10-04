---
title: C++ Playground Guide
description: Compile and run C++20 in your browser, read Clang diagnostics, prepare standard input and try classes, prime-number and pyramid exercises.
date: '2026-10-04'
tags:
- web
tool_guide_slug: cpp-playground
about: >-
  Compile C++20 to WebAssembly in a disposable browser Worker with the
  browsercc 0.1.1 Clang/LLD toolchain. The compiler and sysroot download
  from jsDelivr only on Run or when Auto-run is enabled. Exercises cover
  arithmetic, logic, containers, classes and pyramid patterns. Code and
  input are not saved or uploaded by the tool. Compiled code can still
  make network requests through WASI; only run code you trust.
faq:
- q: How do I read input?
  a: Fill Standard input before Run, one answer per line, then use std::getline or std::cin. std::getline drops the trailing newline for you. If the stream is empty, getline returns false. This is prepared input, not a live terminal.
- q: Why does the first Run take longer?
  a: The Clang compiler, linker and sysroot download from jsDelivr on the first Run — roughly 26 MiB compressed. Runtime loading has a 90-second timeout, followed by a separate 30-second execution limit. Later Runs in the same page reuse the loaded toolchain.
- q: Can I use exceptions, threads or the full standard library?
  a: No. The WASI libc++ is built without exceptions or threads, and this runner compiles with -fno-exceptions. Code that relies on throwing or catching will not link. Most of the standard library for console programs, including string, vector and map, works.
- q: Does selecting an example erase my code?
  a: Yes. C++ examples are complete programs with their own main, so clicking one replaces the editor and pauses Auto-run. Copy anything you want to keep first.
- q: Is this a security sandbox?
  a: No. A Worker prevents direct DOM access and can be terminated, but compiled code can make network requests through WASI. The tool itself does not upload or persist code or input. Each Run starts fresh; output is limited to 500 rows.
---

Open the [C++ Playground](/tools/cpp-playground/) to compile and run small C++20 programs without installing a toolchain.

## Read the default result

The initial program sums `{2, 4, 6, 8}` with a range-based `for` and prints `sum: 20`. Clang warnings and errors appear before the program output. Because the runner passes `-fno-exceptions`, avoid `throw`, `try`, and standard-library calls that rely on exceptions in this environment.

## Find prime numbers

Choose **Find prime numbers**. It prints:

```text
Primes: 2 3 5 7 11 13 17 19 23 29
```

The predicate rejects integers below 2, then tests divisors up to `d * d <= n`. Any larger factor would have a matching smaller factor. Change `n <= 30` to extend the range.

## Classes and containers

**OOP: bank account** defines a class with `deposit` and `withdraw` methods and a private `balance_` field. Depositing `100` and withdrawing `30` prints `Balance: 70`. Examples also use `std::vector`, `std::string`, `std::map` and `std::sort` for sorting, binary search and letter counting. These containers compile without exceptions as long as you do not depend on throwing paths like `at()` or `std::stoi` on invalid input.

## Prepare input and read it

The **Read standard input** example fills the input field with `Ilham`:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string name;
    if (!std::getline(std::cin, name)) {
        std::cout << "No input provided.\n";
        return 1;
    }
    std::cout << "Hello, " << name << "!\n";
    return 0;
}
```

It prints `Hello, Ilham!`. `std::getline` reads through the newline and removes it. Provide another line for each additional read. If the program reports no input, add the missing answer and Run again.

## Star patterns and errors

**Centered pyramid** prints:

```text
    *
   ***
  *****
 *******
*********
```

It builds each row from `std::string(height - row, ' ')` and `std::string(2 * row - 1, '*')`. Copy output preserves the spacing. Other examples cover arrays, sorting, binary search, letter frequency and hollow or inverted pyramids.

Syntax errors, missing includes and template errors come from Clang and appear in the output. Stop terminates a stuck program. Runtime assets are fetched from jsDelivr; an unavailable CDN prevents execution, not editing. The plain editor works without Monaco, and no C++ formatter is bundled.

## Related playgrounds

- [C Playground](/tools/c-playground/)
- [JavaScript Playground](/tools/javascript-playground/)
- [TypeScript Playground](/tools/typescript-playground/)
- [Python Playground](/tools/python-playground/)
- [Ruby Playground](/tools/ruby-playground/)

## References

- [browsercc](https://github.com/BertalanD/browsercc)
- [Clang documentation](https://clang.llvm.org/docs/)
- [C++ standard library reference](https://en.cppreference.com/w/cpp)
- [Runtime notices](/licenses/playground-runtimes/NOTICE.txt)
