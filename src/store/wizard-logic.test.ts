import { describe, expect, it } from 'vitest';
import {
  EMPTY_WIZARD,
  garmentsMissingWash,
  isStepComplete,
  maxReachableStep,
  previewPricing,
  selectedGarmentIds,
  setQuantity,
  toOrderItems,
  toggleWash,
  type WizardState,
} from './wizard-logic';
import { DEMO_GARMENTS, DEMO_WASH_TYPES } from '@/api/demo-data';

const catalog = { garments: DEMO_GARMENTS, washTypes: DEMO_WASH_TYPES };
const address = { line1: '1 Road', city: 'Hyderabad', pincode: '500001', phone: '+91 9999999999' };

describe('setQuantity', () => {
  it('removes the key at zero and clamps to 1..100 integers', () => {
    expect(setQuantity({ shirts: 2 }, 'shirts', 0)).toEqual({});
    expect(setQuantity({}, 'shirts', 250)).toEqual({ shirts: 100 });
    expect(setQuantity({}, 'shirts', 2.7)).toEqual({ shirts: 2 });
    expect(setQuantity({}, 'shirts', Number.NaN)).toEqual({});
  });
});

describe('toggleWash', () => {
  it('adds then removes a wash type without touching other garments', () => {
    const once = toggleWash({ jeans: ['wash'] }, 'shirts', 'iron');
    expect(once).toEqual({ jeans: ['wash'], shirts: ['iron'] });
    expect(toggleWash(once, 'shirts', 'iron')).toEqual({ jeans: ['wash'], shirts: [] });
  });
});

describe('step completion', () => {
  const withGarments: WizardState = { ...EMPTY_WIZARD, quantities: { shirts: 2, jeans: 1 } };

  it('garments step needs at least one quantity', () => {
    expect(isStepComplete('garments', EMPTY_WIZARD)).toBe(false);
    expect(isStepComplete('garments', withGarments)).toBe(true);
  });

  it('wash-types step needs every selected garment to have a wash', () => {
    const partial = { ...withGarments, washSelections: { shirts: ['wash'] } };
    expect(garmentsMissingWash(partial)).toEqual(['jeans']);
    expect(isStepComplete('wash-types', partial)).toBe(false);
    const full = { ...partial, washSelections: { shirts: ['wash'], jeans: ['wash', 'fold'] } };
    expect(isStepComplete('wash-types', full)).toBe(true);
  });

  it('pickup step needs a store and an address', () => {
    expect(isStepComplete('pickup', { ...withGarments, storeId: 'hitech-city' })).toBe(false);
    expect(isStepComplete('pickup', { ...withGarments, storeId: 'hitech-city', address })).toBe(
      true,
    );
  });

  it('maxReachableStep stops at the first incomplete step', () => {
    expect(maxReachableStep(EMPTY_WIZARD)).toBe('garments');
    expect(maxReachableStep(withGarments)).toBe('wash-types');
    const ready = {
      ...withGarments,
      washSelections: { shirts: ['wash'], jeans: ['wash'] },
      storeId: 'hitech-city',
      address,
    };
    expect(maxReachableStep(ready)).toBe('review');
  });
});

describe('toOrderItems / previewPricing', () => {
  it('builds the API payload from quantities and selections', () => {
    expect(selectedGarmentIds({ quantities: { shirts: 2, towels: 0 } })).toEqual(['shirts']);
    expect(
      toOrderItems({ quantities: { shirts: 2 }, washSelections: { shirts: ['wash', 'iron'] } }),
    ).toEqual([{ garmentId: 'shirts', quantity: 2, washTypeIds: ['wash', 'iron'] }]);
  });

  it('prices only garments that have a wash type yet', () => {
    const { items, pricing } = previewPricing(
      { quantities: { shirts: 2, jeans: 1 }, washSelections: { shirts: ['wash', 'iron'] } },
      catalog,
    );
    expect(items).toHaveLength(1);
    expect(pricing.subtotal).toBe(70);
  });
});
