import styles from './ui.module.css';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  label: string;
  max?: number;
}

export function QuantityStepper({ value, onChange, label, max = 100 }: QuantityStepperProps) {
  return (
    <div className={styles.qty} role="group" aria-label={label}>
      <button
        type="button"
        className={styles.qtyBtn}
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        aria-label={`Remove one ${label}`}
      >
        −
      </button>
      <input
        className={styles.qtyInput}
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value === 0 ? '' : value}
        placeholder="0"
        aria-label={`${label} quantity`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <button
        type="button"
        className={styles.qtyBtn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Add one ${label}`}
      >
        +
      </button>
    </div>
  );
}
