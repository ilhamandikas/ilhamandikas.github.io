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
about: 'Paste a Google Maps link and the page pulls out the latitude and longitude, then writes
  them the way you need them: a plain pair, degrees minutes and seconds, JSON, CSV, a SQL
  INSERT or a GeoJSON point. A label you type is carried into the formats that have a place
  for it.'
faq:
- q: Why does a short link not work?
  a: A maps.app.goo.gl link only reveals its coordinates after a network request follows the
    redirect, and this page makes no requests. Open the link once in a browser and paste the
    full URL from the address bar.
- q: Which part of the link is used?
  a: The viewport centre after the @ sign comes first, then the place coordinates marked with
    !3d and !4d, then query parameters such as q or destination. The first valid pair wins.
- q: Why are the coordinates rounded?
  a: Decimal and export formats round the parsed coordinates to six places for readability.
    This does not improve the accuracy of the original map location; do not treat the last
    digit as a measurement guarantee.
---

A **coordinate pair** is a latitude (north/south) and a longitude (east/west). [Google Maps Link Parser](/tools/maps-link-parser/) extracts a pair from some full Maps links or from plain coordinates, then writes it in another format. It does not open the map or check that the pin is accurate.

## Start with a plain pair

Replace **Maps link or coordinates** with `0, 10` and change **Label** to `Demo`. Leave **Output format** on **Decimal degrees**: **Output** should read `0, 10`. Choose **JSON** to see the label, latitude `0`, and longitude `10` as named fields. Choose **GeoJSON**: its point coordinates are `[10, 0]` because **GeoJSON uses longitude first**, unlike the input. **Copy** takes the displayed text; **Download** saves it as `location.txt` regardless of selected format.

For a full link such as `https://www.google.com/maps/@-6.2088,106.8456,15z`, the tool first takes coordinates after `@`. If none are found, it tries other patterns. A short redirect link cannot be expanded here; open it yourself only if you trust it, then paste a full URL. **No coordinates found in that link** means the text did not match a supported pair; check the link or enter the coordinates directly. Location information can be sensitive—use example coordinates when sharing output.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Indonesian Data Formats](/guides/indonesian-data-formats/).
