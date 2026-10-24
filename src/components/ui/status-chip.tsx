import type { CSSProperties } from 'react';
import type { OrderStatus } from '@/api/types';
import { STATUS_LABELS } from '@/lib/order-status';
import styles from './ui.module.css';

export function StatusChip({
  status,
  compact = false,
}: {
  status: OrderStatus;
  compact?: boolean;
}) {
  const style = {
    '--chip-fg': `var(--status-${status})`,
    '--chip-bg': `var(--status-${status}-soft)`,
  } as CSSProperties;
  return (
    <span className={styles.chip} style={style}>
      <span className={styles.chipDot} aria-hidden />
      {compact && status === 'ready' ? 'Ready' : STATUS_LABELS[status]}
    </span>
  );
}
