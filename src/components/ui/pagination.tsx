import { Button } from './button';
import { IconArrowLeft, IconArrowRight } from './icons';
import styles from './ui.module.css';
import type { PageMeta } from '@/api/types';

interface PaginationProps {
  meta: PageMeta;
  onPage: (page: number) => void;
}

export function Pagination({ meta, onPage }: PaginationProps) {
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.total, meta.page * meta.limit);
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.pageInfo} aria-live="polite">
        Showing {from}–{to} of {meta.total}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          variant="secondary"
          size="sm"
          icon={<IconArrowLeft size={16} />}
          onClick={() => onPage(meta.page - 1)}
          disabled={meta.page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPage(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
        >
          Next
          <IconArrowRight size={16} />
        </Button>
      </div>
    </nav>
  );
}
