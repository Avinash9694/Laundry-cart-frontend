import { create } from 'zustand';

export type ToastTone = 'info' | 'success' | 'error';

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => number;
  dismiss: (id: number) => void;
}

let nextId = 1;
const TTL_MS = 5000;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, TTL_MS);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore
      .getState()
      .push(description ? { tone: 'success', title, description } : { tone: 'success', title }),
  error: (title: string, description?: string) =>
    useToastStore
      .getState()
      .push(description ? { tone: 'error', title, description } : { tone: 'error', title }),
  info: (title: string, description?: string) =>
    useToastStore
      .getState()
      .push(description ? { tone: 'info', title, description } : { tone: 'info', title }),
};
