'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  onboardingComplete: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  completeOnboarding: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 800));
        if (!email || !password) {
          set({ isLoading: false });
          return { success: false, error: 'Preencha todos os campos' };
        }
        const stored = localStorage.getItem(`lifeos-user-${email}`);
        if (!stored) {
          set({ isLoading: false });
          return { success: false, error: 'Email não cadastrado' };
        }
        const data = JSON.parse(stored);
        if (data.password !== password) {
          set({ isLoading: false });
          return { success: false, error: 'Senha incorreta' };
        }
        set({ user: { id: data.id, name: data.name, email: data.email, onboardingComplete: data.onboardingComplete }, isLoading: false });
        return { success: true };
      },
      register: async (name, email, password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 600));
        const existing = localStorage.getItem(`lifeos-user-${email}`);
        if (existing) {
          set({ isLoading: false });
          return { success: false, error: 'Este email já está cadastrado' };
        }
        const user: User = { id: `u-${Date.now()}`, name, email, onboardingComplete: false };
        localStorage.setItem(`lifeos-user-${email}`, JSON.stringify({ ...user, password }));
        set({ user, isLoading: false });
        return { success: true };
      },
      logout: () => set({ user: null }),
      completeOnboarding: (data) =>
        set((s) => {
          if (!s.user) return s;
          const updated = { ...s.user, ...data, onboardingComplete: true };
          const stored = localStorage.getItem(`lifeos-user-${s.user.email}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem(`lifeos-user-${s.user.email}`, JSON.stringify({ ...parsed, ...data, onboardingComplete: true }));
          }
          return { user: updated };
        }),
    }),
    { name: 'lifeos-auth' }
  )
);
