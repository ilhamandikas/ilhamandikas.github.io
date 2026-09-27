---
title: Case Converter Guide
description: Switch text between camelCase, snake_case, kebab-case and more.
date: '2026-09-27'
tags:
- text
tool_guide_slug: case-converter
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

Code and file names often join several words into one name. The words can be written with capital letters, underscores, or dashes. [Case Converter](/tools/case-converter/) shows several versions at once so you can copy the one your project uses.

## Start with two words

Type `hello world` in **Text**. Look under **Converted**:

- **camelCase** should be `helloWorld` — the first word starts small; the next word starts with a capital.
- **snake_case** should be `hello_world` — an underscore joins the words.
- **kebab-case** should be `hello-world` — a dash joins the words.
- **PascalCase** should be `HelloWorld` — both words start with capitals.

The values update as you type. Use the **Copy** button on the row you want; the tool does not change your input. Try `hello_world` next and check that it finds the same two words.

## Where it can guess wrong

The tool splits on spaces, separators, and some changes from small to capital letters. If a name is ambiguous, it cannot know what its author meant. Check the output before renaming code or a public URL. Changing a public URL may break existing links; converting the text here does not set up a redirect.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How does it split words that are already joined together?

It splits on separators and on the case boundaries it can see, so getHTTPResponse becomes get, HTTP, Response. Where the input is ambiguous it can only ever be a guess.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
