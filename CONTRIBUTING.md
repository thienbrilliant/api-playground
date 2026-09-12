# Contributing

Thanks for contributing to API Playground.

## Development

Requirements:

- Node.js 22+
- npm

```bash
npm install
npm run dev
```

Before opening a pull request, run the quality checks that apply to your change:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Pull requests

- Keep changes focused and explain the user-facing impact.
- Add or update tests when behavior changes.
- Avoid introducing dependencies unless they provide clear product value.
- Preserve the browser-native architecture and CORS behavior unless a design change explicitly requires otherwise.
- Do not commit secrets, API keys, credentials, generated build output, or local environment files.

Use clear, conventional commit messages such as:

```text
feat: add request import
fix: preserve disabled headers
refactor: simplify response parsing
chore: update tooling
```

## Reporting issues

For bugs, include the browser, reproduction steps, expected behavior, actual behavior, and any relevant console/network errors. Never include API keys or other credentials in an issue.
