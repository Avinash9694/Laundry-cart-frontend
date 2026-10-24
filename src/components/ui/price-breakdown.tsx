import type { Pricing } from '@/api/types';
import { FREE_DELIVERY_THRESHOLD } from '@/domain/pricing';
import { formatINR, pluralize } from '@/lib/format';
import styles from './ui.module.css';

export function PriceBreakdown({
  pricing,
  showHint = false,
}: {
  pricing: Pricing;
  showHint?: boolean;
}) {
  const remaining = FREE_DELIVERY_THRESHOLD - pricing.subtotal;
  return (
    <dl className={styles.breakdown}>
      <div className={styles.breakdownRow}>
        <dt>Subtotal · {pluralize(pricing.totalItems, 'item')}</dt>
        <dd className={styles.price}>{formatINR(pricing.subtotal)}</dd>
      </div>
      <div className={styles.breakdownRow}>
        <dt>Pickup &amp; delivery</dt>
        <dd className={styles.price}>
          {pricing.deliveryFee === 0 ? 'Free' : formatINR(pricing.deliveryFee)}
        </dd>
      </div>
      {showHint && pricing.subtotal > 0 && remaining > 0 ? (
        <p className={styles.breakdownNote}>Add {formatINR(remaining)} more for free delivery</p>
      ) : null}
      <div className={[styles.breakdownRow, styles.breakdownTotal].join(' ')}>
        <dt>Total</dt>
        <dd className={styles.price}>{formatINR(pricing.total)}</dd>
      </div>
    </dl>
  );
}
