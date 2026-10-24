import type { DemoApiClient, DemoOrderSample } from './demo-client';
import { DEMO_ACCOUNT } from './demo-data';
import type { CreateOrderInput, OrderStatus } from './types';

const DAY = 24 * 60 * 60 * 1000;

interface SampleOrder {
  daysAgo: number;
  input: CreateOrderInput;
  path: OrderStatus[];
}

const address = {
  line1: 'Flat 4B, Lakeview Residency',
  line2: 'Road No. 36, Jubilee Hills',
  city: 'Hyderabad',
  pincode: '500033',
  phone: '+91 98480 12345',
};

const SAMPLES: SampleOrder[] = [
  {
    daysAgo: 1,
    input: {
      items: [
        { garmentId: 'shirts', quantity: 4, washTypeIds: ['wash', 'iron'] },
        { garmentId: 'trousers', quantity: 2, washTypeIds: ['wash', 'iron'] },
      ],
      storeId: 'hitech-city',
      address,
      notes: 'Please use fragrance-free detergent.',
    },
    path: [],
  },
  {
    daysAgo: 3,
    input: {
      items: [
        { garmentId: 'sarees', quantity: 2, washTypeIds: ['dry-clean', 'fold'] },
        { garmentId: 'kurtas', quantity: 3, washTypeIds: ['wash', 'iron'] },
      ],
      storeId: 'banjara-hills',
      address,
    },
    path: ['processing'],
  },
  {
    daysAgo: 6,
    input: {
      items: [{ garmentId: 'bedsheets', quantity: 3, washTypeIds: ['wash', 'fold'] }],
      storeId: 'gachibowli',
      address,
    },
    path: ['processing', 'ready'],
  },
  {
    daysAgo: 12,
    input: {
      items: [
        { garmentId: 'jackets', quantity: 1, washTypeIds: ['dry-clean', 'stain'] },
        { garmentId: 'jeans', quantity: 2, washTypeIds: ['wash', 'fold'] },
      ],
      storeId: 'hitech-city',
      address,
    },
    path: ['processing', 'ready', 'delivered'],
  },
  {
    daysAgo: 20,
    input: {
      items: [{ garmentId: 'towels', quantity: 6, washTypeIds: ['wash', 'fold'] }],
      storeId: 'kukatpally',
      address,
    },
    path: ['cancelled'],
  },
  {
    daysAgo: 27,
    input: {
      items: [
        { garmentId: 'tshirts', quantity: 8, washTypeIds: ['wash', 'fold'] },
        { garmentId: 'shirts', quantity: 3, washTypeIds: ['wash', 'iron'] },
      ],
      storeId: 'gachibowli',
      address,
    },
    path: ['processing', 'ready', 'delivered'],
  },
];

/** Seeds the demo account's history the first time it signs in; a no-op after that. */
export function seedDemoOrders(client: DemoApiClient, now = Date.now()): number {
  const samples: DemoOrderSample[] = SAMPLES.map((s) => ({
    input: s.input,
    placedAt: new Date(now - s.daysAgo * DAY),
    path: s.path,
  }));
  return client.seedOrders(DEMO_ACCOUNT.email, samples);
}
