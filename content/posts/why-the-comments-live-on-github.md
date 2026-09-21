---
title: "Why the comments live on GitHub"
date: 2026-09-20
description: "Disqus worked. Then I looked at what else it was loading, and moved the comments to giscus and GitHub Discussions."
tags: ["comments", "giscus", "performance"]
---

This site is still new, and comments were the last thing I set up. I went with Disqus
because it is the obvious choice: one `<script>` tag, and replies work without me
running a database or a moderation panel.

Then the post pages started to feel slow. I opened the network panel to see what was
loading, and there was a lot more on the page than a comment box.

## What was on the page

Disqus is not one script. It is a small ecosystem.

- LiveIntent (`d-code.liadm.com`), an advertising identity script
- the Facebook SDK (`connect.facebook.net/sdk.js`)
- Narrative.io, a data marketplace
- Rezync
- a Google-hosted copy of Roboto
- a Google OAuth iframe

Between them they set six cookies on the page: `disqusauth`, `__jid`, `disqus_unique`,
`io.narrative.guid.v2`, `zync-uuid`, and `sd-session-id`. Not one of those exists so
that a comment can be displayed.

It also broke the back/forward cache. Lighthouse reported an `unload` handler inside a
sub-frame — an old advertising pattern that quietly costs you instant back-button
navigation.

The post page weighed about 1,044 KiB. Roughly 6 KiB of that was mine.

## What bothered me

None of it was for the comments. Every reader who opened a post loaded all of it,
whether or not they scrolled down to read a reply.

I do not mind paying for something. I mind not knowing what I am paying with.

## What I moved to

Comments now run on [giscus](https://giscus.app). Like Disqus, it is one script tag.
Unlike Disqus, that is all it is: giscus reads and writes GitHub Discussions through
the GitHub API and renders the result in an iframe. There is nothing else in it.

The comments on a post are a discussion in a public repository. Signing in means
signing in with GitHub.

## The trade-offs

I am not going to pretend this costs nothing.

- **Commenting needs a GitHub account.** Some people who would have left a thoughtful
  reply will not, and that is a real loss. For a site like this I think the trade is
  worth it, but it is a trade, not a clear win.
- **The comments are public and stored elsewhere.** They live in a public repository and
  can be indexed by search engines. If that matters to you, do not use a comment box at
  all — mine included.
- **It depends on giscus.app, which is one person.** giscus is maintained by a single
  developer, funded by donations, and hosted on Vercel's open-source program. Its own
  README warns that GitHub's Discussions API is still evolving. That is a genuine
  dependency, and I would rather say so than pretend it is not there.

What makes it tolerable is that the data is not in giscus. If giscus.app disappeared
tomorrow, the worst case is that the widget stops rendering. The discussions stay in my
repository, readable without it, so nothing anyone wrote would be lost — and if I ever
want to drop even that dependency, giscus can be self-hosted.

## Where the page ended up

| | Disqus | giscus |
| --- | --- | --- |
| Page weight | ~1,044 KiB | ~124 KiB |
| Third-party cookies | 6 | 0 |
| Best Practices | 77 | 100 |
| Performance | 92 | 99 |

On the post page, Lighthouse now reports 99 / 100 / 100 / 100, and total blocking time
fell from about 360 ms to 20 ms. The widget also loads lazily, so the article is
finished before the comments even start to arrive.

## The point

Disqus worked. It just did not come alone: an advertising stack, six cookies, and
most of a megabyte of JavaScript arrived with it, and none of that was visible from the
outside.

The question is rarely whether a tool works. It is what else comes along with it.
On a page you control, you can at least look.
