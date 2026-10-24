import type { CSSProperties } from 'react';
import styles from './ui.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = 16, radius, className }: SkeletonProps) {
  const style: CSSProperties = { width, height };
  if (radius) style.borderRadius = radius;
  return (
    <span className={[styles.skeleton, className ?? ''].join(' ')} style={style} aria-hidden />
  );
}

export function SkeletonRows({ rows = 3, height = 56 }: { rows?: number; height?: number }) {
  return (
    <div style={{ display: 'grid', gap: 12 }} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={height} radius="12px" />
      ))}
    </div>
  );
}
