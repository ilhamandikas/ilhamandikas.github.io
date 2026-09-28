# Tool guide tutorial checklist

Internal writing tracker. Not a page on the site.

- Scope: 176 tool guides in `content/guides/`.
- Starting point: 68 individually checked walkthroughs published through commit `69e903e`; 108 items tracked below. Count the unchecked boxes for current progress. Category counts in headings describe the original scope, not the current remaining count.
- Mark `[x]` only after checking the tool's actual controls and output, adding a small runnable example, explaining the result in plain English, noting meaningful limits/privacy concerns, and running the Hugo build plus `npm run check:ai`.
- Keep guide URLs, aliases, and publication dates stable. Update the checklist in the same commit as each batch of guides. Do not use a generated one-size-fits-all tutorial.
- Some generated guides repeat `data/tool-guides.yaml` FAQ material used by tool pages. Check any discrepancy before introducing a new claim.

## Encoding (4)
- [ ] `content/guides/base64-file-converter.md` — Base64 File
- [ ] `content/guides/string-obfuscator.md` — String Obfuscator
- [ ] `content/guides/safelink-decoder.md` — SafeLink Decoder
- [ ] `content/guides/basic-auth-generator.md` — Basic Auth Header

## Formats (2)
- [ ] `content/guides/sql-prettify.md` — SQL Prettify
- [ ] `content/guides/markdown-to-html.md` — Markdown to HTML

## Crypto (9)
- [x] `content/guides/ssh-key-generator.md` — SSH Key Generator
- [x] `content/guides/hmac-generator.md` — HMAC Generator
- [x] `content/guides/ulid-generator.md` — ULID Generator
- [x] `content/guides/token-generator.md` — Token Generator
- [x] `content/guides/bcrypt.md` — bcrypt
- [ ] `content/guides/aes-encryption.md` — AES Encryption
- [ ] `content/guides/rsa-key-pair.md` — RSA Key Pair
- [ ] `content/guides/bip39.md` — BIP39 Mnemonic
- [ ] `content/guides/pdf-signature-checker.md` — PDF Signature Checker

## Network (19)
- [ ] `content/guides/ip-lookup.md` — IP & Geolocation Lookup
- [ ] `content/guides/http-request-tester.md` — HTTP Request Tester
- [ ] `content/guides/curl-tester.md` — curl Tester
- [ ] `content/guides/curl-converter.md` — curl Converter
- [ ] `content/guides/grpc-tester.md` — gRPC Tester
- [ ] `content/guides/whois-lookup.md` — WHOIS Lookup
- [ ] `content/guides/ipv6-ula-generator.md` — IPv6 ULA Generator
- [ ] `content/guides/mac-address-lookup.md` — MAC Address Lookup
- [x] `content/guides/mac-address-generator.md` — MAC Address Generator
- [x] `content/guides/random-port-generator.md` — Random Port Generator
- [ ] `content/guides/websocket-tester.md` — WebSocket Tester
- [ ] `content/guides/websocket-frame-parser.md` — WebSocket Frame Parser
- [ ] `content/guides/ssh-tunnel-builder.md` — SSH Tunnel Builder
- [ ] `content/guides/email-header-analyzer.md` — Email Header Analyzer
- [ ] `content/guides/open-graph-debugger.md` — Open Graph Debugger
- [ ] `content/guides/network-info.md` — Network Info
- [ ] `content/guides/api-mock-response-builder.md` — API Mock Response Builder
- [ ] `content/guides/webhook-tester.md` — Webhook Tester
- [ ] `content/guides/snap-signature.md` — SNAP BI Asymmetric Signature

## DevOps (2)
- [ ] `content/guides/linux-ops.md` — Dev Ops
- [ ] `content/guides/xargs-builder.md` — xargs Builder

