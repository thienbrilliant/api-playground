# API Playground

A focused browser-native HTTP client for building requests and inspecting responses without the weight of a full API platform.

## Product

API Playground is intentionally small in scope: compose an HTTP request, send it directly from the browser, inspect the response, and restore useful requests later. There is no account system, backend proxy, database, analytics layer, or cloud state in the MVP.

### Features

- GET, POST, PUT, PATCH, DELETE request builder
- Inline query-parameter and header editing with per-row enable/disable controls
- JSON request body with validation and formatting
- Cancelable requests with a 30-second timeout
- Status, timing, response size, response headers, and response body inspection
- Collapsible JSON response tree with text fallback
- Copy request URL, request body, and response body
- Browser-local request history with corrupted-storage protection
- Light/dark theme with persistent preference
- Keyboard send shortcut (`Ctrl/Cmd + Enter`)
- Responsive layout for desktop, tablet, and mobile
- Security-conscious response rendering: response HTML is always displayed as escaped text

## Architecture

The app is a Next.js App Router project with a deliberately small client boundary.

```text
app/
  layout.tsx        metadata, fonts, global shell
  page.tsx          server entrypoint
components/
  playground.tsx    request/response orchestration and interaction state
  key-value-editor.tsx
  json-viewer.tsx
  icons.tsx
lib/
  request.ts        URL validation and request construction
  network.ts        fetch, timeout, abort, response-size cap
  format.ts         JSON/text parsing and formatting
  history.ts        local persistence and schema checks
  types.ts          shared domain types
```

The request and response workflows remain client-side because `fetch` is the product's intended execution model. This means browser CORS policy remains visible and honest rather than being hidden behind an unaudited server proxy.

## Local setup

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Core functionality does not require environment variables. `.env.example` is included to make that contract explicit.

## Scripts

```text
npm run dev        Start Next.js locally
npm run lint       ESLint
npm run typecheck  TypeScript without emit
npm test           Unit + component tests
npm run test:e2e   Playwright critical-flow tests
npm run build      Production build
npm start          Serve the production build
```

The Playwright suite mocks network calls, so CI does not depend on a public API being available.

## Deployment

The project is configured for Vercel's standard Next.js deployment path. No server runtime or database is required for the MVP.

## Browser and networking limitations

Requests execute from the browser. Target APIs therefore need to permit the request through CORS. A failed browser fetch is surfaced as a request failure instead of being mislabeled as an HTTP status.

The response body is capped at 2 MB to keep the UI responsive. The cap is visible in the response inspector when triggered.

Because credentials are not a first-class feature, sensitive API keys should not be pasted into requests stored in local history. History is intentionally local to the current browser and is best-effort persistence.

## Security decisions

- Only `http:` and `https:` request URLs are accepted.
- No server-side proxy is included, avoiding an unnecessary SSRF surface.
- API responses are rendered as text/data; untrusted HTML is never injected into the DOM.
- No `eval`, `Function`, or executable response rendering is used.
- Security-conscious response headers are set by Next.js where applicable.
- Local storage is treated as untrusted input and validated before use.

## Design decisions

The interface uses a restrained developer-tool vocabulary: compact controls, explicit surfaces, low-contrast borders, monospace data, and status-first response scanning. The request editor and response inspector are the primary surfaces; history is secondary and collapsible.

The MVP prefers native browser primitives over heavy component/editor libraries. JSON formatting and tree rendering are intentionally lightweight so the product stays fast and understandable.

## Future improvements

Potential next steps include import/export of request definitions, environment variables that are explicitly scoped to a local browser session, request tabs, richer response formatting, and an optional audited proxy for APIs that cannot expose CORS.
