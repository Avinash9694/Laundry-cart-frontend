import { Link } from 'react-router-dom';
import type { Order } from '@/api/types';
import { describeOrderItems, formatDate, formatINR, pluralize } from '@/lib/format';
import { StatusChip } from '@/components/ui/status-chip';
import cardStyles from '@/components/ui/ui.module.css';
import styles from './orders.module.css';

export function OrderRow({ order }: { order: Order }) {
  return (
    <li>
      <Link
        to={`/orders/${order.id}`}
        className={[cardStyles.card, styles.row].join(' ')}
        aria-label={`Order ${order.orderNumber}`}
      >
        <div className={styles.rowMain}>
          <div className={styles.rowTitle}>
            <span className={styles.rowNumber}>{order.orderNumber}</span>
            <StatusChip status={order.status} compact />
          </div>
          <p className={styles.rowItems}>{describeOrderItems(order)}</p>
          <p className={styles.rowMeta}>
            {formatDate(order.createdAt)} · {pluralize(order.pricing.totalItems, 'item')} ·{' '}
            {order.store.name.replace('Laundry Cart · ', '')}
          </p>
        </div>
        <span className={styles.rowTotal}>{formatINR(order.pricing.total)}</span>
      </Link>
    </li>
  );
}
