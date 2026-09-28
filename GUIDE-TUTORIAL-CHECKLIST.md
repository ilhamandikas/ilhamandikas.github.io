# Tool guide tutorial checklist

Internal writing tracker. Not a page on the site.

- Scope: 176 tool guides in `content/guides/`.
- Starting point: 68 individually checked walkthroughs published through commit `69e903e`; 108 items tracked below. Count the unchecked boxes for current progress. Category counts in headings describe the original scope, not the current remaining count.
- Mark `[x]` only after checking the tool's actual controls and output, adding a small runnable example, explaining the result in plain English, noting meaningful limits/privacy concerns, and running the Hugo build plus `npm run check:ai`.
- Keep guide URLs, aliases, and publication dates stable. Update the checklist in the same commit as each batch of guides. Do not use a generated one-size-fits-all tutorial.
- Some generated guides repeat `data/tool-guides.yaml` FAQ material used by tool pages. Check any discrepancy before introducing a new claim.

## Encoding (4)
- [x] `content/guides/base64-file-converter.md` — Base64 File
- [x] `content/guides/string-obfuscator.md` — String Obfuscator
- [x] `content/guides/safelink-decoder.md` — SafeLink Decoder
- [x] `content/guides/basic-auth-generator.md` — Basic Auth Header

## Formats (2)
- [x] `content/guides/sql-prettify.md` — SQL Prettify
- [x] `content/guides/markdown-to-html.md` — Markdown to HTML

## Crypto (9)
- [x] `content/guides/ssh-key-generator.md` — SSH Key Generator
- [x] `content/guides/hmac-generator.md` — HMAC Generator
- [x] `content/guides/ulid-generator.md` — ULID Generator
- [x] `content/guides/token-generator.md` — Token Generator
- [x] `content/guides/bcrypt.md` — bcrypt
- [x] `content/guides/aes-encryption.md` — AES Encryption
- [x] `content/guides/rsa-key-pair.md` — RSA Key Pair
- [x] `content/guides/bip39.md` — BIP39 Mnemonic
- [x] `content/guides/pdf-signature-checker.md` — PDF Signature Checker

## Network (19)
- [x] `content/guides/ip-lookup.md` — IP & Geolocation Lookup
- [x] `content/guides/http-request-tester.md` — HTTP Request Tester
- [x] `content/guides/curl-tester.md` — curl Tester
- [x] `content/guides/curl-converter.md` — curl Converter
- [x] `content/guides/grpc-tester.md` — gRPC Tester
- [x] `content/guides/whois-lookup.md` — WHOIS Lookup
- [x] `content/guides/ipv6-ula-generator.md` — IPv6 ULA Generator
- [x] `content/guides/mac-address-lookup.md` — MAC Address Lookup
- [x] `content/guides/mac-address-generator.md` — MAC Address Generator
- [x] `content/guides/random-port-generator.md` — Random Port Generator
- [x] `content/guides/websocket-tester.md` — WebSocket Tester
- [x] `content/guides/websocket-frame-parser.md` — WebSocket Frame Parser
- [x] `content/guides/ssh-tunnel-builder.md` — SSH Tunnel Builder
- [x] `content/guides/email-header-analyzer.md` — Email Header Analyzer
- [x] `content/guides/open-graph-debugger.md` — Open Graph Debugger
- [x] `content/guides/network-info.md` — Network Info
- [x] `content/guides/api-mock-response-builder.md` — API Mock Response Builder
- [x] `content/guides/webhook-tester.md` — Webhook Tester
- [x] `content/guides/snap-signature.md` — SNAP BI Asymmetric Signature

## DevOps (2)
- [x] `content/guides/linux-ops.md` — Dev Ops
- [x] `content/guides/xargs-builder.md` — xargs Builder

