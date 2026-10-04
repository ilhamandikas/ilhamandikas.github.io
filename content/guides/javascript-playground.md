---
title: JavaScript Playground Guide
description: Write JavaScript with syntax highlighting and run it in the page, reading its
  console output, return value and timing.
date: '2026-09-27'
lastmod: '2026-10-04'
tags:
- web
tool_guide_slug: javascript-playground
broader_guide:
  title: Browser Debugging Utilities
  url: /guides/browser-debugging/
about: A console for trying JavaScript without leaving the page, built on the Monaco editor
  — the same editor that powers Visual Studio Code — so the code gets syntax highlighting,
  bracket matching, code folding and a formatter. Write or paste a snippet, press Run, and
  see everything it logs, the value it returns and how long it took. Monaco is a large bundle,
  so it is fetched from a CDN only when you press Enable Monaco; until then, and if the fetch
  fails, the page uses a plain text area with the same run, copy, download and clear actions.
  Output streams live from a Web Worker. Use await prompt() for interactive input.
  The tool does not save or upload code, but snippets can make network requests.
faq:
- q: Why does the Monaco editor not appear straight away?
  a: Monaco is several megabytes, so loading it on every visit would slow the page down for
    people who only want a quick text box. It is fetched on demand when you press Enable Monaco.
    Until then a plain text area is used, and it keeps working if the fetch fails.
- q: Can I use top-level await?
  a: Yes. The snippet is wrapped in an async function, so await works at the top level and
    return gives back a value. That also means you do not need to wrap everything in an async
    IIFE yourself.
- q: Is the code sandboxed?
  a: Code runs in a disposable Web Worker. document, window and Node.js APIs are unavailable.
    This is not a security sandbox; code can still make network requests. Only run trusted code.
- q: Why did my console.log output not appear?
  a: Output streams live, including timers after the snippet returns. Stop, a new run or the
    30-second limit ends the worker. Output is capped at 500 rows.
- q: Can I edit other languages?
  a: The playground is for JavaScript, so the editor stays in JavaScript mode. The plain text
    area still holds whatever you paste, but the highlighting and the formatter are the JavaScript
    ones.
- q: Does it remember my code between visits?
  a: The editor starts from a small example each time. If you want to keep a snippet, use
    Copy before you leave, or paste it into your own notes.
---

A console for trying JavaScript without leaving the page, built on the Monaco editor — the same editor that powers Visual Studio Code — so the code gets syntax highlighting, bracket matching, code folding and a formatter. Write or paste a snippet, press Run, and see everything it logs, the value it returns and how long it took. Monaco is a large bundle, so it is fetched from a CDN only when you press Enable Monaco; until then, and if the fetch fails, the page uses a plain text area with the same run, copy, download and clear actions. Output streams live from a Web Worker. The tool does not save or upload code, but snippets can make network requests.

## Run the sample snippet

The code editor opens with a snippet that doubles some numbers, logs the result and returns their sum. With the **Plain editor** badge showing, press **Run** (or Ctrl/Cmd + Enter). The **Output** panel should show a `log` line with the doubled array and a `result` line with `20`, and the status reports how long the run took.

Delete the code and try `await Promise.resolve('hi')` on its own line. Because the snippet is wrapped in an async function, top-level `await` works and `return` hands back a value. Change the sample to throw, `throw new Error('boom')`, and read the error row; anything logged before the throw is still listed. **Clear** empties the editor and output, and **Copy** takes the code away as plain text.

Press **Enable Monaco** to fetch the real editor from a CDN; the badge changes to **Monaco** and highlighting, folding and **Format** become available. If the CDN is blocked the status says so and the plain text area keeps working. Snippets run in a Web Worker: `document`, `window` and Node.js APIs are unavailable. They can still make network requests, so only run code you trust.

## Interactive execution

Enable **Auto-run** to rerun 700 ms after edits. **Stop** terminates execution, even during an infinite loop. Each run has a 30-second limit. Timers continue logging after the main snippet returns, until stopped; output is capped at 500 rows.

Try interactive input:

```javascript
const name = await prompt('Your name?', 'Ilham');
console.log(`Hello, ${name}!`);
await new Promise((resolve) => setTimeout(resolve, 500));
return 'Done';
```

This `prompt` returns a Promise, unlike `window.prompt`. Use `await`, one question at a time. **Clear output** removes logs without clearing code.

## Coding exercises and pyramid patterns

Open **Code examples** and choose arithmetic, conditions, odd/even numbers, primes, factorial, Fibonacci, FizzBuzz, palindrome, bubble sort, binary search, word counts or a class-based bank account. There are also right-triangle, centered-pyramid, inverted-pyramid, diamond, hollow-pyramid and number-pyramid patterns.

Clicking an example adds a separate block above your current code and pauses Auto-run. Nothing runs until you press Run; clear the editor first if you only want that exercise. The status explains the expected result. **Copy output** preserves line breaks and the leading spaces used by pyramid patterns.

For instance, **Find prime numbers** prints primes from 2 through 30. The divisor loop stops at the square root; 1 is not a prime. **Centered pyramid** prints five rows, with star counts 1, 3, 5, 7 and 9, prefixed by decreasing spaces.

## Other playgrounds

Try the [TypeScript Playground](/tools/typescript-playground/) or [Python Playground](/tools/python-playground/). The [Playgrounds index](/tools/playgrounds/) lists only implemented languages. Following these links does not transfer your code or load another language's runtime.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
