import type { ApiClient } from './client';
import { DemoApiClient } from './demo-client';
import { HttpApiClient } from './http-client';
import { useAuthStore } from '@/store/auth-store';
import { safeLocalStorage } from '@/lib/storage';

export const API_URL: string | undefined = import.meta.env.VITE_API_URL?.trim() || undefined;
export const IS_DEMO_MODE = !API_URL;

const tokenSource = () => useAuthStore.getState().token;

let client: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!client) {
    client = API_URL
      ? new HttpApiClient(API_URL.replace(/\/$/, ''), tokenSource)
      : new DemoApiClient(tokenSource, { storage: safeLocalStorage() });
  }
  return client;
}

export function setApiClient(next: ApiClient | null): void {
  client = next;
}

export type { ApiClient } from './client';
export { ApiError, isApiError, errorMessage } from './errors';
export * from './types';
