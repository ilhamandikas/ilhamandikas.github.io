---
title: Microphone Recorder Guide
description: Check a microphone, watch its level and peak, and record a clip to play back
  or download.
date: '2026-09-27'
tags:
- web
tool_guide_slug: mic-tester
broader_guide:
  title: Browser Debugging Utilities
  url: /guides/browser-debugging/
---

Find out whether a microphone is picking anything up, and how loudly, then keep a clip of it. The browser opens the input and the level is measured on a bar with a peak marker, so a quiet headset or a muted laptop mic is obvious at a glance. Press Record and the same signal is captured, so the recording can be played back on the page straight away or downloaded as a file.

## Open the tool

[Use Microphone Recorder](/tools/mic-tester/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Where does the recording go?

Nowhere. It is held as a blob in this tab, played through a local object url and dropped when the tab closes. The only way it leaves the browser is if you press Download.

### Why does the browser ask for permission?

Reading a microphone requires an explicit grant by design, and it is asked for the first time you press Start microphone. If it was blocked earlier, the padlock in the address bar is where you allow it again.

### What format is the clip saved in?

Whatever the browser can encode, which is usually WebM with Opus in Chrome and Firefox and MP4 in Safari. The panel names the format it used, and the download keeps the matching file extension.

### Why does the bar barely move when I speak?

Usually the wrong input device is selected, or its gain is low in the system sound settings. Also check that automatic gain control is not fighting the test, and try again closer to the microphone.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
