import type { Order, OrderStatus } from '@/api/types';

const FLOW: OrderStatus[] = ['placed', 'processing', 'ready', 'delivered'];

export function timelineFor(
  order: Order,
): { status: OrderStatus; at: string | null; state: 'done' | 'cancelled' | 'pending' }[] {
  const byStatus = new Map(order.statusHistory.map((e) => [e.status, e.at]));
  if (order.status === 'cancelled') {
    return [
      ...order.statusHistory
        .filter((e) => e.status !== 'cancelled')
        .map((e) => ({ status: e.status, at: e.at, state: 'done' as const })),
      { status: 'cancelled', at: byStatus.get('cancelled') ?? null, state: 'cancelled' },
    ];
  }
  return FLOW.map((status) => {
    const at = byStatus.get(status) ?? null;
    return { status, at, state: at ? 'done' : 'pending' };
  });
}
