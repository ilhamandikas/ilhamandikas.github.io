---
title: Working With Structured Data
description: JSON, YAML, TOML, XML, CSV, JSONPath, schemas, diffs, viewers, and format
  conversion caveats.
date: '2026-09-27'
tags:
- data
aliases:
- /posts/how-to-compare-json-without-being-distracted-by-formatting/
- /posts/how-to-convert-json-yaml-and-toml-without-changing-meaning/
- /posts/how-to-format-json-before-debugging-it/
- /posts/how-to-format-lines-into-commas-quotes-and-sql-lists/
- /posts/how-to-format-xml-before-reading-it/
- /posts/how-to-generate-sql-inserts-from-csv-or-json/
- /posts/how-to-open-a-csv-file-without-spreadsheet-surprises/
- /posts/how-to-read-yaml-without-getting-lost-in-indentation/
- /posts/how-to-turn-csv-into-json-without-breaking-the-data/
- /posts/how-to-turn-json-into-csv-for-spreadsheets/
- /posts/how-to-turn-terminal-tables-into-markdown-or-csv/
- /posts/how-to-use-json-viewer-for-large-api-responses/
- /posts/how-to-use-jsonpath-to-find-data/
- /posts/how-to-validate-json-with-a-schema/
---

JSON, YAML, TOML, XML, CSV, JSONPath, schemas, diffs, viewers, and format conversion caveats.

This guide is the canonical guide page for related tools on ilham.dev. It should grow into practical explanations, caveats, examples, and references instead of creating one thin article per utility.

## Related tools

- [CLI Table Converter](/tools/cli-table-converter/) — Turn aligned terminal output such as docker ps or df into a Markdown table, CSV or TSV.
- [CSV and JSON Converter](/tools/csv-json-converter/) — Convert CSV to JSON, or JSON back to CSV, with configurable delimiter and pretty-printing.
- [CSV Viewer](/tools/csv-viewer/) — Open a CSV, TSV or pipe-separated file, filter it and sort it column by column in a table.
- [JSON Diff](/tools/json-diff/) — Compare two JSON documents and highlight the differences.
- [JSON Formatter](/tools/json-formatter/) — Validate, pretty-print and minify JSON, with optional key sorting.
- [JSON Minifier](/tools/json-minifier/) — Strip all whitespace from JSON to shrink it.
- [JSON Path Explorer](/tools/json-path-explorer/) — Evaluate JSONPath expressions against JSON, list every match with its path, and browse the document as a clickable tree.
- [JSON Schema Validator](/tools/json-schema-validator/) — Validate a JSON document against a JSON Schema and list every problem with the exact JSON Pointer path.
- [JSON to CSV](/tools/json-to-csv/) — Flatten a JSON array of objects into CSV.
- [JSON to TOML](/tools/json-to-toml/) — Convert JSON documents to TOML.
- [JSON to XML](/tools/json-to-xml/) — Convert JSON documents to XML.
- [JSON to YAML](/tools/json-to-yaml/) — Convert JSON documents to YAML.
- [JSON Viewer](/tools/json-viewer/) — Explore a JSON document as a collapsible tree or as a table of records, with a live count of nested values.
- [TOML to JSON](/tools/toml-to-json/) — Convert TOML documents to JSON.
- [TOML to YAML](/tools/toml-to-yaml/) — Convert TOML documents to YAML.
- [XML Formatter](/tools/xml-formatter/) — Pretty-print and minify XML.
- [XML to JSON](/tools/xml-to-json/) — Convert XML documents to JSON.
- [YAML to JSON](/tools/yaml-to-json/) — Convert YAML documents to JSON.
- [YAML to TOML](/tools/yaml-to-toml/) — Convert YAML documents to TOML.
- [YAML Viewer](/tools/yaml-viewer/) — Validate and explore a YAML document.

## Notes for future edits

- Keep the guide reusable and factual.
- Link to personal posts only when there is a real incident, measurement, migration, or lesson.
- For sensitive inputs, mention whether the related tool runs locally in the browser and warn against pasting production secrets without understanding the trust boundary.
