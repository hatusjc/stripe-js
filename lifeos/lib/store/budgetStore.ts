'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;       // monthly limit in BRL
  color: string;
  icon: string;
  category: string;    // matches transaction category key
}

export interface BudgetAlert {
  id: string;
  categoryId: string;
  categoryName: string;
  threshold: number;   // 0.75 = 75%
  type: 'warning' | 'exceeded';
  month: string;       // 'YYYY-MM'
  triggeredAt: string;
  dismissed: boolean;
}

interface BudgetStore {
  budgets: BudgetCategory[];
  alerts: BudgetAlert[];
  addBudget: (b: Omit<BudgetCategory, 'id'>) => void;
  updateBudget: (id: string, data: Partial<BudgetCategory>) => void;
  removeBudget: (id: string) => void;
  triggerAlert: (a: Omit<BudgetAlert, 'id'>) => void;
  dismissAlert: (id: string) => void;
  getUsagePercent: (categoryId: string, spent: number) => number;
}

const DEFAULT_BUDGETS: BudgetCategory[] = [
  { id: 'b1', name: 'Moradia', limit: 3000, color: 'bg-blue-500', icon: '🏠', category: 'moradia' },
  { id: 'b2', name: 'Alimentação', limit: 1500, color: 'bg-green-500', icon: '🍽️', category: 'alimentacao' },
  { id: 'b3', name: 'Transporte', limit: 800, color: 'bg-yellow-500', icon: '🚗', category: 'transporte' },
  { id: 'b4', name: 'Lazer', limit: 600, color: 'bg-purple-500', icon: '🎉', category: 'lazer' },
  { id: 'b5', name: 'Saúde', limit: 500, color: 'bg-red-500', icon: '💊', category: 'saude' },
  { id: 'b6', name: 'Educação', limit: 400, color: 'bg-cyan-500', icon: '📚', category: 'educacao' },
];

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      budgets: DEFAULT_BUDGETS,
      alerts: [],

      addBudget: (b) => set((s) => ({
        budgets: [...s.budgets, { ...b, id: generateId() }],
      })),

      updateBudget: (id, data) => set((s) => ({
        budgets: s.budgets.map((b) => b.id === id ? { ...b, ...data } : b),
      })),

      removeBudget: (id) => set((s) => ({
        budgets: s.budgets.filter((b) => b.id !== id),
      })),

      triggerAlert: (a) => set((s) => ({
        alerts: [...s.alerts, { ...a, id: generateId() }],
      })),

      dismissAlert: (id) => set((s) => ({
        alerts: s.alerts.map((a) => a.id === id ? { ...a, dismissed: true } : a),
      })),

      getUsagePercent: (categoryId, spent) => {
        const budget = get().budgets.find((b) => b.id === categoryId);
        if (!budget || budget.limit === 0) return 0;
        return (spent / budget.limit) * 100;
      },
    }),
    { name: 'lifeos-budget' }
  )
);