## Web (29)
- [x] `content/guides/jwt-editor.md` — JWT Encode
- [x] `content/guides/jwt-expiry-editor.md` — JWT Expiry Editor
- [x] `content/guides/utm-builder.md` — UTM Builder
- [x] `content/guides/mic-tester.md` — Microphone Recorder
- [x] `content/guides/openapi-viewer.md` — OpenAPI Viewer
- [x] `content/guides/meta-tag-generator.md` — Meta Tag Generator
- [x] `content/guides/keycode-info.md` — Keycode Info
- [x] `content/guides/otp-generator.md` — OTP Generator
- [x] `content/guides/device-information.md` — Device Information
- [x] `content/guides/wifi-qr-generator.md` — Wi-Fi QR Code
- [x] `content/guides/qr-editor.md` — QR Code Editor
- [x] `content/guides/sticker-maker.md` — Sticker Maker
- [x] `content/guides/svg-placeholder.md` — SVG Placeholder
- [x] `content/guides/camera-recorder.md` — Camera Recorder
- [x] `content/guides/image-compressor.md` — Image Compressor
- [x] `content/guides/exif-remover.md` — EXIF Remover
- [x] `content/guides/image-format-converter.md` — Image Format Converter
- [x] `content/guides/watermark-tool.md` — Watermark Tool
- [x] `content/guides/photo-target-resizer.md` — Photo Resizer by Target Size
- [x] `content/guides/screenshot-privacy-cleaner.md` — Screenshot Privacy Cleaner
- [x] `content/guides/background-remover.md` — Background Remover
- [x] `content/guides/zip-builder.md` — Zip Builder
- [x] `content/guides/pdf-info.md` — PDF Page Counter and Info
- [x] `content/guides/pdf-page-extractor.md` — PDF Page Extractor
- [x] `content/guides/pdf-merger.md` — PDF Merger
- [x] `content/guides/text-to-pdf.md` — Text to PDF
- [x] `content/guides/html-wysiwyg-editor.md` — HTML Editor
- [x] `content/guides/javascript-playground.md` — JavaScript Playground
- [x] `content/guides/whatsapp-link-generator.md` — WhatsApp Link Generator

## Workflow (7)
- [x] `content/guides/nginx-config-generator.md` — nginx Config Generator
- [x] `content/guides/nginx-reverse-proxy-wizard.md` — nginx Reverse Proxy Wizard
- [x] `content/guides/crontab-generator.md` — Crontab Generator
- [x] `content/guides/docker-run-to-compose.md` — Docker Run to Compose
- [x] `content/guides/log-parser.md` — Log Parser
- [x] `content/guides/dockerfile-builder.md` — Dockerfile Builder
- [x] `content/guides/time-zone-converter.md` — Time Zone Converter

## Text (10)
- [x] `content/guides/lorem-ipsum.md` — Lorem Ipsum
- [x] `content/guides/emoji-picker.md` — Emoji Picker
- [x] `content/guides/numeronym.md` — Numeronym
- [x] `content/guides/ascii-text-drawer.md` — ASCII Text
- [x] `content/guides/env-key-sorter.md` — .env Key Sorter
- [x] `content/guides/sed-replacement-builder.md` — sed Replacement Builder
- [x] `content/guides/grep-pattern-builder.md` — grep Pattern Builder
- [x] `content/guides/currency-formatter.md` — Currency Formatter
- [x] `content/guides/typo-spotter.md` — Typo Spotter
- [x] `content/guides/whatsapp-formatter.md` — WhatsApp Message Formatter

## Convert (3)
- [x] `content/guides/fuel-economy-converter.md` — Fuel Economy Converter
- [x] `content/guides/cli-table-converter.md` — CLI Table Converter
- [x] `content/guides/maps-link-parser.md` — Google Maps Link Parser

## Math (8)
- [x] `content/guides/math-evaluator.md` — Math Evaluator
- [x] `content/guides/eta-calculator.md` — ETA Calculator
- [x] `content/guides/interest-calculator.md` — Interest Calculator
- [x] `content/guides/take-home-pay-calculator.md` — Take-Home Pay Calculator
- [x] `content/guides/loan-calculator.md` — Loan Calculator
- [x] `content/guides/chronometer.md` — Chronometer
- [x] `content/guides/benchmark-builder.md` — Benchmark Builder
- [x] `content/guides/random-generator.md` — Random Generator

## Data (7)
- [x] `content/guides/sql-insert-generator.md` — SQL Insert Generator
- [x] `content/guides/email-normalizer.md` — Email Normalizer
- [x] `content/guides/phone-parser.md` — Phone Parser
- [x] `content/guides/iban-validator.md` — IBAN Validator
- [x] `content/guides/nik-parser.md` — NIK Parser
- [x] `content/guides/json-schema-validator.md` — JSON Schema Validator
- [x] `content/guides/json-path-explorer.md` — JSON Path Explorer

## Games (8)
- [x] `content/guides/typing-speed-test.md` — Typing Speed Test
- [x] `content/guides/gamepad-tester.md` — Gamepad Tester
- [x] `content/guides/game-2048.md` — 2048
- [x] `content/guides/memory-match.md` — Memory Match
- [x] `content/guides/minesweeper.md` — Minesweeper
- [x] `content/guides/snake.md` — Snake
- [x] `content/guides/tetris.md` — Tetris
- [x] `content/guides/devops-tycoon.md` — DevOps Tycoon
