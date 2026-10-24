import type { Catalog } from '@/api/types';
import { useWizardStore } from '@/store/wizard-store';
import { selectedGarmentIds } from '@/store/wizard-logic';
import { unitPriceFor } from '@/domain/pricing';
import { formatINR } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { IconCheck } from '@/components/ui/icons';
import styles from './new-order.module.css';

export function StepWashTypes({ catalog }: { catalog: Catalog }) {
  const quantities = useWizardStore((s) => s.quantities);
  const selections = useWizardStore((s) => s.washSelections);
  const toggleWash = useWizardStore((s) => s.toggleWash);
  const ids = selectedGarmentIds({ quantities });

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>How should each garment be treated?</h2>
        <p>Pick one or more wash types per garment. The unit price adds up as you go.</p>
      </div>
      {ids.map((id) => {
        const garment = catalog.garments.find((g) => g.id === id);
        if (!garment) return null;
        const chosen = selections[id] ?? [];
        const qty = quantities[id] ?? 0;
        const unit = unitPriceFor(garment, chosen);
        return (
          <Card key={id} as="section" aria-labelledby={`wash-${id}`} className={styles.washRow}>
            <div className={styles.washHead}>
              <h3 id={`wash-${id}`}>
                {qty} × {garment.name}
              </h3>
              <p className={styles.washTotal} aria-live="polite">
                {chosen.length === 0 ? (
                  <span className={styles.washWarning}>Pick at least one wash type</span>
                ) : (
                  <>
                    {qty} × {formatINR(unit)} = <strong>{formatINR(unit * qty)}</strong>
                  </>
                )}
              </p>
            </div>
            <div
              className={styles.washOptions}
              role="group"
              aria-label={`Wash types for ${garment.name}`}
            >
              {catalog.washTypes.map((w) => {
                const active = chosen.includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={styles.washOption}
                    aria-pressed={active}
                    onClick={() => toggleWash(id, w.id)}
                    title={w.description}
                  >
                    {active ? <IconCheck size={16} /> : null}
                    {w.name}
                    <span className={styles.price}>{formatINR(garment.prices[w.id] ?? 0)}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
