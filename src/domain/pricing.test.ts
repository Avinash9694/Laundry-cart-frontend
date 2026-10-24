import { describe, expect, it } from 'vitest';
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  deliveryFeeFor,
  priceOrder,
  unitPriceFor,
} from './pricing';
import { DEMO_GARMENTS, DEMO_WASH_TYPES } from '@/api/demo-data';

const shirts = DEMO_GARMENTS.find((g) => g.id === 'shirts')!;
const sarees = DEMO_GARMENTS.find((g) => g.id === 'sarees')!;
const wash = DEMO_WASH_TYPES.find((w) => w.id === 'wash')!;
const iron = DEMO_WASH_TYPES.find((w) => w.id === 'iron')!;
const dryClean = DEMO_WASH_TYPES.find((w) => w.id === 'dry-clean')!;

describe('priceOrder', () => {
  it('multiplies a single wash price by quantity', () => {
    const { items, pricing } = priceOrder([{ garment: shirts, quantity: 3, washTypes: [wash] }]);
    expect(items[0]).toMatchObject({ unitPrice: 20, lineTotal: 60 });
    expect(pricing).toEqual({ subtotal: 60, deliveryFee: DELIVERY_FEE, total: 109, totalItems: 3 });
  });

  it('sums multiple wash types into the unit price and snapshots each price', () => {
    const { items } = priceOrder([
      { garment: shirts, quantity: 2, washTypes: [wash, iron, dryClean] },
    ]);
    expect(items[0]?.unitPrice).toBe(95);
    expect(items[0]?.lineTotal).toBe(190);
    expect(items[0]?.washTypes).toEqual([
      { id: 'wash', name: 'Washing', price: 20 },
      { id: 'iron', name: 'Ironing', price: 15 },
      { id: 'dry-clean', name: 'Dry Clean', price: 60 },
    ]);
  });

  it('prices the same wash type differently per garment', () => {
    const { items } = priceOrder([
      { garment: shirts, quantity: 1, washTypes: [wash] },
      { garment: sarees, quantity: 1, washTypes: [wash] },
    ]);
    expect(items.map((i) => i.unitPrice)).toEqual([20, 60]);
  });

  it('waives delivery at the threshold', () => {
    const { pricing } = priceOrder([{ garment: sarees, quantity: 3, washTypes: [dryClean] }]);
    expect(pricing.subtotal).toBe(540);
    expect(pricing.deliveryFee).toBe(0);
    expect(pricing.total).toBe(540);
  });

  it('returns zeros for an empty order', () => {
    expect(priceOrder([]).pricing).toEqual({
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      totalItems: 0,
    });
  });

  it('throws when a garment lacks a price for a wash type', () => {
    const odd = { ...shirts, prices: { wash: 20 } };
    expect(() => priceOrder([{ garment: odd, quantity: 1, washTypes: [iron] }])).toThrow(
      /no price/,
    );
  });

  it('matches the backend fixture: 2 shirts wash+iron and 1 saree dry clean = 299', () => {
    const { pricing } = priceOrder([
      { garment: shirts, quantity: 2, washTypes: [wash, iron] },
      { garment: sarees, quantity: 1, washTypes: [dryClean] },
    ]);
    expect(pricing).toEqual({ subtotal: 250, deliveryFee: 49, total: 299, totalItems: 3 });
  });
});

describe('deliveryFeeFor / unitPriceFor', () => {
  it('charges nothing on an empty basket', () => expect(deliveryFeeFor(0)).toBe(0));
  it('charges the fee just under the threshold', () =>
    expect(deliveryFeeFor(FREE_DELIVERY_THRESHOLD - 1)).toBe(DELIVERY_FEE));
  it('unitPriceFor ignores unknown wash ids instead of throwing (used for live previews)', () => {
    expect(unitPriceFor(shirts, ['wash', 'nope'])).toBe(20);
  });
});
