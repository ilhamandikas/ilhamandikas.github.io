---
title: DevOps Tycoon Guide
description: Manage servers, traffic and incidents as a DevOps engineer — buy capacity, survive
  outages and keep the service profitable.
date: '2026-09-27'
tags:
- games
tool_guide_slug: devops-tycoon
broader_guide:
  title: Browser Games and Practice Tools
  url: /guides/browser-games-and-practice-tools/
---

A browser-based infrastructure management game. You run an internet service with one application server and a small budget. Traffic grows on its own, every served request earns money, and servers, bandwidth and the database all cost money to keep running. Buy capacity before the load outruns it, and answer incidents — CPU overload, disk full, database overload, traffic spikes, crashes — before users give up. The simulation is a simple one-second tick and everything runs on this page.

## Run your first minute of infrastructure

Press **Play** and watch the **Dashboard** tick once a second. **Traffic** starts at `20 req/s` against a **Capacity** of `150 req/s`, so CPU and the database sit idle and **Money** climbs as each successful request earns a little. A server costs upkeep every tick whether or not it is busy, so the aim is to buy capacity just before traffic outgrows it, not long after.

Open **Shop** and buy a **Load balancer** for `Rp 35,000`. That single purchase is the game's lesson about scaling: without it a second app server is only partly effective, and with it each server contributes its full capacity. **Redis cache** cuts database load by 30%, **CDN** serves 40% of traffic from the edge, and **WAF** filters bot traffic before it costs money. Level items such as **CPU upgrade** and **Database upgrade** can be bought repeatedly and get more expensive each time. The **1×**, **2×** and **4×** buttons change the pace once you understand the loop, and **Step** advances a single tick when you are watching one number.

When **Incidents** fills in, read the situation and the options. A quick fix is cheap but temporary — restarting the service buys a few ticks — while the matching upgrade, such as **Enable log rotation** for a full disk or **Add a server** for a CPU overload, fixes the cause. Choosing **Ignore** lets the error rate keep climbing until the incident times out and costs you satisfaction and money. Watch **SLA**, **Uptime** and **Satisfaction**: if satisfaction reaches zero, or the bills push **Money** far enough into the red, the run ends, and **Reset** starts over. Everything lives in memory, so reloading clears it and nothing is stored or sent anywhere.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How does the game decide how much money I make?

Every successful request earns a fixed amount. The error rate rises when CPU or the database pass their limits, so overloaded infrastructure earns less while still costing the same to run. Growing traffic raises revenue, which is why the shop has to keep up with it.

### Why does adding servers not help as much as I expected?

Without a load balancer, extra application servers are used inefficiently, so you only get part of their capacity. Buying the load balancer makes every server count fully. It is the game's way of showing why balancing matters as much as raw capacity.

### What happens if I ignore an incident?

The incident keeps adding to your error rate until it times out, then costs you money and satisfaction. Resolving it with a quick fix is cheap but temporary; buying the matching upgrade fixes the cause for good.

### What do the temporary fixes do?

Restarts and similar actions lower the error rate for a few ticks, buying you time to afford a permanent fix. They do not change your capacity, so the same incident can return if the underlying load is still too high.

### Is my progress saved?

No. The game runs in memory and resets when you reload the page, so there is nothing to store and nothing to clean up. Nothing is sent anywhere.

## Related guide

For more background, read [Browser Games and Practice Tools](/guides/browser-games-and-practice-tools/).
