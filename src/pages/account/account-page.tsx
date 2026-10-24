import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { IS_DEMO_MODE } from '@/api';
import { useAuthStore } from '@/store/auth-store';
import { useWizardStore } from '@/store/wizard-store';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import styles from '@/pages/orders/orders.module.css';

export function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const resetWizard = useWizardStore((s) => s.reset);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { theme, toggle } = useTheme();

  if (!user) return null;

  const signOut = () => {
    clear();
    resetWizard();
    qc.clear();
    navigate('/');
  };

  return (
    <div className="container">
      <PageHeader
        eyebrow="Account"
        title={user.name}
        description={`Member since ${formatDate(user.createdAt)}`}
      />
      <div className={styles.detailGrid}>
        <Card as="section" aria-labelledby="profile-title">
          <h2 id="profile-title" style={{ fontSize: '1.0625rem', marginBottom: 16 }}>
            Profile
          </h2>
          <dl className={styles.kv}>
            <dt>Name</dt>
            <dd>{user.name}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Phone</dt>
            <dd>
              {user.phone ?? <span style={{ color: 'var(--text-subtle)' }}>Not provided</span>}
            </dd>
            <dt>Role</dt>
            <dd style={{ textTransform: 'capitalize' }}>{user.role}</dd>
            <dt>Data source</dt>
            <dd>{IS_DEMO_MODE ? 'Demo mode — stored in this browser' : 'Laundry Cart API'}</dd>
          </dl>
        </Card>
        <div className={styles.block}>
          <Card as="section" aria-labelledby="prefs-title">
            <h2 id="prefs-title" style={{ fontSize: '1.0625rem', marginBottom: 12 }}>
              Appearance
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              Currently using the {theme} theme. Your choice is remembered on this device.
            </p>
            <Button variant="secondary" onClick={toggle}>
              Switch to {theme === 'dark' ? 'light' : 'dark'} theme
            </Button>
          </Card>
          <Card as="section" aria-labelledby="session-title">
            <h2 id="session-title" style={{ fontSize: '1.0625rem', marginBottom: 12 }}>
              Session
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              Signing out clears your session and any order in progress.
            </p>
            <Button variant="danger" onClick={signOut}>
              Sign out
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
