# @uniweb/fetchers

Middleware primitives for building Uniweb foundation data fetchers. Pure ESM, zero runtime dependencies, tree-shakeable.

## Scope

A foundation declares a data fetcher in its `foundation.js` to own transport for the sites that use it — authentication, base URLs, response envelopes, retries. The fetcher contract is small — `(request, ctx) → Promise<{ data, error?, meta? }>` — and a foundation can write one from scratch. This package exists so most foundations don't have to reimplement the cross-cutting middleware.

Current surface:

- `withAuth(fetcher, tokenProvider)` — inject `Authorization` headers.

More primitives (`withRetry`, `withTimeout`, `composeFetchers`, `parseEnvelope`, `buildQueryString`, …) land when a real foundation exercises them.

## What this package is *not*

It isn't a grab bag of complete fetchers. There is no "static JSON" fetcher here, and there shouldn't be. Two reasons:

1. Sites that want default-JSON behavior just don't declare a foundation fetcher — the runtime ships one internally and the dispatcher falls back to it. Importing a copy into the foundation bundle would duplicate code that already runs.
2. Foundations that need a custom fetcher almost always hit a real API — static JSON isn't the pattern to reuse. They write `resolve()` against `fetch()` and wrap it with middleware from this package.

The framework itself never imports this package. It's foundation-facing only.

## Install

```bash
pnpm add @uniweb/fetchers
```

## Conventions

ESM only. No build step. No runtime dependencies. Node ≥ 20.19. Matches the rest of the `@uniweb/*` framework (no semicolons, single quotes).

## Status

Early. APIs may shift until the broader data-transport architecture stabilizes.

## License

Apache-2.0
