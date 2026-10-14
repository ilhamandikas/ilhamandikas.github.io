---
title: TypeScript Playground Guide
description: Try typed JavaScript, read transpilation errors and run coding exercises in a browser Worker.
date: '2026-10-04'
lastmod: '2026-10-14'
tags:
- web
tool_guide_slug: typescript-playground
about: >-
  Transpile TypeScript 5.9.3 to JavaScript and run it in a disposable browser
  Worker. The console shows logs, return values and errors. The compiler loads
  from jsDelivr only on Run or when Auto-run is enabled; Monaco loads separately
  on demand. Examples cover arithmetic, prime numbers, sorting, classes and
  pyramid patterns, plus TypeScript interfaces and generics. Transpilation reports
  syntax errors but does not perform semantic type-checking. The tool does not
  save or upload code or prompt answers; snippets can still make network requests.
faq:
- q: Does this check TypeScript types?
  a: No. The runner uses transpileModule, which removes types and reports syntactic errors. A mismatched type can still run. Monaco may display additional editor diagnostics when enabled, but the runner does not enforce them.
- q: Can I use await and interactive input?
  a: Yes. The transpiled snippet runs inside an async function. Use await prompt('Question') and answer in the console with Enter. EOF (or Ctrl + D) returns null. Ask one question at a time; return displays a result.
- q: Does clicking an example run it?
  a: No. Selecting immediately replaces code and pauses Auto-run. If the editor contains more than one line, confirm deletion of existing code or cancel to keep it. Press Run to execute the example.
- q: Can I import npm packages?
  a: No. This is a single-snippet browser runner, not Node.js or a project bundler. document and window are also unavailable inside the Worker.
- q: What happens when code never finishes?
  a: Stop terminates the Worker. Runtime loading has a 90-second timeout, and execution outside input waits has a separate 30-second limit. Each answer may wait up to 2 minutes. Output is capped at 500 rows; input remains available to edit.
---

Type annotations describe code, but they do not survive into the JavaScript that runs. [TypeScript Playground](/tools/typescript-playground/) makes that distinction visible with small typed examples and their runtime output.

## An interface disappears at runtime

Choose **Typed function** in the **Code example** picker and confirm replacement if asked. It loads:

```typescript
interface Rectangle {
  width: number;
  height: number;
}
function area(rectangle: Rectangle): number {
  return rectangle.width * rectangle.height;
}
console.log('Area:', area({ width: 6, height: 4 }));
```

Press **Run**. The first run downloads the compiler; later requests can use the browser's normal HTTP cache. The output is `Area: 24`. The interface and annotations are removed before JavaScript executes: they describe types, not runtime validation.

For example, assigning a string to a variable annotated `number` is a semantic type error, but this runner may still execute it. Use a real TypeScript type checker when validating a project. The optional Monaco editor can show diagnostics, but those do not block Run.

## Coding exercises and patterns

The examples include odd/even numbers, prime numbers up to 30, factorial, Fibonacci, FizzBuzz, palindrome, bubble sort, binary search, word frequency, OOP and six triangle/pyramid/diamond patterns. The shared JavaScript examples also work as TypeScript; **Typed function** and **Generic function** demonstrate TypeScript-specific syntax.

Choosing an example replaces code and pauses Auto-run. Editors containing more than one line require confirmation before replacement. Star-pattern spaces are significant; the output uses monospace text and **Copy output** preserves those spaces and line breaks.

## Input, limits and privacy

Use `await prompt('Your name?', 'Ilham')` for input and Enter or **Send** to resume execution. This prompt returns a Promise, unlike `window.prompt`. Answers are echoed in the console without being persisted. **EOF** (or Ctrl + D) returns `null`; an empty Enter sends an empty string.

Each Run starts a fresh Worker. Stop interrupts even an infinite loop. Execution outside input waits is limited to 30 seconds and 500 output rows, with up to 2 minutes to answer each prompt. Timers can continue logging after the snippet returns until Stop, the next Run or the execution limit.

The tool does not save or upload your code or input. Compiler and optional editor assets are fetched from jsDelivr, which receives ordinary asset requests. Snippets can make network requests through browser APIs, so only run code you trust. A Worker is not a security sandbox.

## Related playgrounds

- [JavaScript Playground](/tools/javascript-playground/)
- [Python Playground](/tools/python-playground/)
- [Ruby Playground](/tools/ruby-playground/)
- [C Playground](/tools/c-playground/)
- [C++ Playground](/tools/cpp-playground/)

## Reference

- [TypeScript compiler API: transpileModule](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#a-simple-transform-function)
