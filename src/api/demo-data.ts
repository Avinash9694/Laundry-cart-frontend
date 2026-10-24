import type { Garment, Store, WashType } from './types';

// Same catalog the backend seeds (Laundry-cart-backend/src/catalog/seed-data.js).

export const DEMO_WASH_TYPES: WashType[] = [
  { id: 'wash', name: 'Washing', description: 'Machine wash with fabric-safe detergent' },
  { id: 'iron', name: 'Ironing', description: 'Steam ironed and hung' },
  { id: 'dry-clean', name: 'Dry Clean', description: 'Solvent clean for delicate fabrics' },
  { id: 'fold', name: 'Fold', description: 'Folded and packed ready for the wardrobe' },
  { id: 'stain', name: 'Stain Removal', description: 'Spot treatment before the wash' },
];

export const DEMO_GARMENTS: Garment[] = [
  {
    id: 'shirts',
    name: 'Shirts',
    description: 'Formal and casual shirts',
    prices: { wash: 20, iron: 15, 'dry-clean': 60, fold: 10, stain: 30 },
  },
  {
    id: 'tshirts',
    name: 'T-Shirts',
    description: 'Cotton and polo tees',
    prices: { wash: 15, iron: 10, 'dry-clean': 50, fold: 8, stain: 25 },
  },
  {
    id: 'trousers',
    name: 'Trousers',
    description: 'Chinos, formal trousers',
    prices: { wash: 25, iron: 20, 'dry-clean': 80, fold: 10, stain: 35 },
  },
  {
    id: 'jeans',
    name: 'Jeans',
    description: 'Denim, all weights',
    prices: { wash: 30, iron: 20, 'dry-clean': 90, fold: 10, stain: 40 },
  },
  {
    id: 'kurtas',
    name: 'Kurtas',
    description: 'Cotton and silk kurtas',
    prices: { wash: 25, iron: 20, 'dry-clean': 90, fold: 10, stain: 40 },
  },
  {
    id: 'sarees',
    name: 'Sarees',
    description: 'Silk, cotton and georgette',
    prices: { wash: 60, iron: 50, 'dry-clean': 180, fold: 20, stain: 80 },
  },
  {
    id: 'jackets',
    name: 'Jackets',
    description: 'Blazers, winter and denim jackets',
    prices: { wash: 80, iron: 40, 'dry-clean': 220, fold: 15, stain: 90 },
  },
  {
    id: 'bedsheets',
    name: 'Bedsheets',
    description: 'Single and double sheets',
    prices: { wash: 60, iron: 40, 'dry-clean': 150, fold: 15, stain: 60 },
  },
  {
    id: 'towels',
    name: 'Towels',
    description: 'Bath and hand towels',
    prices: { wash: 30, iron: 15, 'dry-clean': 80, fold: 10, stain: 35 },
  },
  {
    id: 'blankets',
    name: 'Blankets',
    description: 'Quilts, comforters and blankets',
    prices: { wash: 150, iron: 60, 'dry-clean': 350, fold: 30, stain: 120 },
  },
];

export const DEMO_STORES: Store[] = [
  {
    id: 'hitech-city',
    name: 'Laundry Cart · HITEC City',
    addressLine: 'Plot 12, Cyber Towers Road, Madhapur',
    city: 'Hyderabad',
    pincode: '500081',
    phone: '+91 40 4000 1101',
    hours: 'Mon–Sat 8:00–21:00',
  },
  {
    id: 'gachibowli',
    name: 'Laundry Cart · Gachibowli',
    addressLine: '4-51, DLF Road, Gachibowli',
    city: 'Hyderabad',
    pincode: '500032',
    phone: '+91 40 4000 1102',
    hours: 'Mon–Sun 8:00–22:00',
  },
  {
    id: 'banjara-hills',
    name: 'Laundry Cart · Banjara Hills',
    addressLine: 'Road No. 12, Banjara Hills',
    city: 'Hyderabad',
    pincode: '500034',
    phone: '+91 40 4000 1103',
    hours: 'Mon–Sat 9:00–20:00',
  },
  {
    id: 'kukatpally',
    name: 'Laundry Cart · Kukatpally',
    addressLine: 'KPHB Phase 3, Kukatpally',
    city: 'Hyderabad',
    pincode: '500072',
    phone: '+91 40 4000 1104',
    hours: 'Mon–Sun 7:30–21:30',
  },
];

export const DEMO_ACCOUNT = {
  email: 'demo@laundry.test',
  password: 'demo1234',
  name: 'Demo Customer',
};
