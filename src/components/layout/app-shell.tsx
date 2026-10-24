import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { IS_DEMO_MODE } from '@/api';
import { DEMO_ACCOUNT } from '@/api/demo-data';
import { useAuthStore } from '@/store/auth-store';
import { useWizardStore } from '@/store/wizard-store';
import { useTheme } from '@/hooks/use-theme';
import { readJson, safeSessionStorage, writeJson } from '@/lib/storage';
import { Button, LinkButton } from '@/components/ui/button';
import {
  IconClose,
  IconGitHub,
  IconLinkedIn,
  IconMenu,
  IconMoon,
  IconSun,
} from '@/components/ui/icons';
import { Toaster } from '@/components/ui/toaster';
import { Logo } from './logo';
import styles from './layout.module.css';

const AUTHED_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/orders/new', label: 'New order' },
  { to: '/orders', label: 'Orders' },
  { to: '/account', label: 'Account' },
];

const PUBLIC_LINKS = [
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#stores', label: 'Stores' },
];

function navClass({ isActive }: { isActive: boolean }) {
  return [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ');
}

function DemoBanner() {
  const [dismissed, setDismissed] = useState(() =>
    readJson(safeSessionStorage(), 'laundry-cart.banner', false),
  );
  if (!IS_DEMO_MODE || dismissed) return null;
  return (
    <div className={styles.banner} role="region" aria-label="Demo mode notice">
      <div className={['container', styles.bannerInner].join(' ')}>
        <p className={styles.bannerText}>
          <strong>Demo mode.</strong> No backend is connected; orders are saved in this browser
          only. Sign in with <code>{DEMO_ACCOUNT.email}</code> /{' '}
          <code>{DEMO_ACCOUNT.password}</code> or register any account.
        </p>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="Dismiss demo notice"
          onClick={() => {
            writeJson(safeSessionStorage(), 'laundry-cart.banner', true);
            setDismissed(true);
          }}
        >
          <IconClose size={18} />
        </button>
      </div>
    </div>
  );
}

export function Header() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const resetWizard = useWizardStore((s) => s.reset);
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  const signOut = () => {
    clear();
    resetWizard();
    qc.clear();
    navigate('/');
  };

  const links = user ? AUTHED_LINKS : PUBLIC_LINKS;
  const initials = user?.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className={styles.header}>
      <div className={['container', styles.headerInner].join(' ')}>
        <Logo />
        <nav className={styles.nav} aria-label="Primary">
          {links.map((l) =>
            l.to.includes('#') ? (
              <a key={l.to} href={l.to} className={styles.navLink}>
                {l.label}
              </a>
            ) : (
              <NavLink key={l.to} to={l.to} className={navClass} end={l.to === '/orders'}>
                {l.label}
              </NavLink>
            ),
          )}
        </nav>
        <span className={styles.spacer} />
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
          {user ? (
            <>
              <span className={styles.userChip}>
                <span className={styles.avatar} aria-hidden>
                  {initials}
                </span>
                {user.name}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={signOut}
                className={styles.desktopOnly}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <LinkButton to="/login" variant="ghost" size="sm" className={styles.desktopOnly}>
                Sign in
              </LinkButton>
              <LinkButton to="/register" size="sm" className={styles.wideOnly}>
                Get started
              </LinkButton>
            </>
          )}
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <IconClose size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          className={['container', styles.mobileNav].join(' ')}
          aria-label="Mobile"
        >
          {links.map((l) =>
            l.to.includes('#') ? (
              <a key={l.to} href={l.to} className={styles.navLink}>
                {l.label}
              </a>
            ) : (
              <NavLink key={l.to} to={l.to} className={navClass} end={l.to === '/orders'}>
                {l.label}
              </NavLink>
            ),
          )}
          {user ? (
            <Button variant="secondary" onClick={signOut}>
              Sign out
            </Button>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Sign in
              </NavLink>
              <NavLink to="/register" className={navClass}>
                Get started
              </NavLink>
            </>
          )}
        </nav>
      ) : null}
    </header>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={['container', styles.footerInner].join(' ')}>
        <p>
          Built by{' '}
          <a href="https://avinash9694.github.io" target="_blank" rel="noreferrer">
            Avinash Sahu
          </a>
        </p>
        <div className={styles.footerLinks}>
          <a
            href="https://github.com/Avinash9694"
            className={styles.footerIcon}
            aria-label="GitHub profile"
            target="_blank"
            rel="noreferrer"
          >
            <IconGitHub size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/A-v-i-n-a-s-h/"
            className={styles.footerIcon}
            aria-label="LinkedIn profile"
            target="_blank"
            rel="noreferrer"
          >
            <IconLinkedIn size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export function AppShell() {
  return (
    <div className={styles.shell}>
      <DemoBanner />
      <Header />
      <main className={styles.main} id="main">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageTitle}>
        {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
