---
title: WhatsApp Message Formatter Guide
description: Format a WhatsApp message with bold, italic, strikethrough, monospace and lists,
  with a live preview.
date: '2026-09-27'
tags:
- text
tool_guide_slug: whatsapp-formatter
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
about: Write a WhatsApp message without remembering which character makes what bold. Select
  some text and press a button to wrap it, or press a list button to prefix each line, then
  watch the preview update to show how the message will look. Bold, italic, strikethrough
  and monospace are all supported, and the raw marker characters stay in the text so you can
  copy it straight into the chat box.
faq:
- q: Which markers does WhatsApp use?
  a: An asterisk on each side for bold, an underscore for italic, a tilde for strikethrough
    and three backticks for monospace. They only take effect when the character touches text
    with no space, which is why the wrap button adds them snugly.
- q: Do the buttons need a selection?
  a: No. With nothing selected the markers are inserted as a pair and the caret is placed
    between them, so you can type the text afterwards. With a selection the markers go around
    it.
- q: Can the preview differ from WhatsApp?
  a: Slightly. The page renders the markers as HTML for a quick look, while WhatsApp applies
    its own rules, so an unusual nesting of markers may look a little different in the app.
    The copy button always gives you the plain text with markers.
---

WhatsApp uses simple characters around text to show emphasis. [WhatsApp Message Formatter](/tools/whatsapp-formatter/) adds those characters for you and shows an approximate **Preview**. The preview is not a message sent to WhatsApp.

## Format a test message

Replace **Message** with `Ready to ship`. Select only `Ready`, then press **Bold**. The message should become `*Ready* to ship`, while **Preview** shows **Ready** in bold. Press **Copy message** to copy the text *with* the asterisks; paste it into a draft to inspect it before sending. You can also select lines and press **Bullet list** or **Numbered list** to add a prefix to each line.

If nothing is selected, the emphasis buttons insert a pair of markers with the cursor between them, ready for typing. The list buttons work on the current line even without a selection. **Preview** follows this tool's simplified formatting rules; check the actual result in WhatsApp, especially for combined or unusual markers. Do not put private chat content in a shared screenshot.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
