import type { OrderStatus } from '@/api/types';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Placed',
  processing: 'Processing',
  ready: 'Ready for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
