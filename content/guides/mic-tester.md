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
about: Find out whether a microphone is picking anything up, and how loudly, then keep a clip
  of it. The browser opens the input and the level is measured on a bar with a peak marker,
  so a quiet headset or a muted laptop mic is obvious at a glance. Press Record and the same
  signal is captured, so the recording can be played back on the page straight away or downloaded
  as a file.
faq:
- q: Where does the recording go?
  a: Nowhere. It is held as a blob in this tab, played through a local object url and dropped
    when the tab closes. The only way it leaves the browser is if you press Download.
- q: Why does the browser ask for permission?
  a: Reading a microphone requires an explicit grant by design, and it is asked for the first
    time you press Start microphone. If it was blocked earlier, the padlock in the address
    bar is where you allow it again.
- q: What format is the clip saved in?
  a: Whatever the browser can encode, which is usually WebM with Opus in Chrome and Firefox
    and MP4 in Safari. The panel names the format it used, and the download keeps the matching
    file extension.
- q: Why does the bar barely move when I speak?
  a: Usually the wrong input device is selected, or its gain is low in the system sound settings.
    Also check that automatic gain control is not fighting the test, and try again closer
    to the microphone.
---

Find out whether a microphone is picking anything up, and how loudly, then keep a clip of it. The browser opens the input and the level is measured on a bar with a peak marker, so a quiet headset or a muted laptop mic is obvious at a glance. Press Record and the same signal is captured, so the recording can be played back on the page straight away or downloaded as a file.

## Check a microphone

Click **Start microphone** and grant permission when the browser asks. Speak, and the **Level** bar should move: **Level** shows the current reading in dBFS and **Peak** remembers the loudest moment since you started, with a peak near 0 meaning the input clipped. Click **Record**, speak a sentence, then click **Stop recording**. The **Recording** panel appears with a player, the length, the size and the format; **Download** saves the clip and **Discard** throws it away.

If the bar barely moves, the wrong input device may be selected or the system gain is low. This tool asks for the raw signal without echo cancellation or automatic gain. **Stop microphone** releases the device. The clip lives in memory and is never uploaded, so the only way it leaves the browser is your own download.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
