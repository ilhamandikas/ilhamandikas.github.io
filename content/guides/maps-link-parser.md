---
title: Google Maps Link Parser Guide
description: Pull the latitude and longitude out of a Google Maps link and export it as JSON,
  CSV, SQL or GeoJSON.
date: '2026-09-27'
tags:
- convert
tool_guide_slug: maps-link-parser
broader_guide:
  title: Indonesian Data Formats
  url: /guides/indonesian-data-formats/
---

Paste a Google Maps link and the page pulls out the latitude and longitude, then writes them the way you need them: a plain pair, degrees minutes and seconds, JSON, CSV, a SQL INSERT or a GeoJSON point. A label you type is carried into the formats that have a place for it.

## Open the tool

[Use Google Maps Link Parser](/tools/maps-link-parser/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does a short link not work?

A maps.app.goo.gl link only reveals its coordinates after a network request follows the redirect, and this page makes no requests. Open the link once in a browser and paste the full URL from the address bar.

### Which part of the link is used?

The viewport centre after the @ sign comes first, then the place coordinates marked with !3d and !4d, then query parameters such as q or destination. The first valid pair wins.

### Why are the coordinates rounded?

Six decimal places is about ten centimetres on the ground, which is finer than any map pin. Rounding there keeps the numbers readable without losing meaningful precision.

## Related guide

For more background, read [Indonesian Data Formats](/guides/indonesian-data-formats/).
