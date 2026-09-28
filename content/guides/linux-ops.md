---
title: Dev Ops Guide
description: Describe a Linux problem and get safe commands, flag explanations, a risk level
  and the next troubleshooting steps.
date: '2026-09-27'
tags:
- devops
tool_guide_slug: linux-ops
broader_guide:
  title: Linux Command Line Tasks Without Surprises
  url: /guides/linux-command-line/
---

A troubleshooting companion for Linux servers. Describe the problem in plain language — which process is using port 8080, disk is full, nginx returns 503 — and it finds the matching command, explains every flag, rates how risky it is and suggests what to check next. There is also an analyzer: paste the output of df, free, ss, docker ps, nginx -t, systemctl status or journalctl and it reads the output back to you. Everything runs in your browser; nothing is uploaded, and a search that looks like it contains a secret is kept out of the URL.

## Ask a question and get a command

Type a problem into the search box the way you would think it — `what is using port 8080` or `disk full` — and matching commands appear from the catalog. Open one to see the command itself, a description, the **Flags** it uses with a plain-language note on each, and a risk label: **safe**, something that **changes state**, or **dangerous**. Fill in the `{placeholders}` such as a path or interface, then **Copy** the command or **Download .sh** to save it as a script. Nothing is executed by the page, which is deliberate — a web page that could run arbitrary commands on your server is a web page that could break it, so you run the command yourself.

When a search does not match, the categories in the sidebar — CPU & Load, Disk & Filesystem, Port & Process, Docker, Database, DNS, File Search and the rest — still let you browse. Press **Ctrl/Cmd + K** for the command palette, and **Add to favorites** to pin the handful of commands you reach for most.

The **Analyzer** tab reads output rather than producing commands. Paste the result of `df`, `free`, `ss`, `docker ps`, `nginx -t`, `systemctl status`, `lsblk`, `pvs`/`lvs`, `git status` or a process list, and it detects the format, points out the lines that matter and suggests a next command. A clean `nginx -t` reads as a valid configuration while a syntax error is flagged with its line. A search that looks like it contains a secret — a token, a password, a private key — is kept out of the URL, and the catalog, index and analyzer all run in your browser.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it run the commands for me?

No. It only suggests commands and explains them; you copy the one you want and run it yourself. That is deliberate: a tool that can run anything on your server is a tool that can break your server.

### Is my search sent anywhere?

No. The catalog, the search index and the analyzer all run in your browser. Nothing is uploaded, and if a search looks like it contains a secret — a token, a password, a private key — it is kept out of the URL too.

### What can the analyzer read?

Paste the output of df, free, ss, docker ps, nginx -t, systemctl status, lsblk, git status, ps, top, pvs, or MySQL and PostgreSQL status output. It detects the format, points out the lines that matter and suggests the next command.

### Are the suggested commands safe?

Each command is labelled safe, changes state, or dangerous, and destructive ones are explained before you run them. Still read the command and its flags before pasting it into a production shell.

## Related guide

For more background, read [Linux Command Line Tasks Without Surprises](/guides/linux-command-line/).
