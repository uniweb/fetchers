/**
 * createStaticJsonFetcher
 *
 * The framework's default URL fetcher, published here as a composable helper.
 * Plain `fetch()` against `request.path` (local) or `request.url` (remote),
 * parses JSON, and optionally extracts a dotted sub-path from the response.
 *
 * @param {Object} [options]
 * @param {string} [options.basePath=''] - Prepended to `request.path` for
 *   local paths that begin with `/`. Used by sites deployed under a subdirectory.
 *   Remote URLs are never rewritten. An empty string or '/' means no rewrite.
 *
 * @returns {{ resolve: (req: Object, ctx: Object) => Promise<{ data, error?, meta? }> }}
 */
export function createStaticJsonFetcher({ basePath = '' } = {}) {
    const prefix = basePath && basePath !== '/' ? basePath.replace(/\/$/, '') : ''

    return {
        async resolve(request, ctx = {}) {
            if (!request) return { data: null }
            const { path, url, transform } = request

            let target = path || url
            if (!target) return { data: [], error: 'No path or url specified' }

            // Prepend basePath to local absolute paths (not remote URLs).
            if (prefix && target.startsWith('/') && !target.startsWith('//')) {
                target = prefix + target
            }

            try {
                const response = await fetch(target, { signal: ctx.signal })
                if (!response.ok) {
                    return {
                        data: [],
                        error: `HTTP ${response.status}: ${response.statusText}`,
                    }
                }

                const contentType = response.headers.get('content-type') || ''
                let data
                if (contentType.includes('application/json')) {
                    data = await response.json()
                } else {
                    const text = await response.text()
                    try {
                        data = JSON.parse(text)
                    } catch {
                        data = text
                    }
                }

                if (transform && data !== null && data !== undefined) {
                    data = getNestedValue(data, transform)
                }

                return { data: data ?? [] }
            } catch (error) {
                if (error?.name === 'AbortError') {
                    // Propagate aborts as errors so the dispatcher doesn't cache.
                    return { data: [], error: 'aborted' }
                }
                return { data: [], error: error?.message || String(error) }
            }
        },
    }
}

/**
 * Walk a dotted path into an object. Missing segments short-circuit to
 * `undefined` so callers can distinguish "present and empty" from "not there."
 */
function getNestedValue(obj, path) {
    if (!obj || !path) return obj
    let current = obj
    for (const part of path.split('.')) {
        if (current === null || current === undefined) return undefined
        current = current[part]
    }
    return current
}

export default createStaticJsonFetcher
