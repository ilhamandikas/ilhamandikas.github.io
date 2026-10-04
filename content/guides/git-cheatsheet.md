---
title: Git Cheatsheet Guide
description: A quick reference of the Git commands I keep forgetting.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: git-cheatsheet
broader_guide:
  title: Linux Command Line Tasks Without Surprises
  url: /guides/linux-command-line/
about: 'A searchable reference for the Git commands that come up less often: undoing a commit,
  recovering a deleted branch, rewriting history, and finding which commit introduced a line.'
faq:
- q: Is it safe to run these commands?
  a: Read what each one does first. The entries that rewrite history are marked, because on
    a shared branch they affect everyone who has pulled it.
---

Git records changes to files in a repository. [Git Cheatsheet](/tools/git-cheatsheet/) is a short list of commands you can search when you forget a name. It **does not run Git** or inspect your repository.

## Start with a command that only looks

Type `status` in the search box. Find `git status`, which shows changed, staged, and untracked files. You can run that in a repository to see what is happening **without** discarding changes. Search for `diff --staged` next: that command shows what has been staged for the next commit.

If you need to undo a commit already shared with others, search for `git revert`. It creates a **new** commit reversing an earlier one. This differs from `git reset --hard HEAD~1`, which moves your local branch and **discards local changes**. Read the description and check your branch before choosing an undo command.

## What a cheatsheet cannot know

The right command depends on whether changes are only in your working files, staged, committed, or already pushed. Search finds a command by its text or description, but it does not know your repository's state. Make a backup or ask a teammate before rewriting shared history.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Linux Command Line Tasks Without Surprises](/guides/linux-command-line/).
