import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createStaticJsonFetcher } from '../src/static-json.js'

describe('createStaticJsonFetcher', () => {
    const originalFetch = globalThis.fetch

    afterEach(() => {
        globalThis.fetch = originalFetch
    })

    function mockFetch(response) {
        const fn = vi.fn().mockResolvedValue(response)
        globalThis.fetch = fn
        return fn
    }

    function jsonResponse(data, { status = 200, statusText = 'OK' } = {}) {
        return {
            ok: status >= 200 && status < 300,
            status,
            statusText,
            headers: { get: (k) => (k === 'content-type' ? 'application/json' : null) },
            json: async () => data,
            text: async () => JSON.stringify(data),
        }
    }

    it('fetches JSON from request.path', async () => {
        const articles = [{ slug: 'a', title: 'A' }]
        const fn = mockFetch(jsonResponse(articles))
        const fetcher = createStaticJsonFetcher()

        const result = await fetcher.resolve({ path: '/data/articles.json', schema: 'articles' }, {})

        expect(fn).toHaveBeenCalledWith('/data/articles.json', expect.anything())
        expect(result.data).toEqual(articles)
        expect(result.error).toBeUndefined()
    })

    it('fetches JSON from request.url', async () => {
        const items = [{ id: 1 }]
        const fn = mockFetch(jsonResponse(items))
        const fetcher = createStaticJsonFetcher()

        const result = await fetcher.resolve(
            { url: 'https://api.example.com/items', schema: 'items' },
            {},
        )

        expect(fn).toHaveBeenCalledWith('https://api.example.com/items', expect.anything())
        expect(result.data).toEqual(items)
    })

    it('prepends basePath to local absolute paths only', async () => {
        const fn = mockFetch(jsonResponse([]))
        const fetcher = createStaticJsonFetcher({ basePath: '/docs/' })

        await fetcher.resolve({ path: '/data/a.json', schema: 'a' }, {})
        expect(fn).toHaveBeenLastCalledWith('/docs/data/a.json', expect.anything())

        await fetcher.resolve({ url: 'https://api.example.com/x', schema: 'x' }, {})
        expect(fn).toHaveBeenLastCalledWith('https://api.example.com/x', expect.anything())
    })

    it('applies transform as a dotted path', async () => {
        const fn = mockFetch(jsonResponse({ data: { items: [1, 2, 3] } }))
        const fetcher = createStaticJsonFetcher()

        const result = await fetcher.resolve(
            { url: 'https://api.example.com/x', transform: 'data.items', schema: 'x' },
            {},
        )

        expect(result.data).toEqual([1, 2, 3])
    })

    it('returns { data: [], error } on HTTP error', async () => {
        mockFetch({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            headers: { get: () => 'application/json' },
            json: async () => ({}),
            text: async () => '',
        })

        const fetcher = createStaticJsonFetcher()
        const result = await fetcher.resolve({ url: 'https://api.example.com/x', schema: 'x' }, {})

        expect(result.data).toEqual([])
        expect(result.error).toMatch(/HTTP 404/)
    })

    it('returns { data: [], error: "aborted" } on AbortError', async () => {
        const err = new Error('aborted')
        err.name = 'AbortError'
        globalThis.fetch = vi.fn().mockRejectedValue(err)

        const fetcher = createStaticJsonFetcher()
        const result = await fetcher.resolve({ url: 'https://api.example.com/x', schema: 'x' }, {})

        expect(result.data).toEqual([])
        expect(result.error).toBe('aborted')
    })

    it('passes ctx.signal through to fetch()', async () => {
        const fn = mockFetch(jsonResponse([]))
        const controller = new AbortController()
        const fetcher = createStaticJsonFetcher()

        await fetcher.resolve({ path: '/a.json', schema: 'a' }, { signal: controller.signal })

        expect(fn).toHaveBeenCalledWith('/a.json', { signal: controller.signal })
    })

    it('returns { data: null } when request is null', async () => {
        const fetcher = createStaticJsonFetcher()
        const result = await fetcher.resolve(null, {})
        expect(result).toEqual({ data: null })
    })

    it('returns { data: [], error } when no path or url', async () => {
        const fetcher = createStaticJsonFetcher()
        const result = await fetcher.resolve({ schema: 'x' }, {})
        expect(result.data).toEqual([])
        expect(result.error).toMatch(/No path or url/)
    })
})
