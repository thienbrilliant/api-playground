# API Playground

> A lightweight, browser-native HTTP client for developers who want to build requests, inspect responses, and debug APIs without a full API platform.

[![CI](https://github.com/thienbrilliant/api-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/thienbrilliant/api-playground/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-315b4b.svg)](LICENSE)

## Why

API Playground is deliberately small. It gives developers a focused request builder and response inspector while keeping the execution model honest: requests run directly in the browser, so normal browser CORS policy still applies.

There is no account system, database, analytics layer, cloud request storage, or server-side proxy.

## Features

- GET, POST, PUT, PATCH, and DELETE
- URL, query parameter, and request header editing
- Enable/disable individual query and header rows
- JSON request body validation and formatting
- Cancelable requests with a 30-second timeout
- HTTP status, status text, timing, response size, and response headers
- Collapsible JSON response tree with text fallback
- Copy URL, request body, and response body
- Browser-local request history with corrupt-storage protection
- Light/dark theme with persistent preference
- `Ctrl/Cmd + Enter` send shortcut
- Responsive desktop, tablet, and mobile UI
- Escaped response rendering; response HTML is never injected into the DOM
- Lightweight implementation with native browser primitives instead of a large editor stack

## Screens and behavior

The primary workflow is intentionally linear:

1. Configure the request.
2. Send it from the browser.
3. Inspect status, timing, headers, and body.
4. Restore previous requests from local history when needed.

## Architecture

```text
app/
  layout.tsx             metadata and application shell
  page.tsx               server entrypoint
  globals.css            design tokens and global styles

components/
  playground.tsx         request/response orchestration
  key-value-editor.tsx   query/header editor
  json-viewer.tsx        lightweight JSON tree
  icons.tsx              local SVG icon primitives

lib/
  request.ts             URL validation and request construction
  network.ts             fetch, timeout, abort, response-size cap
  format.ts              response parsing and formatting
  history.ts             local persistence and schema validation
  types.ts               shared domain types
  id.ts                  client-side history IDs

tests/                    unit/component tests
e2e/                      Playwright critical-flow tests
.github/workflows/        CI
```

The client boundary is intentionally small. Request preparation, network handling, formatting, and history persistence remain isolated from presentation code.

## Requirements

- Node.js 22+
- npm
- A modern browser with `fetch`, `AbortController`, Clipboard API, and local storage support

## Local development

```bash
git clone https://github.com/thienbrilliant/api-playground.git
cd api-playground
npm install
npm run dev
```

Open `http://localhost:3000`.

The core application does not require environment variables. `.env.example` documents that contract explicitly.

## Quality checks

Run the same checks used by CI before shipping a change:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

For a production-like local run:

```bash
npm run build
npm start
```

The Playwright suite mocks its API traffic, so end-to-end CI does not depend on a third-party public API.

## Deployment

API Playground is a standard Next.js application and can be deployed to Vercel or another Node-compatible Next.js host.

The MVP does not require a database, server-side API runtime, or application secrets.

## Browser and networking model

Requests execute from the user's browser. The target API must therefore allow the browser request through CORS. A browser-level failure is surfaced as a request/network error instead of being mislabeled as an HTTP status.

The application accepts only `http:` and `https:` request URLs. There is no server-side request proxy, which avoids turning the deployment into a general-purpose SSRF primitive.

Response bodies are capped at 2 MB to keep the inspector responsive. When the cap is reached, the UI indicates that the displayed size is truncated.

## Security notes

- Only `http:` and `https:` request targets are accepted.
- No server-side proxy is included.
- Response HTML is rendered as text/data; untrusted markup is never executed or injected.
- No `eval`, `Function`, or executable response rendering is used.
- Browser local storage is treated as untrusted input and validated before use.
- Request history is local to the current browser. Do not store production credentials or sensitive API keys in it.

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for development, testing, pull-request, and commit conventions.

## Release notes

See [CHANGELOG.md](CHANGELOG.md) for user-facing release history.

## License

API Playground is released under the [MIT License](LICENSE).
