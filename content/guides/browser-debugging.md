---
title: Browser Debugging Utilities
description: Device info, network info, key codes, microphones, cameras, JavaScript
  playgrounds, and browser-side testing.
date: '2026-09-27'
tags:
- web
aliases:
- /posts/how-to-check-browser-device-information/
- /posts/how-to-check-browser-network-information/
- /posts/how-to-check-keyboard-keycodes-in-the-browser/
- /posts/how-to-read-a-user-agent-string/
- /posts/how-to-use-a-javascript-playground-safely/
---

The browser shows you two different kinds of failure: what happened on the network and what your JavaScript did with the response. Keeping those separate saves a lot of guessing.

## Start in the Network tab

Reload the page with DevTools open. Find the request that failed and check its URL, method, status, and response. A missing request may mean your code never reached the fetch call. A successful `200` with a broken page means the network worked; look at parsing or rendering next.

## Read the Console as a clue, not a verdict

A CORS message tells you the browser blocked access to a response, not necessarily that the server never received the request. Fix the first relevant error, reload, and see whether the next one remains. Avoid pasting session cookies or authorization headers into a public bug report.

## Related tools

- [Camera Recorder](/tools/camera-recorder/) — Record a short video from the webcam in the browser.
- [Device Information](/tools/device-information/) — Show what the browser reports about the current device.
- [Gamepad Tester](/tools/gamepad-tester/) — See every axis and button of a connected controller, with the pressed buttons lit up.
- [JavaScript Playground](/tools/javascript-playground/) — Write JavaScript with Monaco syntax highlighting and run it in the page, reading its console output, return value and timing.
- [Keycode Info](/tools/keycode-info/) — Press a key to see its code, key and modifier state.
- [Microphone Recorder](/tools/mic-tester/) — Check a microphone, watch its level and peak, and record a clip to play back or download.
