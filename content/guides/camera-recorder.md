---
title: Camera Recorder Guide
description: Record a short video from the webcam in the browser.
date: '2026-09-27'
tags:
- web
tool_guide_slug: camera-recorder
broader_guide:
  title: Browser Debugging Utilities
  url: /guides/browser-debugging/
---

Record a short video from your webcam and download it. Nothing is uploaded — the recording is captured with MediaRecorder and held in memory until you save it.

## Open the tool

[Use Camera Recorder](/tools/camera-recorder/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why can it not reach my camera?

Camera access needs HTTPS and an explicit permission grant. If the button is disabled, the browser is missing MediaRecorder or reports no camera.

### Where does the recording go?

Into memory in this tab, and then into your downloads folder when you save it. No part of it is sent anywhere.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
