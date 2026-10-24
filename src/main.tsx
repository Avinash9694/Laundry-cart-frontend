import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { IS_DEMO_MODE, getApiClient } from './api';
import { DemoApiClient } from './api/demo-client';
import { seedDemoOrders } from './api/demo-seed';
import { applyTheme, resolveInitialTheme } from './hooks/use-theme';
import './styles/global.css';

applyTheme(resolveInitialTheme());

if (IS_DEMO_MODE) {
  const client = getApiClient();
  if (client instanceof DemoApiClient) seedDemoOrders(client);
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root is missing');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
