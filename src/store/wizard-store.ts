import { create } from 'zustand';
import type { Address } from '@/api/types';
import { readJson, safeSessionStorage, writeJson, removeKey } from '@/lib/storage';
import {
  EMPTY_WIZARD,
  WIZARD_STEPS,
  maxReachableStep,
  setQuantity,
  stepIndex,
  toggleWash,
  type WizardState,
  type WizardStep,
} from './wizard-logic';

const KEY = 'laundry-cart.wizard';

interface WizardActions {
  setQuantity: (garmentId: string, quantity: number) => void;
  toggleWash: (garmentId: string, washTypeId: string) => void;
  setPickup: (storeId: string, address: Address, notes: string) => void;
  goTo: (step: WizardStep) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
}

export type WizardStore = WizardState & WizardActions;

function restore(): WizardState {
  const saved = readJson<Partial<WizardState> | null>(safeSessionStorage(), KEY, null);
  if (!saved || typeof saved !== 'object') return EMPTY_WIZARD;
  const merged: WizardState = { ...EMPTY_WIZARD, ...saved };
  // Never resume on a step the saved data cannot support.
  const reachable = maxReachableStep(merged);
  if (stepIndex(merged.step) > stepIndex(reachable)) merged.step = reachable;
  return merged;
}

export const useWizardStore = create<WizardStore>((set, get) => {
  const persist = (patch: Partial<WizardState>) => {
    set(patch);
    const { step, quantities, washSelections, storeId, address, notes } = get();
    writeJson(safeSessionStorage(), KEY, {
      step,
      quantities,
      washSelections,
      storeId,
      address,
      notes,
    });
  };

  return {
    ...restore(),
    setQuantity: (garmentId, quantity) => {
      const quantities = setQuantity(get().quantities, garmentId, quantity);
      const washSelections = { ...get().washSelections };
      if (!quantities[garmentId]) delete washSelections[garmentId];
      persist({ quantities, washSelections });
    },
    toggleWash: (garmentId, washTypeId) =>
      persist({ washSelections: toggleWash(get().washSelections, garmentId, washTypeId) }),
    setPickup: (storeId, address, notes) => persist({ storeId, address, notes }),
    goTo: (step) => {
      if (stepIndex(step) <= stepIndex(maxReachableStep(get()))) persist({ step });
    },
    next: () => {
      const i = stepIndex(get().step);
      const target = WIZARD_STEPS[Math.min(i + 1, WIZARD_STEPS.length - 1)];
      if (target) get().goTo(target);
    },
    back: () => {
      const i = stepIndex(get().step);
      const target = WIZARD_STEPS[Math.max(i - 1, 0)];
      if (target) persist({ step: target });
    },
    reset: () => {
      removeKey(safeSessionStorage(), KEY);
      set({ ...EMPTY_WIZARD });
    },
  };
});
