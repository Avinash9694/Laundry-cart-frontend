import type { Order, OrderStatus } from '@/api/types';

export type OrderSort = 'newest' | 'oldest' | 'total-desc' | 'total-asc';

export interface OrderFilters {
  query: string;
  status: OrderStatus | 'all';
  sort: OrderSort;
}

export const DEFAULT_FILTERS: OrderFilters = { query: '', status: 'all', sort: 'newest' };

export const SORT_LABELS: Record<OrderSort, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  'total-desc': 'Highest total',
  'total-asc': 'Lowest total',
};

export function matchesQuery(order: Order, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (order.orderNumber.toLowerCase().includes(q)) return true;
  if (order.store.name.toLowerCase().includes(q)) return true;
  return order.items.some(
    (item) =>
      item.garmentName.toLowerCase().includes(q) ||
      item.washTypes.some((w) => w.name.toLowerCase().includes(q)),
  );
}

export function sortOrders(orders: readonly Order[], sort: OrderSort): Order[] {
  const copy = [...orders];
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'oldest':
      return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'total-desc':
      return copy.sort((a, b) => b.pricing.total - a.pricing.total);
    case 'total-asc':
      return copy.sort((a, b) => a.pricing.total - b.pricing.total);
  }
}

export function applyFilters(orders: readonly Order[], filters: OrderFilters): Order[] {
  const filtered = orders.filter(
    (o) =>
      (filters.status === 'all' || o.status === filters.status) && matchesQuery(o, filters.query),
  );
  return sortOrders(filtered, filters.sort);
}

export const ACTIVE_STATUSES: readonly OrderStatus[] = ['placed', 'processing', 'ready'];

export function isActive(order: Pick<Order, 'status'>): boolean {
  return ACTIVE_STATUSES.includes(order.status);
}

export function summarize(orders: readonly Order[]) {
  const inProgress = orders.filter(isActive).length;
  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.pricing.total, 0);
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  return { inProgress, totalSpent, delivered, total: orders.length };
}
