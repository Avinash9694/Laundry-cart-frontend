import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setApiClient } from '@/api';
import { DemoApiClient } from '@/api/demo-client';
import { DEMO_ACCOUNT } from '@/api/demo-data';
import { seedDemoOrders } from '@/api/demo-seed';
import { useAuthStore } from '@/store/auth-store';
import { AppRoutes } from '@/app';
import { MemoryStorage } from './setup';

export function makeDemoClient(storage = new MemoryStorage()) {
  const client = new DemoApiClient(() => useAuthStore.getState().token, { storage, latencyMs: 0 });
  setApiClient(client);
  return client;
}

export async function signInDemo(client: DemoApiClient) {
  const session = await client.login({
    email: DEMO_ACCOUNT.email,
    password: DEMO_ACCOUNT.password,
  });
  useAuthStore.getState().setSession(session);
  seedDemoOrders(client);
  return session;
}

export function renderWithProviders(ui: ReactElement, { route = '/' } = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

export function renderApp(route: string) {
  return renderWithProviders(<AppRoutes />, { route });
}
