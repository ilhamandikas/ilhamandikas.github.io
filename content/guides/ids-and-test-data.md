---
title: IDs and Test Data
description: UUIDs, ULIDs, generated MAC addresses, and safe fake identifiers for
  tests and examples.
date: '2026-09-27'
tags:
- data
---

Test data should be recognisable as test data. A random-looking identifier is useful for avoiding accidental collisions in a demo; it is not automatically an account, a valid document number, or a safe password.

## Choose the right kind of value

UUIDs and ULIDs are identifiers with different shapes and ordering properties. Pick the format your application expects rather than converting every ID just because a generator can. For sample email and web addresses, use reserved examples such as `user@example.com` and `example.com`.

## Do not confuse shape with validity

A string that matches a format may still fail business rules or uniqueness checks. Test both valid-looking and deliberately invalid inputs. Keep generated sample data separate from production records so it is not mistaken for a real person.

## Related tools

- [ULID Generator](/tools/ulid-generator/) — Generate sortable ULIDs, single or in bulk.
- [UUID Generator](/tools/uuid-generator/) — Generate v4 UUIDs, single or in bulk.
