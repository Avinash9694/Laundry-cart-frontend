import { create } from 'zustand';
import type { User } from '@/api/types';
import { readJson, removeKey, safeLocalStorage, writeJson } from '@/lib/storage';

const KEY = 'laundry-cart.session';

interface Session {
  token: string;
  user: User;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (session: Session) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

const initial = readJson<Session | null>(safeLocalStorage(), KEY, null);

export const useAuthStore = create<AuthState>((set) => ({
  token: initial?.token ?? null,
  user: initial?.user ?? null,
  setSession: ({ token, user }) => {
    writeJson(safeLocalStorage(), KEY, { token, user });
    set({ token, user });
  },
  setUser: (user) =>
    set((state) => {
      if (state.token) writeJson(safeLocalStorage(), KEY, { token: state.token, user });
      return { user };
    }),
  clear: () => {
    removeKey(safeLocalStorage(), KEY);
    set({ token: null, user: null });
  },
}));

export const selectIsAuthenticated = (s: AuthState) => s.token !== null;