## Web (29)
- [ ] `content/guides/jwt-editor.md` — JWT Encode
- [ ] `content/guides/jwt-expiry-editor.md` — JWT Expiry Editor
- [ ] `content/guides/utm-builder.md` — UTM Builder
- [ ] `content/guides/mic-tester.md` — Microphone Recorder
- [ ] `content/guides/openapi-viewer.md` — OpenAPI Viewer
- [ ] `content/guides/meta-tag-generator.md` — Meta Tag Generator
- [ ] `content/guides/keycode-info.md` — Keycode Info
- [ ] `content/guides/otp-generator.md` — OTP Generator
- [ ] `content/guides/device-information.md` — Device Information
- [ ] `content/guides/wifi-qr-generator.md` — Wi-Fi QR Code
- [ ] `content/guides/qr-editor.md` — QR Code Editor
- [ ] `content/guides/sticker-maker.md` — Sticker Maker
- [ ] `content/guides/svg-placeholder.md` — SVG Placeholder
- [ ] `content/guides/camera-recorder.md` — Camera Recorder
- [ ] `content/guides/image-compressor.md` — Image Compressor
- [ ] `content/guides/exif-remover.md` — EXIF Remover
- [ ] `content/guides/image-format-converter.md` — Image Format Converter
- [ ] `content/guides/watermark-tool.md` — Watermark Tool
- [ ] `content/guides/photo-target-resizer.md` — Photo Resizer by Target Size
- [ ] `content/guides/screenshot-privacy-cleaner.md` — Screenshot Privacy Cleaner
- [ ] `content/guides/background-remover.md` — Background Remover
- [ ] `content/guides/zip-builder.md` — Zip Builder
- [ ] `content/guides/pdf-info.md` — PDF Page Counter and Info
- [ ] `content/guides/pdf-page-extractor.md` — PDF Page Extractor
- [ ] `content/guides/pdf-merger.md` — PDF Merger
- [ ] `content/guides/text-to-pdf.md` — Text to PDF
- [ ] `content/guides/html-wysiwyg-editor.md` — HTML Editor
- [ ] `content/guides/javascript-playground.md` — JavaScript Playground
- [ ] `content/guides/whatsapp-link-generator.md` — WhatsApp Link Generator

## Workflow (7)
- [ ] `content/guides/nginx-config-generator.md` — nginx Config Generator
- [ ] `content/guides/nginx-reverse-proxy-wizard.md` — nginx Reverse Proxy Wizard
- [ ] `content/guides/crontab-generator.md` — Crontab Generator
- [ ] `content/guides/docker-run-to-compose.md` — Docker Run to Compose
- [ ] `content/guides/log-parser.md` — Log Parser
- [ ] `content/guides/dockerfile-builder.md` — Dockerfile Builder
- [ ] `content/guides/time-zone-converter.md` — Time Zone Converter

## Text (10)
- [ ] `content/guides/lorem-ipsum.md` — Lorem Ipsum
- [ ] `content/guides/emoji-picker.md` — Emoji Picker
- [ ] `content/guides/numeronym.md` — Numeronym
- [ ] `content/guides/ascii-text-drawer.md` — ASCII Text
- [ ] `content/guides/env-key-sorter.md` — .env Key Sorter
- [ ] `content/guides/sed-replacement-builder.md` — sed Replacement Builder
- [ ] `content/guides/grep-pattern-builder.md` — grep Pattern Builder
- [ ] `content/guides/currency-formatter.md` — Currency Formatter
- [ ] `content/guides/typo-spotter.md` — Typo Spotter
- [ ] `content/guides/whatsapp-formatter.md` — WhatsApp Message Formatter

## Convert (3)
- [ ] `content/guides/fuel-economy-converter.md` — Fuel Economy Converter
- [ ] `content/guides/cli-table-converter.md` — CLI Table Converter
- [ ] `content/guides/maps-link-parser.md` — Google Maps Link Parser

## Math (8)
- [ ] `content/guides/math-evaluator.md` — Math Evaluator
- [ ] `content/guides/eta-calculator.md` — ETA Calculator
- [ ] `content/guides/interest-calculator.md` — Interest Calculator
- [ ] `content/guides/take-home-pay-calculator.md` — Take-Home Pay Calculator
- [ ] `content/guides/loan-calculator.md` — Loan Calculator
- [ ] `content/guides/chronometer.md` — Chronometer
- [ ] `content/guides/benchmark-builder.md` — Benchmark Builder
- [x] `content/guides/random-generator.md` — Random Generator

## Data (7)
- [ ] `content/guides/sql-insert-generator.md` — SQL Insert Generator
- [ ] `content/guides/email-normalizer.md` — Email Normalizer
- [ ] `content/guides/phone-parser.md` — Phone Parser
- [ ] `content/guides/iban-validator.md` — IBAN Validator
- [ ] `content/guides/nik-parser.md` — NIK Parser
- [ ] `content/guides/json-schema-validator.md` — JSON Schema Validator
- [ ] `content/guides/json-path-explorer.md` — JSON Path Explorer

## Games (8)
- [ ] `content/guides/typing-speed-test.md` — Typing Speed Test
- [ ] `content/guides/gamepad-tester.md` — Gamepad Tester
- [ ] `content/guides/game-2048.md` — 2048
- [ ] `content/guides/memory-match.md` — Memory Match
- [ ] `content/guides/minesweeper.md` — Minesweeper
- [ ] `content/guides/snake.md` — Snake
- [ ] `content/guides/tetris.md` — Tetris
- [ ] `content/guides/devops-tycoon.md` — DevOps Tycoon
