import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { summarize } from '@/lib/orders-filter';
import { formatINR } from '@/lib/format';
import { PageHeader } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/button';
import { IconClock, IconPlus, IconTruck, IconWallet } from '@/components/ui/icons';
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { OrderRow } from '@/pages/orders/order-row';
import styles from './dashboard.module.css';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const orders = useOrders({ page: 1, limit: 50 });
  const summary = orders.data ? summarize(orders.data.data) : null;
  const firstName = user?.name.split(' ')[0] ?? 'there';

  const tiles = [
    {
      icon: IconClock,
      label: 'Orders in progress',
      value: summary ? String(summary.inProgress) : null,
    },
    {
      icon: IconWallet,
      label: 'Total spent',
      value: summary ? formatINR(summary.totalSpent) : null,
    },
    { icon: IconTruck, label: 'Delivered', value: summary ? String(summary.delivered) : null },
  ];

  return (
    <div className="container">
      <PageHeader
        eyebrow="Dashboard"
        title={`Hi ${firstName}`}
        description="Here is where your laundry stands."
        action={
          <LinkButton to="/orders/new" icon={<IconPlus size={18} />}>
            New order
          </LinkButton>
        }
      />
      <div className={styles.tiles} aria-busy={orders.isPending}>
        {tiles.map((t) => (
          <Card key={t.label} className={styles.tile}>
            <span className={styles.tileIcon}>
              <t.icon size={20} />
            </span>
            <div>
              <p className={styles.tileLabel}>{t.label}</p>
              {t.value === null ? (
                <Skeleton width={72} height={28} />
              ) : (
                <p className={styles.tileValue}>{t.value}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <section aria-labelledby="recent-title">
        <div className={styles.recentHead}>
          <h2 id="recent-title" style={{ fontSize: '1.125rem' }}>
            Recent orders
          </h2>
          <Link to="/orders">View all</Link>
        </div>
        {orders.isPending ? (
          <SkeletonRows rows={3} height={84} />
        ) : orders.isError ? (
          <ErrorState
            title="Could not load your orders"
            description={orders.error.message}
            onRetry={() => void orders.refetch()}
          />
        ) : orders.data.data.length === 0 ? (
          <Card>
            <EmptyState
              title="No orders yet"
              description="Your first order takes about a minute to build."
              action={<LinkButton to="/orders/new">Start an order</LinkButton>}
            />
          </Card>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            {orders.data.data.slice(0, 4).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
