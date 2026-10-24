export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface WashType {
  id: string;
  name: string;
  description: string;
}

export interface Garment {
  id: string;
  name: string;
  description: string;
  /** wash-type id → INR per piece */
  prices: Record<string, number>;
}

export interface Catalog {
  garments: Garment[];
  washTypes: WashType[];
}

export interface Store {
  id: string;
  name: string;
  addressLine: string;
  city: string;
  pincode: string;
  phone: string;
  hours: string;
}

export const ORDER_STATUSES = ['placed', 'processing', 'ready', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  phone: string;
}

export interface OrderItemInput {
  garmentId: string;
  quantity: number;
  washTypeIds: string[];
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  storeId: string;
  address: Address;
  notes?: string;
}

export interface PricedWashType {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  garmentId: string;
  garmentName: string;
  quantity: number;
  washTypes: PricedWashType[];
  unitPrice: number;
  lineTotal: number;
}

export interface Pricing {
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalItems: number;
}

export interface StatusEvent {
  status: OrderStatus;
  at: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  statusHistory: StatusEvent[];
  items: OrderItem[];
  store: Pick<Store, 'id' | 'name' | 'addressLine' | 'city' | 'phone'>;
  address: Omit<Address, 'line2'> & { line2: string | null };
  notes: string | null;
  pricing: Pricing;
  createdAt: string;
  updatedAt: string;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}
