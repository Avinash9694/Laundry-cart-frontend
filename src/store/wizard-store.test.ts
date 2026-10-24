import { describe, expect, it } from 'vitest';
import { useWizardStore } from './wizard-store';

const address = { line1: '1 Road', city: 'Hyderabad', pincode: '500001', phone: '+91 9999999999' };

describe('useWizardStore', () => {
  it('persists every change to sessionStorage', () => {
    useWizardStore.getState().setQuantity('shirts', 3);
    const saved = JSON.parse(window.sessionStorage.getItem('laundry-cart.wizard') ?? '{}') as {
      quantities: Record<string, number>;
    };
    expect(saved.quantities).toEqual({ shirts: 3 });
  });

  it('drops wash selections when a garment quantity goes back to zero', () => {
    const s = useWizardStore.getState();
    s.setQuantity('shirts', 1);
    s.toggleWash('shirts', 'wash');
    expect(useWizardStore.getState().washSelections).toEqual({ shirts: ['wash'] });
    s.setQuantity('shirts', 0);
    expect(useWizardStore.getState().washSelections).toEqual({});
  });

  it('refuses to jump past the furthest reachable step', () => {
    const s = useWizardStore.getState();
    s.goTo('review');
    expect(useWizardStore.getState().step).toBe('garments');
    s.setQuantity('shirts', 1);
    s.next();
    expect(useWizardStore.getState().step).toBe('wash-types');
    s.next();
    expect(useWizardStore.getState().step).toBe('wash-types');
    s.toggleWash('shirts', 'wash');
    s.next();
    expect(useWizardStore.getState().step).toBe('pickup');
    s.setPickup('hitech-city', address, '');
    s.next();
    expect(useWizardStore.getState().step).toBe('review');
    s.back();
    expect(useWizardStore.getState().step).toBe('pickup');
  });

  it('reset clears state and storage', () => {
    const s = useWizardStore.getState();
    s.setQuantity('shirts', 1);
    s.reset();
    expect(useWizardStore.getState().quantities).toEqual({});
    expect(window.sessionStorage.getItem('laundry-cart.wizard')).toBeNull();
  });
});
