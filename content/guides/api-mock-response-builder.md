---
title: API Mock Response Builder Guide
description: Describe fields once and generate realistic mock JSON for an API response.
date: '2026-09-27'
tags:
- network
tool_guide_slug: api-mock-response-builder
broader_guide:
  title: API Testing
  url: /guides/api-testing/
---

Describe a response shape once as name: type pairs and the page generates a realistic JSON body with the number of records you ask for. It is the quick way to stub an endpoint, seed a fixture or show a frontend what the real payload will look like before the API exists.

## Describe a shape and get a payload

Paste a small field list into **Fields**, for example:

```text
id: id
name: name
email: email
active: boolean
created_at: datetime
tags: array(3)
```

With **Records** on `3`, the **Response** box immediately holds a `{ "data": [ … ] }` object with three rows, and the status reports how many were generated. Each field gets a value that fits its type: `id` counts up from 1, `name` draws from small built-in name lists, `email` looks like `ava.santos@example.com` (the domain is one of a few safe samples such as `example.com`, `mail.test` or `sample.io`), `datetime` is an ISO string, and `tags` is a three-item array of short words.

Press **Regenerate** and the values change while the shape stays the same — the payload is random every time, so if you need the exact same body twice, copy the JSON into a file rather than pressing the button again. Change **Records** to `10` and the array grows; it is capped at 50. Write a line the builder does not recognise, such as `score: rating`, and it is skipped and listed in the status instead of being guessed at, while a line with no colon like `notes` is treated as a string. Nothing is fetched: the names, addresses and emails come from local word lists, so nothing generated can collide with a real person or mailbox.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What types can I use?

string, word, name, firstname, lastname, email, phone, city, country, address, company, product, url, image, uuid, id, number, integer, price, age, boolean, date, datetime, timestamp, color, object and array(n). Anything else is reported and skipped rather than guessed.

### How do I get a list of values in one field?

Write array(3) for three items or array for a default of three. Each item is a short word, which is enough to fill a tags or categories field while you build the UI.

### Are the values random every time?

Yes. Each render draws new values, and the Regenerate button does the same. If you need the exact same payload twice, paste the generated JSON into a file instead of regenerating.

### Is the data based on anything real?

No. Names, addresses and emails are made up from small built-in word lists. They are deliberately fake so nothing generated can collide with a real person or mailbox.

## Related guide

For more background, read [API Testing](/guides/api-testing/).
