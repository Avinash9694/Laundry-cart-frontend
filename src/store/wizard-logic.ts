import type { Address, Catalog, OrderItemInput } from '@/api/types';
import { priceOrder, type PricedOrder } from '@/domain/pricing';

export const WIZARD_STEPS = ['garments', 'wash-types', 'pickup', 'review'] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export const STEP_LABELS: Record<WizardStep, string> = {
  garments: 'Garments',
  'wash-types': 'Wash types',
  pickup: 'Pickup',
  review: 'Review',
};

export interface WizardState {
  step: WizardStep;
  quantities: Record<string, number>;
  washSelections: Record<string, string[]>;
  storeId: string | null;
  address: Address | null;
  notes: string;
}

export const EMPTY_WIZARD: WizardState = {
  step: 'garments',
  quantities: {},
  washSelections: {},
  storeId: null,
  address: null,
  notes: '',
};

export function stepIndex(step: WizardStep): number {
  return WIZARD_STEPS.indexOf(step);
}

export function selectedGarmentIds(state: Pick<WizardState, 'quantities'>): string[] {
  return Object.entries(state.quantities)
    .filter(([, qty]) => qty > 0)
    .map(([id]) => id);
}

export function setQuantity(
  quantities: Record<string, number>,
  garmentId: string,
  quantity: number,
): Record<string, number> {
  const next = { ...quantities };
  const clamped = Math.max(0, Math.min(100, Math.floor(quantity) || 0));
  if (clamped === 0) delete next[garmentId];
  else next[garmentId] = clamped;
  return next;
}

export function toggleWash(
  selections: Record<string, string[]>,
  garmentId: string,
  washTypeId: string,
): Record<string, string[]> {
  const current = selections[garmentId] ?? [];
  const next = current.includes(washTypeId)
    ? current.filter((id) => id !== washTypeId)
    : [...current, washTypeId];
  return { ...selections, [garmentId]: next };
}

/** Which garments on the wash-types step still have no wash selected. */
export function garmentsMissingWash(
  state: Pick<WizardState, 'quantities' | 'washSelections'>,
): string[] {
  return selectedGarmentIds(state).filter((id) => (state.washSelections[id] ?? []).length === 0);
}

export function isStepComplete(step: WizardStep, state: WizardState): boolean {
  switch (step) {
    case 'garments':
      return selectedGarmentIds(state).length > 0;
    case 'wash-types':
      return selectedGarmentIds(state).length > 0 && garmentsMissingWash(state).length === 0;
    case 'pickup':
      return state.storeId !== null && state.address !== null;
    case 'review':
      return isStepComplete('wash-types', state) && isStepComplete('pickup', state);
  }
}

/** The furthest step the user may jump to from the progress indicator. */
export function maxReachableStep(state: WizardState): WizardStep {
  let reachable: WizardStep = 'garments';
  for (const step of WIZARD_STEPS) {
    reachable = step;
    if (!isStepComplete(step, state)) break;
  }
  return reachable;
}

export function toOrderItems(
  state: Pick<WizardState, 'quantities' | 'washSelections'>,
): OrderItemInput[] {
  return selectedGarmentIds(state).map((garmentId) => ({
    garmentId,
    quantity: state.quantities[garmentId] ?? 0,
    washTypeIds: state.washSelections[garmentId] ?? [],
  }));
}

/** Live preview for the wizard; only garments with at least one wash are priced. */
export function previewPricing(
  state: Pick<WizardState, 'quantities' | 'washSelections'>,
  catalog: Catalog,
): PricedOrder {
  const washById = new Map(catalog.washTypes.map((w) => [w.id, w]));
  const lines = toOrderItems(state).flatMap((item) => {
    const garment = catalog.garments.find((g) => g.id === item.garmentId);
    if (!garment || item.washTypeIds.length === 0) return [];
    const washTypes = item.washTypeIds.flatMap((id) => {
      const wash = washById.get(id);
      return wash ? [{ id: wash.id, name: wash.name }] : [];
    });
    return [{ garment, quantity: item.quantity, washTypes }];
  });
  return priceOrder(lines);
}
