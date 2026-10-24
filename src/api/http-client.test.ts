import { describe, expect, it, vi } from 'vitest';
import { HttpApiClient } from './http-client';
import { ApiError } from './errors';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('HttpApiClient', () => {
  it('sends the bearer token and unwraps the envelope', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { user: { id: 'u1', name: 'A' } }));
    const client = new HttpApiClient('https://api.test/api/v1', () => 'tok', fetchMock);
    const user = await client.me();
    expect(user.id).toBe('u1');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.test/api/v1/auth/me');
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer tok');
  });

  it('turns the server error envelope into an ApiError with code and details', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(422, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: [{ path: 'email', message: 'bad' }],
        },
      }),
    );
    const client = new HttpApiClient('https://api.test', () => null, fetchMock);
    const err = await client.login({ email: 'x', password: 'y' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
      details: [{ path: 'email', message: 'bad' }],
    });
  });

  it('builds the orders query string from params only when set', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { data: [], meta: { page: 2, limit: 5, total: 0, totalPages: 1 } }),
      );
    const client = new HttpApiClient('https://api.test', () => 'tok', fetchMock);
    await client.listOrders({ page: 2, limit: 5, status: 'placed' });
    await client.listOrders();
    expect((fetchMock.mock.calls[0] as [string])[0]).toBe(
      'https://api.test/orders?page=2&limit=5&status=placed',
    );
    expect((fetchMock.mock.calls[1] as [string])[0]).toBe('https://api.test/orders');
  });

  it('maps a network failure to a NETWORK_ERROR ApiError', async () => {
    const client = new HttpApiClient(
      'https://api.test',
      () => null,
      vi.fn().mockRejectedValue(new TypeError('offline')),
    );
    await expect(client.getCatalog()).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });
});
