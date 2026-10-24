import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Order } from '@/api/types';
import { timelineFor } from '@/lib/order-timeline';
import { errorMessage } from '@/api';
import { useCancelOrder, useOrder } from '@/hooks/use-api';
import { formatDateTime, formatINR } from '@/lib/format';
import { toast } from '@/lib/toast-store';
import { PageHeader } from '@/components/layout/app-shell';
import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { IconArrowLeft } from '@/components/ui/icons';
import { PriceBreakdown } from '@/components/ui/price-breakdown';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { StatusChip } from '@/components/ui/status-chip';
import { STATUS_LABELS } from '@/lib/order-status';
import styles from './orders.module.css';

function Timeline({ order }: { order: Order }) {
  return (
    <ol className={styles.timeline} aria-label="Order status timeline">
      {timelineFor(order).map((e) => (
        <li
          key={e.status}
          className={[styles.event, e.state === 'pending' ? styles.eventPending : ''].join(' ')}
        >
          <span
            className={[
              styles.dot,
              e.state === 'done' ? styles.dotDone : '',
              e.state === 'cancelled' ? styles.dotCancelled : '',
            ].join(' ')}
            aria-hidden
          />
          <p className={styles.eventLabel}>{STATUS_LABELS[e.status]}</p>
          <p className={styles.eventTime}>{e.at ? formatDateTime(e.at) : 'Pending'}</p>
        </li>
      ))}
    </ol>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = useOrder(id);
  const cancel = useCancelOrder();
  const [confirming, setConfirming] = useState(false);

  const onCancel = () => {
    if (!id) return;
    cancel.mutate(id, {
      onSuccess: () => {
        setConfirming(false);
        toast.success('Order cancelled', 'Nothing will be collected for this order.');
      },
      onError: (err) => {
        setConfirming(false);
        toast.error('Could not cancel', errorMessage(err));
      },
    });
  };

  if (order.isPending) {
    return (
      <div className="container" aria-busy>
        <div style={{ padding: '32px 0 24px' }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={260} height={34} className="" />
        </div>
        <div className={styles.detailGrid}>
          <Skeleton height={320} radius="16px" />
          <Skeleton height={320} radius="16px" />
        </div>
      </div>
    );
  }

  if (order.isError) {
    const notFound = 'status' in order.error && order.error.status === 404;
    return (
      <div className="container">
        <ErrorState
          title={notFound ? 'Order not found' : 'Could not load this order'}
          description={
            notFound
              ? 'It may belong to another account or have been removed.'
              : errorMessage(order.error)
          }
          action={
            <LinkButton to="/orders" variant="secondary">
              Back to orders
            </LinkButton>
          }
          {...(notFound ? {} : { onRetry: () => void order.refetch() })}
        />
      </div>
    );
  }

  const o = order.data;
  return (
    <div className="container">
      <PageHeader
        eyebrow={
          <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconArrowLeft size={16} /> All orders
          </Link>
        }
        title={o.orderNumber}
        description={`Placed ${formatDateTime(o.createdAt)} · pickup from ${o.store.name.replace('Laundry Cart · ', '')}`}
        action={
          <div className={styles.detailHead}>
            <StatusChip status={o.status} />
            {o.status === 'placed' ? (
              <Button variant="danger" onClick={() => setConfirming(true)}>
                Cancel order
              </Button>
            ) : null}
          </div>
        }
      />
      <div className={styles.detailGrid}>
        <div className={styles.block}>
          <Card as="section" aria-labelledby="items-title">
            <h2 id="items-title" style={{ marginBottom: 16 }}>
              Items
            </h2>
            <ul className={styles.items}>
              {o.items.map((item) => (
                <li key={item.garmentId} className={styles.item}>
                  <div>
                    <p className={styles.itemName}>
                      {item.quantity} × {item.garmentName}
                    </p>
                    <p className={styles.itemWashes}>
                      {item.washTypes.map((w) => `${w.name} ${formatINR(w.price)}`).join(' · ')}
                    </p>
                  </div>
                  <p className={styles.itemPrice}>
                    <strong>{formatINR(item.lineTotal)}</strong>
                    <small>
                      {item.quantity} × {formatINR(item.unitPrice)}
                    </small>
                  </p>
                </li>
              ))}
            </ul>
          </Card>
          <Card as="section" aria-labelledby="pricing-title">
            <h2 id="pricing-title" style={{ marginBottom: 16 }}>
              Price breakdown
            </h2>
            <PriceBreakdown pricing={o.pricing} />
          </Card>
        </div>
        <div className={styles.block}>
          <Card as="section" aria-labelledby="timeline-title">
            <h2 id="timeline-title" style={{ marginBottom: 16 }}>
              Status
            </h2>
            <Timeline order={o} />
          </Card>
          <Card as="section" aria-labelledby="pickup-title">
            <h2 id="pickup-title" style={{ marginBottom: 16 }}>
              Pickup
            </h2>
            <dl className={styles.kv}>
              <dt>Store</dt>
              <dd>
                {o.store.name}
                <br />
                <span style={{ color: 'var(--text-muted)' }}>
                  {o.store.addressLine}, {o.store.city} · {o.store.phone}
                </span>
              </dd>
              <dt>Collect from</dt>
              <dd>
                {o.address.line1}
                {o.address.line2 ? `, ${o.address.line2}` : ''}
                <br />
                {o.address.city} {o.address.pincode}
                <br />
                <span style={{ color: 'var(--text-muted)' }}>{o.address.phone}</span>
              </dd>
              {o.notes ? (
                <>
                  <dt>Notes</dt>
                  <dd>{o.notes}</dd>
                </>
              ) : null}
            </dl>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Cancel this order?"
        description={`${o.orderNumber} will be cancelled and nothing will be collected. This cannot be undone.`}
        confirmLabel="Cancel order"
        tone="danger"
        busy={cancel.isPending}
        onConfirm={onCancel}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
