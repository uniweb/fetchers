# @uniweb/fetchers

Reusable helpers for building Uniweb foundation data fetchers. Primitives for composition (`withAuth`, `withRetry`, `composeFetchers`, ...) and complete fetchers (`createStaticJsonFetcher`, `createHttpFetcher`, ...). Pure ESM, zero runtime dependencies, tree-shakeable.

## Scope

A foundation declares a data fetcher in its `foundation.js` to own transport for the sites that use it (authentication, base URLs, response envelopes, retries). The fetcher contract is small — `(request, ctx) → Promise<{ data, error?, meta? }>` — and a foundation can write one from scratch. This package exists so most foundations don't have to.

Two layers:

- **Primitives** — small composition utilities that wrap a fetcher with cross-cutting behavior. `withAuth`, `withRetry`, `withTimeout`, `withTransform`, `composeFetchers`, `parseEnvelope`, `buildQueryString`.
- **Complete fetchers** — ready-made implementations for common patterns. `createStaticJsonFetcher` (the framework default), `createHttpFetcher` (generic REST).

The package is kept small and focused by design. New helpers land when a real foundation asks for them, not speculatively. The Uniweb framework itself never imports this package — it's for foundation authors.

## Install

```bash
pnpm add @uniweb/fetchers
```

## Conventions

ESM only. No build step. No runtime dependencies. Node ≥ 20.19. Matches the rest of the `@uniweb/*` framework: no semicolons, single quotes, 4-space indent.

## Status

Early. APIs may shift until the broader data-transport architecture stabilizes.

## License

Apache-2.0
