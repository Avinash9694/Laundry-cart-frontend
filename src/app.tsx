import { HashRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query-client';
import { AppShell } from '@/components/layout/app-shell';
import { GuestOnlyRoute, ProtectedRoute } from '@/components/layout/protected-route';
import { LandingPage } from '@/pages/landing/landing-page';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { NewOrderPage } from '@/pages/new-order/new-order-page';
import { OrdersPage } from '@/pages/orders/orders-page';
import { OrderDetailPage } from '@/pages/orders/order-detail-page';
import { AccountPage } from '@/pages/account/account-page';
import { NotFoundPage } from '@/pages/not-found-page';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LandingPage />} />
        <Route element={<GuestOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders/new" element={<NewOrderPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export function App({ queryClient = createQueryClient() }: { queryClient?: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </QueryClientProvider>
  );
}
