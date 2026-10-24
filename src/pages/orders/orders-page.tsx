import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ORDER_STATUSES, type OrderStatus } from '@/api/types';
import { useOrders } from '@/hooks/use-api';
import { DEFAULT_FILTERS, SORT_LABELS, applyFilters, type OrderSort } from '@/lib/orders-filter';
import { PageHeader } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { IconPlus, IconSearch } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { SkeletonRows } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { STATUS_LABELS } from '@/lib/order-status';
import { OrderRow } from './order-row';
import styles from './orders.module.css';

const PAGE_SIZE = 8;

function parseStatus(value: string | null): OrderStatus | 'all' {
  return value && (ORDER_STATUSES as readonly string[]).includes(value)
    ? (value as OrderStatus)
    : 'all';
}

export function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const status = parseStatus(params.get('status'));
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<OrderSort>(DEFAULT_FILTERS.sort);

  const orders = useOrders(
    status === 'all' ? { page, limit: PAGE_SIZE } : { page, limit: PAGE_SIZE, status },
  );
  const visible = useMemo(
    () => (orders.data ? applyFilters(orders.data.data, { query, status: 'all', sort }) : []),
    [orders.data, query, sort],
  );

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === 'all' || v === '1') next.delete(k);
      else next.set(k, v);
    }
    setParams(next);
  };

  return (
    <div className="container">
      <PageHeader
        eyebrow="Orders"
        title="Your orders"
        description="Every order you have placed, newest first."
        action={
          <LinkButton to="/orders/new" icon={<IconPlus size={18} />}>
            New order
          </LinkButton>
        }
      />
      <div className={styles.chips} role="group" aria-label="Filter by status">
        {(['all', ...ORDER_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={[styles.filterChip, status === s ? styles.filterChipActive : ''].join(' ')}
            aria-pressed={status === s}
            onClick={() => update({ status: s, page: null })}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <IconSearch size={18} />
          <Input
            label="Search this page"
            placeholder="Order number, garment or wash type"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select label="Sort" value={sort} onChange={(e) => setSort(e.target.value as OrderSort)}>
          {(Object.keys(SORT_LABELS) as OrderSort[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      {orders.isPending ? (
        <SkeletonRows rows={5} height={92} />
      ) : orders.isError ? (
        <ErrorState
          title="Could not load orders"
          description={orders.error.message}
          onRetry={() => void orders.refetch()}
        />
      ) : orders.data.meta.total === 0 ? (
        <Card>
          <EmptyState
            title={
              status === 'all'
                ? 'No orders yet'
                : `No ${STATUS_LABELS[status].toLowerCase()} orders`
            }
            description={
              status === 'all'
                ? 'Place your first order to see it here.'
                : 'Try another status filter.'
            }
            action={
              status === 'all' ? (
                <LinkButton to="/orders/new">Start an order</LinkButton>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <p className={styles.resultCount} aria-live="polite">
            {query
              ? `${visible.length} of ${orders.data.data.length} on this page match “${query}”`
              : `${orders.data.meta.total} total`}
          </p>
          {visible.length === 0 ? (
            <Card>
              <EmptyState
                title="Nothing matches"
                description="Clear the search or try another page."
              />
            </Card>
          ) : (
            <ul className={styles.list} aria-busy={orders.isFetching}>
              {visible.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </ul>
          )}
          <div className={styles.footer}>
            <Pagination meta={orders.data.meta} onPage={(p) => update({ page: String(p) })} />
          </div>
        </>
      )}
    </div>
  );
}
