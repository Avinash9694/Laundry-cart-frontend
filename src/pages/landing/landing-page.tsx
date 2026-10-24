import { useCatalog, useStores } from '@/hooks/use-api';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';
import { useAuthStore } from '@/store/auth-store';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/domain/pricing';
import { formatINR } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/button';
import {
  IconArrowRight,
  IconDroplet,
  IconReceipt,
  IconShirt,
  IconStore,
} from '@/components/ui/icons';
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { StatusChip } from '@/components/ui/status-chip';
import styles from './landing.module.css';

const HOW = [
  { icon: IconShirt, title: 'Pick garments', text: 'Shirts to blankets. Set a quantity for each.' },
  {
    icon: IconDroplet,
    title: 'Choose wash types',
    text: 'Wash, iron, dry clean, fold or stain removal, per garment.',
  },
  {
    icon: IconStore,
    title: 'Pickup details',
    text: 'Pick the nearest store and where we collect from.',
  },
  {
    icon: IconReceipt,
    title: 'Review & place',
    text: 'A live price breakdown before you confirm. Cancel while it is still placed.',
  },
];

export function LandingPage() {
  useScrollToHash();
  const authed = useAuthStore((s) => s.token !== null);
  const catalog = useCatalog();
  const stores = useStores();

  return (
    <>
      <section className={styles.hero}>
        <div className={['container', styles.heroGrid].join(' ')}>
          <div>
            <h1 className={styles.heroTitle}>
              Doorstep laundry, <span>priced before you order.</span>
            </h1>
            <p className={styles.heroText}>
              Wash, iron and dry-clean orders in four steps, with per-garment pricing you can see as
              you build the basket and a status timeline from placed to delivered.
            </p>
            <div className={styles.heroActions}>
              <LinkButton to={authed ? '/orders/new' : '/register'} size="lg">
                {authed ? 'Start a new order' : 'Create an account'}
                <IconArrowRight size={18} />
              </LinkButton>
              <LinkButton to={{ pathname: '/', hash: '#pricing' }} variant="secondary" size="lg">
                See pricing
              </LinkButton>
            </div>
            <div className={styles.heroStats}>
              <div>
                <strong>{catalog.data ? catalog.data.garments.length : '—'}</strong>garment types
              </div>
              <div>
                <strong>{catalog.data ? catalog.data.washTypes.length : '—'}</strong>wash types
              </div>
              <div>
                <strong>{formatINR(FREE_DELIVERY_THRESHOLD)}+</strong>free pickup &amp; delivery
              </div>
            </div>
          </div>
          <Card className={styles.preview} aria-label="Example order summary">
            <div>
              <p className={styles.previewMeta}>Example order</p>
              <h3 style={{ marginTop: 4 }}>
                <span className="mono">LC-261023-4KD2</span>
              </h3>
            </div>
            <div className={styles.previewRow}>
              <div>
                <strong>4 × Shirts</strong>
                <p className={styles.previewMeta}>Washing + Ironing</p>
              </div>
              <span className="mono">{formatINR(140)}</span>
            </div>
            <div className={styles.previewRow}>
              <div>
                <strong>2 × Sarees</strong>
                <p className={styles.previewMeta}>Dry Clean + Fold</p>
              </div>
              <span className="mono">{formatINR(400)}</span>
            </div>
            <div className={styles.previewRow}>
              <div>
                <strong>Total</strong>
                <p className={styles.previewMeta}>
                  Delivery free over {formatINR(FREE_DELIVERY_THRESHOLD)}
                </p>
              </div>
              <strong className="mono">{formatINR(540)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={styles.previewMeta}>Pickup · HITEC City</span>
              <StatusChip status="processing" />
            </div>
          </Card>
        </div>
      </section>

      <section
        id="how-it-works"
        className={['container', styles.section].join(' ')}
        aria-labelledby="how-title"
      >
        <div className={styles.sectionHead}>
          <h2 id="how-title">How it works</h2>
          <p>One order wizard, four short steps. Your progress survives a page refresh.</p>
        </div>
        <div className={styles.steps}>
          {HOW.map((s, i) => (
            <Card key={s.title} className={styles.stepCard}>
              <div className={styles.stepIcon}>
                <s.icon size={22} />
              </div>
              <h3>
                {i + 1}. {s.title}
              </h3>
              <p>{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="pricing"
        className={['container', styles.section].join(' ')}
        aria-labelledby="pricing-title"
      >
        <div className={styles.sectionHead}>
          <h2 id="pricing-title">Pricing per piece</h2>
          <p>
            Pick any combination of wash types for a garment; the unit price is the sum of what you
            select.
          </p>
        </div>
        <Card padded={false}>
          {catalog.isPending ? (
            <div style={{ padding: 24 }}>
              <SkeletonRows rows={6} height={44} />
            </div>
          ) : catalog.isError ? (
            <ErrorState
              title="Could not load the price list"
              description={catalog.error.message}
              onRetry={() => void catalog.refetch()}
            />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className="visually-hidden">
                  Price per piece in Indian rupees by garment and wash type
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Garment</th>
                    {catalog.data.washTypes.map((w) => (
                      <th key={w.id} scope="col">
                        {w.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catalog.data.garments.map((g) => (
                    <tr key={g.id}>
                      <th
                        scope="row"
                        style={{
                          background: 'transparent',
                          textTransform: 'none',
                          letterSpacing: 0,
                          fontSize: '0.9375rem',
                          color: 'var(--text)',
                        }}
                      >
                        {g.name}
                      </th>
                      {catalog.data.washTypes.map((w) => (
                        <td key={w.id}>{formatINR(g.prices[w.id] ?? 0)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <p className={styles.tableNote}>
          Pickup &amp; delivery is {formatINR(DELIVERY_FEE)}, free on orders of{' '}
          {formatINR(FREE_DELIVERY_THRESHOLD)} or more.
        </p>
      </section>

      <section
        id="stores"
        className={['container', styles.section].join(' ')}
        aria-labelledby="stores-title"
      >
        <div className={styles.sectionHead}>
          <h2 id="stores-title">Pickup stores</h2>
          <p>Choose the store closest to you when you place an order.</p>
        </div>
        {stores.isPending ? (
          <div className={styles.stores}>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} height={140} radius="16px" />
            ))}
          </div>
        ) : stores.isError ? (
          <ErrorState
            title="Could not load stores"
            description={stores.error.message}
            onRetry={() => void stores.refetch()}
          />
        ) : (
          <div className={styles.stores}>
            {stores.data.map((s) => (
              <Card key={s.id} className={styles.storeCard}>
                <h3>{s.name.replace('Laundry Cart · ', '')}</h3>
                <p>{s.addressLine}</p>
                <p>
                  {s.city} {s.pincode}
                </p>
                <p className={styles.hours}>{s.hours}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="container">
        <div className={styles.cta}>
          <div>
            <h2>Ready when you are.</h2>
            <p>Build your first order in under a minute.</p>
          </div>
          <LinkButton to={authed ? '/orders/new' : '/register'} size="lg" className={styles.ctaBtn}>
            {authed ? 'New order' : 'Get started'}
          </LinkButton>
        </div>
      </div>
    </>
  );
}
