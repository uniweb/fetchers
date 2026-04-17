/**
 * @uniweb/fetchers — middleware primitives for custom foundation fetchers.
 *
 * A foundation declares a data fetcher in its foundation.js to own transport
 * for the sites that use it (authentication, base URLs, response envelopes,
 * retries). The fetcher contract is small —
 * `(request, ctx) → Promise<{ data, error?, meta? }>` — and a foundation
 * can write one from scratch. This package exists so most foundations don't
 * have to reimplement the cross-cutting middleware.
 *
 * Current surface:
 *
 *   withAuth(fetcher, tokenProvider) — inject Authorization headers.
 *
 * More helpers (withRetry, withTimeout, composeFetchers, parseEnvelope, etc.)
 * land when real foundations exercise them. No speculation.
 *
 * The framework's default URL fetcher (used when a site declares no foundation
 * fetcher at all) lives inside @uniweb/runtime as an internal module. It's not
 * exported here because foundations shouldn't "reuse + wrap" it — doing so
 * would duplicate the code into every foundation bundle. Foundations that
 * need transport either skip declaring a fetcher (the runtime default handles
 * the plain-JSON case) or write their own.
 */

export { withAuth } from './with-auth.js'
