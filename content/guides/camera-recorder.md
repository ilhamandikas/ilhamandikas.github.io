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

[Camera Recorder](/tools/camera-recorder/) records a video **with audio** from your device using browser media APIs. The clip is held in the tab until you download it; the tool does not upload the recording.

## Record a short disposable clip

1. On a device with camera and microphone, choose **Start camera**. Your browser should ask for **both video and audio access**. Grant permission only if you intend to record; the status should say **Camera ready**, and the muted **Preview** should show your camera.
2. Choose **Start recording**, say a disposable test sentence, then choose **Stop recording**. After the browser finishes assembling the clip, the **Download** link appears. It saves `recording.webm`.
3. Play the saved file locally to confirm it has the video and sound you expected. Close or leave the page to stop the camera tracks. Do not record other people without their consent.

If camera access fails, check HTTPS, browser permissions, and whether another program is using the camera. Some browsers support MediaRecorder but not the tool's WebM recording format; it may fail at start rather than producing a link. The page does not set a time limit, so long recordings can consume substantial memory.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why can it not reach my camera?

The page requires the browser's `getUserMedia` and `MediaRecorder` APIs and permission for both camera and microphone. A disabled **Start camera** means required APIs are unavailable; an access error after clicking can also mean permission was denied or no suitable device was found.

### Where does the recording go?

Into memory in this tab, and then into your downloads folder when you save it. No part of it is sent anywhere.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
