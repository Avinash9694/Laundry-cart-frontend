import { IconCheck } from './icons';
import styles from './ui.module.css';

interface StepperProps<T extends string> {
  steps: readonly T[];
  labels: Record<T, string>;
  current: T;
  maxReachable: T;
  onSelect: (step: T) => void;
}

export function Stepper<T extends string>({
  steps,
  labels,
  current,
  maxReachable,
  onSelect,
}: StepperProps<T>) {
  const currentIndex = steps.indexOf(current);
  const reachableIndex = steps.indexOf(maxReachable);
  return (
    <nav aria-label="Order steps">
      <ol className={styles.stepper}>
        {steps.map((step, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo';
          const cls = [
            styles.step,
            state === 'done' ? styles.stepDone : '',
            state === 'current' ? styles.stepCurrent : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={step} className={cls}>
              <button
                type="button"
                className={styles.stepButton}
                onClick={() => onSelect(step)}
                disabled={i > reachableIndex}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span className={styles.stepNum} aria-hidden>
                  {state === 'done' ? <IconCheck size={14} /> : i + 1}
                </span>
                <span className={styles.stepLabel}>
                  <span className="visually-hidden">Step {i + 1}: </span>
                  {labels[step]}
                </span>
              </button>
              <span className={styles.stepBar} aria-hidden />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
