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

export interface ApiClient {
  readonly mode: 'http' | 'demo';
  register(input: RegisterInput): Promise<AuthResponse>;
  login(input: LoginInput): Promise<AuthResponse>;
  me(): Promise<User>;
  getCatalog(): Promise<Catalog>;
  getStores(): Promise<Store[]>;
  createOrder(input: CreateOrderInput): Promise<Order>;
  listOrders(params?: ListOrdersParams): Promise<Page<Order>>;
  getOrder(id: string): Promise<Order>;
  cancelOrder(id: string): Promise<Order>;
}

export type TokenSource = () => string | null;
