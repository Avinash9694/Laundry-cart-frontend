import type { Catalog, Store } from '@/api/types';
import { useWizardStore } from '@/store/wizard-store';
import { previewPricing } from '@/store/wizard-logic';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PriceBreakdown } from '@/components/ui/price-breakdown';
import styles from './new-order.module.css';

export function StepReview({ catalog, stores }: { catalog: Catalog; stores: Store[] }) {
  const state = useWizardStore();
  const { items, pricing } = previewPricing(state, catalog);
  const store = stores.find((s) => s.id === state.storeId);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Review your order</h2>
        <p>Check everything once; you can still edit any step.</p>
      </div>
      <Card as="section" aria-labelledby="review-items">
        <div className={styles.washHead} style={{ marginBottom: 8 }}>
          <h3 id="review-items">Items</h3>
          <Button
            variant="ghost"
            size="sm"
            className={styles.editLink}
            onClick={() => state.goTo('wash-types')}
          >
            Edit
          </Button>
        </div>
        <ul className={styles.reviewList}>
          {items.map((item) => (
            <li key={item.garmentId} className={styles.reviewItem}>
              <div>
                <strong>
                  {item.quantity} × {item.garmentName}
                </strong>
                <p>{item.washTypes.map((w) => w.name).join(' + ')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>{formatINR(item.lineTotal)}</strong>
                <p>
                  {item.quantity} × {formatINR(item.unitPrice)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card as="section" aria-labelledby="review-pickup">
        <div className={styles.washHead} style={{ marginBottom: 8 }}>
          <h3 id="review-pickup">Pickup</h3>
          <Button
            variant="ghost"
            size="sm"
            className={styles.editLink}
            onClick={() => state.goTo('pickup')}
          >
            Edit
          </Button>
        </div>
        <p>
          <strong>{store?.name ?? 'Store'}</strong>
          <br />
          <span style={{ color: 'var(--text-muted)' }}>
            {store ? `${store.addressLine} · ${store.hours}` : ''}
          </span>
        </p>
        {state.address ? (
          <p style={{ marginTop: 12 }}>
            Collect from {state.address.line1}
            {state.address.line2 ? `, ${state.address.line2}` : ''}, {state.address.city}{' '}
            {state.address.pincode}
            <br />
            <span style={{ color: 'var(--text-muted)' }}>{state.address.phone}</span>
          </p>
        ) : null}
        {state.notes ? (
          <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>
            <em>“{state.notes}”</em>
          </p>
        ) : null}
      </Card>
      <Card as="section" aria-labelledby="review-price">
        <h3 id="review-price" style={{ marginBottom: 12 }}>
          Price
        </h3>
        <PriceBreakdown pricing={pricing} />
      </Card>
    </div>
  );
}
