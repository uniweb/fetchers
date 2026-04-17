/**
 * @uniweb/fetchers — reusable helpers for Uniweb foundation data fetchers.
 *
 * This package is seeded empty. See the data-transport architecture plan
 * (kb/framework/plans/data-transport-architecture.md in the monorepo)
 * for the scope and the order in which helpers should land.
 *
 * Intended initial surface:
 *
 *   createStaticJsonFetcher({ basePath })  — lifted from @uniweb/runtime
 *   withAuth(fetcher, tokenProvider)       — auth-header wrapper
 *
 * More helpers (withRetry, withTimeout, composeFetchers, etc.) land only
 * when a real foundation exercises them. No speculation.
 */
