---
title: Gamepad Tester Guide
description: See every axis and button of a connected controller, with the pressed buttons
  lit up.
date: '2026-09-27'
tags:
- games
tool_guide_slug: gamepad-tester
broader_guide:
  title: Browser Debugging Utilities
  url: /guides/browser-debugging/
about: 'Inspect a connected controller: every axis with its travel, every button with its
  pressure, and a running note of the last input seen. It is the quick answer to whether a
  pad works, which stick drifts and which button has stopped registering.'
faq:
- q: Why is the controller missing until I press a button?
  a: Browsers hide gamepads until an input event proves one is being used, which is a privacy
    measure. Press any button on the pad and it will appear, then stay listed until it is
    disconnected.
- q: A stick reports a small value while untouched. Is it broken?
  a: This page reports values rounded to two decimals; it does not apply a configurable dead
    zone or diagnose hardware. Compare repeated readings at rest and while moving the stick,
    then check your game or OS calibration before deciding something is faulty.
- q: Can it test vibration or the light bar?
  a: Not here. Those need the haptics actuators a browser exposes separately, and support
    varies by pad and by browser, so this page sticks to the axes and buttons that every controller
    reports.
---

[Gamepad Tester](/tools/gamepad-tester/) reads the browser's Gamepad API and displays controllers it reports, including stick **axes** (typically -1 to 1) and button values (typically 0 to 1). It cannot determine whether a controller is physically broken or test vibration.

## Check a controller

Connect a gamepad, open the page, then press one of its buttons. **Connected** should show a controller count and a panel with its name, axes, and buttons. Press a face button: its value should rise while pressed, and **Last input** names that button if the browser provides the standard mapping. Move a stick: watch the relevant axis change from around `0` and return toward it when released. With no accessible controller, the page prompts you to press a button or reports that the API is unavailable.

Browsers often reveal a gamepad only *after* interaction. The exact names and readings depend on the device and browser; small nonzero values at rest are not a diagnosis by themselves. No controller readings are uploaded by this tool.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
