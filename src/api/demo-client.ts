import { ApiError } from './errors';
import type { ApiClient, TokenSource } from './client';
import { DEMO_ACCOUNT, DEMO_GARMENTS, DEMO_STORES, DEMO_WASH_TYPES } from './demo-data';
import type {
  AuthResponse,
  Catalog,
  CreateOrderInput,
  ListOrdersParams,
  LoginInput,
  Order,
  OrderStatus,
  Page,
  RegisterInput,
  Store,
  User,
} from './types';
import { priceOrder } from '@/domain/pricing';
import { readJson, writeJson } from '@/lib/storage';

interface DemoUser extends User {
  passwordDigest: string;
}

interface DemoDb {
  users: DemoUser[];
  orders: Order[];
}

export interface DemoOrderSample {
  input: CreateOrderInput;
  placedAt: Date;
  path: OrderStatus[];
}

export interface DemoClientOptions {
  storage?: Storage | undefined;
  storageKey?: string;
  latencyMs?: number;
  now?: () => Date;
  random?: () => number;
}

const TOKEN_PREFIX = 'demo.';

// Not security: demo credentials live in the visitor's own browser. This only
// keeps the raw password out of localStorage.
function digest(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export class DemoApiClient implements ApiClient {
  readonly mode = 'demo' as const;
  private readonly storage: Storage | undefined;
  private readonly key: string;
  private readonly latencyMs: number;
  private readonly now: () => Date;
  private readonly random: () => number;
  private memory: DemoDb | null = null;

  constructor(
    private readonly getToken: TokenSource,
    options: DemoClientOptions = {},
  ) {
    this.storage = options.storage;
    this.key = options.storageKey ?? 'laundry-cart.demo';
    this.latencyMs = options.latencyMs ?? 350;
    this.now = options.now ?? (() => new Date());
    this.random = options.random ?? Math.random;
  }

  private load(): DemoDb {
    if (this.memory) return this.memory;
    const db = readJson<DemoDb>(this.storage, this.key, { users: [], orders: [] });
    if (!db.users.some((u) => u.email === DEMO_ACCOUNT.email)) {
      db.users.push(this.buildUser(DEMO_ACCOUNT, 'demo-user'));
    }
    this.memory = db;
    return db;
  }

  private save(db: DemoDb) {
    this.memory = db;
    writeJson(this.storage, this.key, db);
  }

  private buildUser(input: RegisterInput, id = this.newId('u')): DemoUser {
    return {
      id,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone ?? null,
      role: 'user',
      createdAt: this.now().toISOString(),
      passwordDigest: digest(input.password),
    };
  }

  private newId(prefix: string): string {
    return `${prefix}_${this.now().getTime().toString(36)}${Math.floor(this.random() * 1e6).toString(36)}`;
  }

  private async delay<T>(value: T): Promise<T> {
    if (this.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    }
    return value;
  }

  private toPublic({ passwordDigest: _digest, ...user }: DemoUser): User {
    return user;
  }

  private currentUser(): DemoUser {
    const token = this.getToken();
    if (!token?.startsWith(TOKEN_PREFIX)) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Please sign in to continue');
    }
    const user = this.load().users.find((u) => u.id === token.slice(TOKEN_PREFIX.length));
    if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'Account no longer exists');
    return user;
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const db = this.load();
    const email = input.email.trim().toLowerCase();
    if (db.users.some((u) => u.email === email)) {
      throw await this.delay(
        new ApiError(409, 'CONFLICT', 'An account with that email already exists'),
      );
    }
    const user = this.buildUser({ ...input, email });
    this.save({ ...db, users: [...db.users, user] });
    return this.delay({ token: `${TOKEN_PREFIX}${user.id}`, user: this.toPublic(user) });
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = this.load().users.find((u) => u.email === input.email.trim().toLowerCase());
    if (!user || user.passwordDigest !== digest(input.password)) {
      throw await this.delay(new ApiError(401, 'UNAUTHORIZED', 'Incorrect email or password'));
    }
    return this.delay({ token: `${TOKEN_PREFIX}${user.id}`, user: this.toPublic(user) });
  }

  async me(): Promise<User> {
    return this.delay(this.toPublic(this.currentUser()));
  }

  getCatalog(): Promise<Catalog> {
    return this.delay({ garments: DEMO_GARMENTS, washTypes: DEMO_WASH_TYPES });
  }

  getStores(): Promise<Store[]> {
    return this.delay(DEMO_STORES);
  }

  private buildOrder(user: DemoUser, input: CreateOrderInput, at: string): Order {
    const store = DEMO_STORES.find((s) => s.id === input.storeId);
    if (!store) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Request validation failed', [
        { path: 'storeId', message: 'Unknown store' },
      ]);
    }
    if (input.items.length === 0) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Add at least one garment');
    }
    const lines = input.items.map((item) => {
      const garment = DEMO_GARMENTS.find((g) => g.id === item.garmentId);
      if (!garment)
        throw new ApiError(422, 'VALIDATION_ERROR', `Unknown garment ${item.garmentId}`);
      const washTypes = item.washTypeIds.map((id) => {
        const wash = DEMO_WASH_TYPES.find((w) => w.id === id);
        if (!wash) throw new ApiError(422, 'VALIDATION_ERROR', `Unknown wash type ${id}`);
        return wash;
      });
      return { garment, quantity: item.quantity, washTypes };
    });

    const { items, pricing } = priceOrder(lines);
    return {
      id: this.newId('o'),
      orderNumber: this.orderNumber(new Date(at)),
      userId: user.id,
      status: 'placed',
      statusHistory: [{ status: 'placed', at }],
      items,
      store: {
        id: store.id,
        name: store.name,
        addressLine: store.addressLine,
        city: store.city,
        phone: store.phone,
      },
      address: { ...input.address, line2: input.address.line2 ?? null },
      notes: input.notes ?? null,
      pricing,
      createdAt: at,
      updatedAt: at,
    };
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const user = this.currentUser();
    const order = this.buildOrder(user, input, this.now().toISOString());
    const db = this.load();
    this.save({ ...db, orders: [order, ...db.orders] });
    return this.delay(order);
  }

  async listOrders(params: ListOrdersParams = {}): Promise<Page<Order>> {
    const user = this.currentUser();
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 10));
    const mine = this.load()
      .orders.filter((o) => o.userId === user.id && (!params.status || o.status === params.status))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * limit;
    return this.delay({
      data: mine.slice(start, start + limit),
      meta: {
        page,
        limit,
        total: mine.length,
        totalPages: Math.max(1, Math.ceil(mine.length / limit)),
      },
    });
  }

  async getOrder(id: string): Promise<Order> {
    const user = this.currentUser();
    const order = this.load().orders.find((o) => o.id === id && o.userId === user.id);
    if (!order) throw await this.delay(new ApiError(404, 'NOT_FOUND', 'Order not found'));
    return this.delay(order);
  }

  async cancelOrder(id: string): Promise<Order> {
    const user = this.currentUser();
    const db = this.load();
    const order = db.orders.find((o) => o.id === id && o.userId === user.id);
    if (!order) throw await this.delay(new ApiError(404, 'NOT_FOUND', 'Order not found'));
    if (order.status !== 'placed') {
      throw await this.delay(
        new ApiError(
          409,
          'CONFLICT',
          `Only placed orders can be cancelled (current status: ${order.status})`,
        ),
      );
    }
    const at = this.now().toISOString();
    const updated: Order = {
      ...order,
      status: 'cancelled',
      statusHistory: [...order.statusHistory, { status: 'cancelled', at }],
      updatedAt: at,
    };
    this.save({ ...db, orders: db.orders.map((o) => (o.id === id ? updated : o)) });
    return this.delay(updated);
  }

  /**
   * Demo-only: gives an account a believable history on first sign-in. Each
   * sample is placed at `placedAt` and walked along `path` six hours per step.
   */
  seedOrders(email: string, samples: DemoOrderSample[]): number {
    const db = this.load();
    const user = db.users.find((u) => u.email === email);
    if (!user || db.orders.some((o) => o.userId === user.id)) return 0;
    const seeded = samples.map(({ input, placedAt, path }) => {
      const order = this.buildOrder(user, input, placedAt.toISOString());
      const history = path.map((status, index) => ({
        status,
        at: new Date(placedAt.getTime() + (index + 1) * 6 * 60 * 60 * 1000).toISOString(),
      }));
      const last = history[history.length - 1];
      return {
        ...order,
        status: last?.status ?? order.status,
        statusHistory: [...order.statusHistory, ...history],
        updatedAt: last?.at ?? order.updatedAt,
      };
    });
    this.save({ ...db, orders: [...seeded, ...db.orders] });
    return seeded.length;
  }

  private orderNumber(at: Date): string {
    const stamp = at.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(this.random() * 36 ** 4)
      .toString(36)
      .toUpperCase()
      .padStart(4, '0');
    return `LC-${stamp}-${rand}`;
  }
}
