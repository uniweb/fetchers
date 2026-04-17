/**
 * @uniweb/fetchers — reusable helpers for Uniweb foundation data fetchers.
 *
 * Current surface:
 *
 *   createStaticJsonFetcher({ basePath })  — plain URL GET + JSON parse,
 *                                            lifted from the framework runtime.
 *   withAuth(fetcher, tokenProvider)       — inject Authorization headers.
 *
 * More helpers land when real foundations exercise them. No speculation.
 */

export { createStaticJsonFetcher } from './static-json.js'
export { withAuth } from './with-auth.js'
