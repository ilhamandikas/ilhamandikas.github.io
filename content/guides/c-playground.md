---
title: C Playground Guide
description: Compile and run C in your browser, read compiler errors, answer interactive input and try prime-number, struct and pyramid exercises.
date: '2026-10-04'
lastmod: '2026-10-14'
tags:
- web
tool_guide_slug: c-playground
about: >-
  Compile C to WebAssembly in a disposable browser Worker with the
  browsercc 0.1.1 Clang/LLD toolchain. The compiler and sysroot download
  from jsDelivr only on Run or when Auto-run is enabled. Exercises cover
  arithmetic, logic, arrays, functions, structs and pyramid patterns.
  Code and input are not saved or uploaded by the tool. Compiled code can
  still make network requests through WASI; only run code you trust.
faq:
- q: How do I read input?
  a: In Interactive terminal mode, fgets or scanf waits for an answer in the console. Enter sends a line; EOF (or Ctrl + D) ends input. fgets keeps the newline and returns NULL at EOF. Prepared standard input is also available before Run.
- q: Why does the first Run take longer?
  a: The Clang compiler, linker and sysroot download from jsDelivr on the first Run — roughly 26 MiB compressed. Runtime loading has a 90-second timeout, followed by a 30-second execution limit outside input waits. Each answer can wait up to 2 minutes. Later Runs in the same page reuse the loaded toolchain.
- q: Can I use exceptions, threads, fork or sockets?
  a: This is a WASI build of Clang, not a desktop toolchain. Exceptions are unavailable in C, and threads, fork, and native OS processes are not supported. The standard C library works for console programs.
- q: Does selecting an example erase my code?
  a: Yes. Selecting immediately replaces code and standard input, and pauses Auto-run. If the editor contains more than one line, confirm deletion of existing code or cancel to keep code and input.
- q: Is this a security sandbox?
  a: No. A Worker prevents direct DOM access and can be terminated, but compiled code can make network requests through WASI. The tool itself does not upload or persist code or input. Each Run starts fresh; output is limited to 500 rows.
---

Open the [C Playground](/tools/c-playground/) to compile and run small C programs without installing a toolchain.

## Read the default result

The initial program sums `{2, 4, 6, 8}` and prints `sum: 20`. When you press Run, the compiler messages appear first if there are warnings or errors, then the program output. Compiler diagnostics are shown, so you can fix a typo and Run again without losing the source.

## Find prime numbers

Choose **Find prime numbers**, confirm replacement if asked, then press **Run**. It prints:

```text
Primes: 2 3 5 7 11 13 17 19 23 29
```

The predicate rejects integers below 2, then tests divisors up to `d * d <= n`. Any larger factor would have a matching smaller factor. Change `n <= 30` to extend the range.

## Structs and functions

**OOP: bank account** defines an `Account` struct and passes it by pointer to `deposit` and `withdraw`. Depositing `100` and withdrawing `30` prints `Balance: 70`. C has no methods, so the functions take `Account *` and update the field through `->`.

## Read interactive input

Choose **Read standard input** and Run in **Interactive terminal** mode. Enter `Ilham` in the console when this program waits:

```c
#include <stdio.h>

int main(void) {
    char name[64];
    if (fgets(name, sizeof(name), stdin) == NULL) {
        puts("No input provided.");
        return 1;
    }
    for (int i = 0; name[i] != '\0'; i++) {
        if (name[i] == '\n') name[i] = '\0';
    }
    printf("Hello, %s!\n", name);
    return 0;
}
```

It prints `Hello, Ilham!`. `fgets` stops after `sizeof(name) - 1` characters and leaves the newline, which the loop removes. Provide another answer for each additional read. EOF ends input and follows the program's no-input path. If that happens unintentionally, Run again and supply the missing answer. Use `fflush(stdout)` after prompts without a newline to make them visible before reading. **Prepared standard input** also accepts answers before Run.

## Star patterns and errors

**Centered pyramid** prints:

```text
    *
   ***
  *****
 *******
*********
```

It prints `height - row` spaces and `2 * row - 1` stars for each row. Copy output preserves the spacing. Other examples cover arrays, sorting, binary search, letter frequency and hollow or inverted pyramids.

Interactive stdin requires HTTPS and service workers. The first interactive Run registers a service worker scoped to `/tools/`; it handles reserved input requests locally without caching pages or persisting answers. If blocked, choose prepared input. This is line-based input, not a shell.

Syntax errors, missing headers and type warnings come from Clang and appear in the output. Stop terminates a stuck program. Runtime assets are fetched from jsDelivr; an unavailable CDN prevents execution, not editing. The plain editor works without Monaco, and no C formatter is bundled.

## Related playgrounds

- [C++ Playground](/tools/cpp-playground/)
- [JavaScript Playground](/tools/javascript-playground/)
- [TypeScript Playground](/tools/typescript-playground/)
- [Python Playground](/tools/python-playground/)
- [Ruby Playground](/tools/ruby-playground/)

## References

- [browsercc](https://github.com/BertalanD/browsercc)
- [Clang documentation](https://clang.llvm.org/docs/)
- [C standard library reference](https://en.cppreference.com/w/c)
- [Runtime notices](/licenses/playground-runtimes/NOTICE.txt)
