---
title: Keycode Info Guide
description: Press a key to see its code, key and modifier state.
date: '2026-09-27'
tags:
- web
tool_guide_slug: keycode-info
broader_guide:
  title: Browser Debugging Utilities
  url: /guides/browser-debugging/
about: 'Press a key and see everything the browser reports about it: the key name, the legacy
  keyCode and whichCode, the physical position on the keyboard, and which modifier keys were
  held. It is for wiring up a shortcut without guessing.'
faq:
- q: Why is keyCode deprecated?
  a: It is inconsistent across layouts and languages — the same physical key reports different
    values. Use event.key for the character and event.code for the physical position, and
    press a key here to see the difference.
---

Browsers describe keyboard presses using **`key`** (the character or action) and **`code`** (the key's physical position). [Keycode Info](/tools/keycode-info/) shows those values plus older numeric fields and modifiers so you can design a keyboard shortcut.

## Press a key

Click or tab to **Press any key**, then press `a`. On a typical US-layout keyboard, **key** will be `a` and **code** will be `KeyA`. Press Shift and `a` together: **Modifiers** should include `Shift`, and **key** may become `A`. The field is read-only; pressing a key *records the event* instead of typing into the input. The status says **Captured**.

If you get different values, check your keyboard layout and browser. Use `key` when the *meaning* matters, and `code` when physical position matters. The `keyCode` and `which` numbers are legacy fields—avoid new shortcut logic that relies on them.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
