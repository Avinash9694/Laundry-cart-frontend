import type { CSSProperties } from 'react';
import { useToastStore, type ToastTone } from '@/lib/toast-store';
import { IconClose } from './icons';
import styles from './ui.module.css';

const ACCENT: Record<ToastTone, string> = {
  info: 'var(--info)',
  success: 'var(--success)',
  error: 'var(--danger)',
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div className={styles.toaster} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={styles.toast}
          role={t.tone === 'error' ? 'alert' : 'status'}
          style={{ '--toast-accent': ACCENT[t.tone] } as CSSProperties}
        >
          <div className={styles.toastBody}>
            <p className={styles.toastTitle}>{t.title}</p>
            {t.description ? <p className={styles.toastDesc}>{t.description}</p> : null}
          </div>
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <IconClose size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
