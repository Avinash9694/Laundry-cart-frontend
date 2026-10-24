import { Link } from 'react-router-dom';
import styles from './layout.module.css';

export function Logo() {
  return (
    <Link to="/" className={styles.logo} aria-label="Laundry Cart home">
      <span className={styles.logoMark} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 64 64" fill="none" aria-hidden>
          <rect x="14" y="10" width="36" height="44" rx="6" fill="currentColor" />
          <circle cx="32" cy="36" r="12" fill="var(--accent)" />
          <path
            d="M22 38c3-4 6-4 10 0s7 4 10 0"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>
      Laundry Cart
    </Link>
  );
}
