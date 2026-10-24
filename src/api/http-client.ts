import { ApiError, type ApiErrorDetail } from './errors';
import type { ApiClient, TokenSource } from './client';
import type {
  AuthResponse,
  Catalog,
  CreateOrderInput,
  ListOrdersParams,
  LoginInput,
  Order,
  Page,
  RegisterInput,
  Store,
  User,
} from './types';

interface ErrorEnvelope {
  error?: { code?: string; message?: string; details?: ApiErrorDetail[] };
}

export class HttpApiClient implements ApiClient {
  readonly mode = 'http' as const;

  constructor(
    private readonly baseUrl: string,
    private readonly getToken: TokenSource,
    private readonly fetchImpl: typeof fetch = (...args) => fetch(...args),
  ) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (init.body) headers.set('Content-Type', 'application/json');
    const token = this.getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseUrl}${path}`, { ...init, headers });
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection.');
    }

    if (res.status === 204) return undefined as T;
    const body: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const envelope = (body ?? {}) as ErrorEnvelope;
      throw new ApiError(
        res.status,
        envelope.error?.code ?? 'HTTP_ERROR',
        envelope.error?.message ?? `Request failed with status ${res.status}`,
        envelope.error?.details,
      );
    }
    return body as T;
  }

  register(input: RegisterInput) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  login(input: LoginInput) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async me() {
    return (await this.request<{ user: User }>('/auth/me')).user;
  }

  getCatalog() {
    return this.request<Catalog>('/catalog');
  }

  async getStores() {
    return (await this.request<{ stores: Store[] }>('/stores')).stores;
  }

  async createOrder(input: CreateOrderInput) {
    return (
      await this.request<{ order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    ).order;
  }

  listOrders(params: ListOrdersParams = {}) {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    if (params.status) search.set('status', params.status);
    const qs = search.toString();
    return this.request<Page<Order>>(`/orders${qs ? `?${qs}` : ''}`);
  }

  async getOrder(id: string) {
    return (await this.request<{ order: Order }>(`/orders/${encodeURIComponent(id)}`)).order;
  }

  async cancelOrder(id: string) {
    return (
      await this.request<{ order: Order }>(`/orders/${encodeURIComponent(id)}/cancel`, {
        method: 'POST',
      })
    ).order;
  }
}
