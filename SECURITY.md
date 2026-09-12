# Security Policy

## Supported versions

Security fixes are applied to the current `main` branch and the latest published release.

## Reporting a vulnerability

Please do not disclose security vulnerabilities in a public GitHub issue.

Use GitHub's private vulnerability reporting for this repository when available. Include:

- a clear description of the issue;
- reproduction steps or a minimal proof of concept;
- affected files or behavior;
- the potential impact.

Do not include real API keys, access tokens, passwords, personal data, or other secrets in reports.

## Security model

API Playground is a browser-native client. Requests are made by the user's browser rather than through a server-side proxy. This intentionally preserves browser CORS boundaries and avoids turning the application into a general-purpose SSRF proxy.

Response content is rendered as data/text and is not executed as HTML or JavaScript. Local request history is browser-local storage and should be treated as untrusted client-side data.
