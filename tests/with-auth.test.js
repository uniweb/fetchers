import { describe, it, expect, vi } from 'vitest'
import { withAuth } from '../src/with-auth.js'

describe('withAuth', () => {
    it('injects Authorization header with a static token', async () => {
        const inner = { resolve: vi.fn().mockResolvedValue({ data: [] }) }
        const wrapped = withAuth(inner, 'abc123')

        await wrapped.resolve({ url: 'https://x' }, {})

        expect(inner.resolve).toHaveBeenCalledWith(
            { url: 'https://x', headers: { Authorization: 'Bearer abc123' } },
            {},
        )
    })

    it('calls tokenProvider per request when it is a function', async () => {
        const inner = { resolve: vi.fn().mockResolvedValue({ data: [] }) }
        const provider = vi.fn().mockReturnValue('token-1')
        const wrapped = withAuth(inner, provider)

        await wrapped.resolve({ url: 'https://x' }, {})
        await wrapped.resolve({ url: 'https://y' }, {})

        expect(provider).toHaveBeenCalledTimes(2)
        expect(inner.resolve).toHaveBeenCalledTimes(2)
    })

    it('supports async token providers', async () => {
        const inner = { resolve: vi.fn().mockResolvedValue({ data: [] }) }
        const provider = vi.fn().mockResolvedValue('async-tok')
        const wrapped = withAuth(inner, provider)

        await wrapped.resolve({ url: 'https://x' }, {})

        expect(inner.resolve).toHaveBeenCalledWith(
            { url: 'https://x', headers: { Authorization: 'Bearer async-tok' } },
            {},
        )
    })

    it('skips injection when the provider returns a falsy value', async () => {
        const inner = { resolve: vi.fn().mockResolvedValue({ data: [] }) }
        const wrapped = withAuth(inner, () => null)

        await wrapped.resolve({ url: 'https://x' }, {})

        expect(inner.resolve).toHaveBeenCalledWith({ url: 'https://x' }, {})
    })

    it('merges onto existing request.headers', async () => {
        const inner = { resolve: vi.fn().mockResolvedValue({ data: [] }) }
        const wrapped = withAuth(inner, 'abc')

        await wrapped.resolve(
            { url: 'https://x', headers: { 'X-Trace': 'id-1' } },
            {},
        )

        expect(inner.resolve).toHaveBeenCalledWith(
            {
                url: 'https://x',
                headers: { 'X-Trace': 'id-1', Authorization: 'Bearer abc' },
            },
            {},
        )
    })

    it('respects a custom scheme', async () => {
        const inner = { resolve: vi.fn().mockResolvedValue({ data: [] }) }
        const wrapped = withAuth(inner, 'k', { scheme: 'Token' })

        await wrapped.resolve({ url: 'https://x' }, {})

        expect(inner.resolve).toHaveBeenCalledWith(
            { url: 'https://x', headers: { Authorization: 'Token k' } },
            {},
        )
    })

    it('preserves cacheKey / prerenderable from inner', () => {
        const inner = {
            resolve: vi.fn(),
            cacheKey: (req) => `ck:${req.schema}`,
            prerenderable: false,
        }
        const wrapped = withAuth(inner, 'abc')

        expect(wrapped.prerenderable).toBe(false)
        expect(wrapped.cacheKey({ schema: 'members' })).toBe('ck:members')
    })

    it('throws when fetcher has no resolve method', () => {
        expect(() => withAuth({}, 'abc')).toThrow(/resolve/)
    })
})
