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
---

Inspect a connected controller: every axis with its travel, every button with its pressure, and a running note of the last input seen. It is the quick answer to whether a pad works, which stick drifts and which button has stopped registering.

## Open the tool

[Use Gamepad Tester](/tools/gamepad-tester/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is the controller missing until I press a button?

Browsers hide gamepads until an input event proves one is being used, which is a privacy measure. Press any button on the pad and it will appear, then stay listed until it is disconnected.

### A stick reports a small value while untouched. Is it broken?

A little drift below about 0.05 is normal on worn analogue sticks and browsable games compensate with a dead zone. A value that keeps climbing on its own, or a stick that never reaches 1 at full travel, points to a real fault.

### Can it test vibration or the light bar?

Not here. Those need the haptics actuators a browser exposes separately, and support varies by pad and by browser, so this page sticks to the axes and buttons that every controller reports.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
