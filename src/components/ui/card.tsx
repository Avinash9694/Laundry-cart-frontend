import type { HTMLAttributes } from 'react';
import styles from './ui.module.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  padded?: boolean;
  as?: 'div' | 'section' | 'article' | 'li' | 'aside';
}

export function Card({ padded = true, as = 'div', className, ...rest }: CardProps) {
  const Tag = as as 'div';
  const cls = [styles.card, padded ? styles.cardPadded : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return <Tag className={cls} {...rest} />;
}
