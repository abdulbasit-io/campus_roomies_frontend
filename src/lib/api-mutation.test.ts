import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('apiMutation CSRF handling', () => {
  it('shares one CSRF request across concurrent mutations', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_ORIGIN', 'https://api.campusroomies.example/api');
    const requests: Array<{ url: string; headers?: HeadersInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      requests.push({ url, headers: init?.headers });
      if (url.endsWith('/auth/csrf')) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        return new Response(JSON.stringify({ data: { token: 'shared-csrf-token' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ data: { saved: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }));

    const { apiMutation } = await import('./api');
    await Promise.all([
      apiMutation('/listings/one/interests', 'POST'),
      apiMutation('/listings/two/interests', 'POST'),
    ]);

    expect(requests.filter(({ url }) => url.endsWith('/auth/csrf'))).toHaveLength(1);
    const mutations = requests.filter(({ url }) => !url.endsWith('/auth/csrf'));
    expect(mutations).toHaveLength(2);
    expect(mutations.every(({ headers }) =>
      new Headers(headers).get('x-csrf-token') === 'shared-csrf-token')).toBe(true);
  });
});
