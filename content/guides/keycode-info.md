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
---

Press a key and see everything the browser reports about it: the key name, the legacy keyCode and whichCode, the physical position on the keyboard, and which modifier keys were held. It is for wiring up a shortcut without guessing.

## Open the tool

[Use Keycode Info](/tools/keycode-info/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is keyCode deprecated?

It is inconsistent across layouts and languages — the same physical key reports different values. Use event.key for the character and event.code for the physical position, and press a key here to see the difference.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
