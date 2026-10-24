import type { ReactNode } from 'react';
import { Button } from './button';
import { IconAlert, IconInbox } from './icons';
import styles from './ui.module.css';

interface StateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: StateProps) {
  return (
    <div className={styles.state}>
      <div className={styles.stateIcon}>
        <IconInbox size={24} />
      </div>
      <h3 className={styles.stateTitle}>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

interface ErrorStateProps extends StateProps {
  onRetry?: () => void;
}

export function ErrorState({ title, description, action, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.state} role="alert">
      <div className={[styles.stateIcon, styles.stateIconError].join(' ')}>
        <IconAlert size={24} />
      </div>
      <h3 className={styles.stateTitle}>{title}</h3>
      {description ? <p>{description}</p> : null}
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : (
        action
      )}
    </div>
  );
}
