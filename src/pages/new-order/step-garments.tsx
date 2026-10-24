import type { Garment } from '@/api/types';
import { useWizardStore } from '@/store/wizard-store';
import { formatINR } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import styles from './new-order.module.css';

export function StepGarments({ garments }: { garments: Garment[] }) {
  const quantities = useWizardStore((s) => s.quantities);
  const setQuantity = useWizardStore((s) => s.setQuantity);
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>What are we washing?</h2>
        <p>Set a quantity for each garment type you want collected.</p>
      </div>
      <ul className={styles.garments} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {garments.map((g) => {
          const qty = quantities[g.id] ?? 0;
          const from = Math.min(...Object.values(g.prices));
          return (
            <Card
              key={g.id}
              as="li"
              padded={false}
              className={[styles.garment, qty > 0 ? styles.garmentSelected : ''].join(' ')}
            >
              <div className={styles.garmentInfo}>
                <h3>{g.name}</h3>
                <p>{g.description}</p>
                <p className={styles.garmentFrom}>from {formatINR(from)} / piece</p>
              </div>
              <QuantityStepper label={g.name} value={qty} onChange={(n) => setQuantity(g.id, n)} />
            </Card>
          );
        })}
      </ul>
    </div>
  );
}
