import { describe, expect, it } from 'vitest';
import type { Order } from '@/api/types';
import { applyFilters, isActive, matchesQuery, sortOrders, summarize } from './orders-filter';

function order(partial: Partial<Order> & { id: string }): Order {
  return {
    orderNumber: `LC-${partial.id}`,
    userId: 'u',
    status: 'placed',
    statusHistory: [],
    items: [
      {
        garmentId: 'shirts',
        garmentName: 'Shirts',
        quantity: 1,
        washTypes: [{ id: 'wash', name: 'Washing', price: 20 }],
        unitPrice: 20,
        lineTotal: 20,
      },
    ],
    store: { id: 's', name: 'Laundry Cart · HITEC City', addressLine: '', city: '', phone: '' },
    address: { line1: '', line2: null, city: '', pincode: '', phone: '' },
    notes: null,
    pricing: { subtotal: 20, deliveryFee: 49, total: 69, totalItems: 1 },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

const a = order({
  id: 'A1',
  createdAt: '2026-03-01T00:00:00.000Z',
  pricing: { subtotal: 500, deliveryFee: 0, total: 500, totalItems: 5 },
  status: 'delivered',
});
const b = order({ id: 'B2', createdAt: '2026-02-01T00:00:00.000Z', status: 'cancelled' });
const c = order({
  id: 'C3',
  createdAt: '2026-01-15T00:00:00.000Z',
  status: 'processing',
  items: [
    {
      garmentId: 'sarees',
      garmentName: 'Sarees',
      quantity: 2,
      washTypes: [{ id: 'dry-clean', name: 'Dry Clean', price: 180 }],
      unitPrice: 180,
      lineTotal: 360,
    },
  ],
  pricing: { subtotal: 360, deliveryFee: 49, total: 409, totalItems: 2 },
});

describe('matchesQuery', () => {
  it('matches order number, garment, wash type and store, case-insensitively', () => {
    expect(matchesQuery(c, 'c3')).toBe(true);
    expect(matchesQuery(c, 'saree')).toBe(true);
    expect(matchesQuery(c, 'dry clean')).toBe(true);
    expect(matchesQuery(c, 'hitec')).toBe(true);
    expect(matchesQuery(c, 'jeans')).toBe(false);
    expect(matchesQuery(c, '   ')).toBe(true);
  });
});

describe('sortOrders', () => {
  it('sorts by date and total in both directions without mutating input', () => {
    const input = [b, a, c];
    expect(sortOrders(input, 'newest').map((o) => o.id)).toEqual(['A1', 'B2', 'C3']);
    expect(sortOrders(input, 'oldest').map((o) => o.id)).toEqual(['C3', 'B2', 'A1']);
    expect(sortOrders(input, 'total-desc').map((o) => o.id)).toEqual(['A1', 'C3', 'B2']);
    expect(sortOrders(input, 'total-asc').map((o) => o.id)).toEqual(['B2', 'C3', 'A1']);
    expect(input.map((o) => o.id)).toEqual(['B2', 'A1', 'C3']);
  });
});

describe('applyFilters / summarize', () => {
  it('combines status, query and sort', () => {
    expect(
      applyFilters([a, b, c], { query: '', status: 'processing', sort: 'newest' }).map((o) => o.id),
    ).toEqual(['C3']);
    expect(
      applyFilters([a, b, c], { query: 'shirts', status: 'all', sort: 'oldest' }).map((o) => o.id),
    ).toEqual(['B2', 'A1']);
  });

  it('summarises in-progress count, spend excluding cancelled, and delivered count', () => {
    expect(isActive(c)).toBe(true);
    expect(isActive(a)).toBe(false);
    expect(summarize([a, b, c])).toEqual({
      inProgress: 1,
      totalSpent: 909,
      delivered: 1,
      total: 3,
    });
  });
});
