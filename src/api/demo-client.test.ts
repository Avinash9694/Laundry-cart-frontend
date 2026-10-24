import { beforeEach, describe, expect, it } from 'vitest';
import { DemoApiClient } from './demo-client';
import { DEMO_ACCOUNT } from './demo-data';
import { seedDemoOrders } from './demo-seed';
import { ApiError } from './errors';
import { MemoryStorage } from '@/test/setup';

const address = {
  line1: '12 Jubilee Hills',
  city: 'Hyderabad',
  pincode: '500033',
  phone: '+91 98765 43210',
};

function make(storage = new MemoryStorage()) {
  let token: string | null = null;
  const client = new DemoApiClient(() => token, { storage, latencyMs: 0 });
  return { client, storage, setToken: (t: string | null) => (token = t) };
}

describe('DemoApiClient', () => {
  let ctx: ReturnType<typeof make>;
  beforeEach(() => {
    ctx = make();
  });

  it('signs in the bundled demo account and rejects a wrong password with 401', async () => {
    const res = await ctx.client.login({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    });
    expect(res.user.email).toBe(DEMO_ACCOUNT.email);
    expect(res.token).toMatch(/^demo\./);
    await expect(
      ctx.client.login({ email: DEMO_ACCOUNT.email, password: 'wrong' }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('registers a new account, refuses duplicates and never stores the raw password', async () => {
    const res = await ctx.client.register({
      name: 'Asha',
      email: 'Asha@Example.com',
      password: 'secret-pass',
    });
    expect(res.user.email).toBe('asha@example.com');
    await expect(
      ctx.client.register({ name: 'Asha', email: 'asha@example.com', password: 'x'.repeat(8) }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(ctx.storage.getItem('laundry-cart.demo')).not.toContain('secret-pass');
  });

  it('requires a token for orders', async () => {
    await expect(ctx.client.listOrders()).rejects.toMatchObject({ status: 401 });
  });

  it('creates an order priced by the shared module and persists it across client instances', async () => {
    const { token } = await ctx.client.login({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    });
    ctx.setToken(token);
    const order = await ctx.client.createOrder({
      items: [
        { garmentId: 'shirts', quantity: 2, washTypeIds: ['wash', 'iron'] },
        { garmentId: 'sarees', quantity: 1, washTypeIds: ['dry-clean'] },
      ],
      storeId: 'hitech-city',
      address,
    });
    expect(order.pricing).toEqual({ subtotal: 250, deliveryFee: 49, total: 299, totalItems: 3 });
    expect(order.status).toBe('placed');
    expect(order.orderNumber).toMatch(/^LC-\d{6}-[A-Z0-9]{4}$/);

    const second = make(ctx.storage);
    second.setToken(token);
    const fetched = await second.client.getOrder(order.id);
    expect(fetched.id).toBe(order.id);
  });

  it('paginates and filters my orders, newest first', async () => {
    const { token } = await ctx.client.login({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    });
    ctx.setToken(token);
    seedDemoOrders(ctx.client);
    const page1 = await ctx.client.listOrders({ page: 1, limit: 4 });
    expect(page1.data).toHaveLength(4);
    expect(page1.meta).toEqual({ page: 1, limit: 4, total: 6, totalPages: 2 });
    const dates = page1.data.map((o) => o.createdAt);
    expect([...dates].sort().reverse()).toEqual(dates);
    const delivered = await ctx.client.listOrders({ status: 'delivered' });
    expect(delivered.data.every((o) => o.status === 'delivered')).toBe(true);
    expect(delivered.meta.total).toBe(2);
    expect(seedDemoOrders(ctx.client)).toBe(0);
  });

  it('cancels only placed orders and hides other users’ orders as 404', async () => {
    const { token } = await ctx.client.login({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    });
    ctx.setToken(token);
    const order = await ctx.client.createOrder({
      items: [{ garmentId: 'towels', quantity: 1, washTypeIds: ['wash'] }],
      storeId: 'gachibowli',
      address,
    });
    const cancelled = await ctx.client.cancelOrder(order.id);
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.statusHistory.map((h) => h.status)).toEqual(['placed', 'cancelled']);
    await expect(ctx.client.cancelOrder(order.id)).rejects.toMatchObject({ status: 409 });

    const other = await ctx.client.register({
      name: 'Other',
      email: 'other@laundry.test',
      password: 'password1',
    });
    ctx.setToken(other.token);
    await expect(ctx.client.getOrder(order.id)).rejects.toMatchObject({ status: 404 });
  });

  it('rejects an unknown store or garment with 422', async () => {
    const { token } = await ctx.client.login({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    });
    ctx.setToken(token);
    await expect(
      ctx.client.createOrder({
        items: [{ garmentId: 'shirts', quantity: 1, washTypeIds: ['wash'] }],
        storeId: 'moon',
        address,
      }),
    ).rejects.toMatchObject({ status: 422 });
    await expect(
      ctx.client.createOrder({
        items: [{ garmentId: 'capes', quantity: 1, washTypeIds: ['wash'] }],
        storeId: 'hitech-city',
        address,
      }),
    ).rejects.toMatchObject({ status: 422 });
  });
});
