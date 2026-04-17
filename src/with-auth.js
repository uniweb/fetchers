/**
 * withAuth
 *
 * Wrap a fetcher so every request carries an `Authorization` header.
 * The `tokenProvider` is called for each request (not at wrap time) so
 * the wrapped fetcher stays live when tokens rotate.
 *
 * The token injection is transport-specific: this helper assumes the
 * wrapped fetcher reads its auth via `request.headers` on the request
 * object. Fetchers that build their own `fetch()` calls internally read
 * `request.headers` when constructing options. Composition sticks to
 * this convention so middleware layers remain additive.
 *
 * @param {{ resolve: Function }} fetcher - Fetcher to wrap
 * @param {string | () => (string | Promise<string>)} tokenProvider -
 *   Either a static token string, or a function returning the token
 *   (possibly async). Falsy results skip the header injection.
 * @param {Object} [options]
 * @param {string} [options.scheme='Bearer'] - Auth scheme.
 * @returns {{ resolve: Function, cacheKey?: Function, prerenderable?: boolean }}
 */
export function withAuth(fetcher, tokenProvider, { scheme = 'Bearer' } = {}) {
    if (!fetcher || typeof fetcher.resolve !== 'function') {
        throw new TypeError('withAuth: fetcher must have a resolve(request, ctx) method')
    }

    const getToken =
        typeof tokenProvider === 'function'
            ? tokenProvider
            : () => tokenProvider

    const wrapped = {
        async resolve(request, ctx) {
            const token = await getToken(request, ctx)
            if (!token) return fetcher.resolve(request, ctx)

            const existing = request?.headers || {}
            const nextRequest = {
                ...request,
                headers: {
                    ...existing,
                    Authorization: `${scheme} ${token}`,
                },
            }
            return fetcher.resolve(nextRequest, ctx)
        },
    }

    // Preserve optional knobs from the inner fetcher so the dispatcher
    // still sees them.
    if (typeof fetcher.cacheKey === 'function') {
        wrapped.cacheKey = fetcher.cacheKey.bind(fetcher)
    }
    if (fetcher.prerenderable !== undefined) {
        wrapped.prerenderable = fetcher.prerenderable
    }

    return wrapped
}

export default withAuth
