'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Plan = 'free' | 'premium';

export interface PlanFeatures {
  // Hard-locked to premium
  coupleSpace: boolean;
  offlinePWA: boolean;
  bankNotifications: boolean;
  openFinance: boolean;
  // Soft limits (free has restricted version)
  unlimitedBudgetCategories: boolean;  // free: up to 4
  allScenarios: boolean;               // free: demissão + aumento only
  unlimitedAI: boolean;                // free: 10 msgs/day
  csvImport: boolean;                  // free: no
  supabaseSync: boolean;               // free: localStorage only
}

const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    coupleSpace: false,
    offlinePWA: false,
    bankNotifications: false,
    openFinance: false,
    unlimitedBudgetCategories: false,
    allScenarios: false,
    unlimitedAI: false,
    csvImport: false,
    supabaseSync: false,
  },
  premium: {
    coupleSpace: true,
    offlinePWA: true,
    bankNotifications: true,
    openFinance: true,
    unlimitedBudgetCategories: true,
    allScenarios: true,
    unlimitedAI: true,
    csvImport: true,
    supabaseSync: true,
  },
};

interface PlanStore {
  plan: Plan;
  activatedAt: string | null;
  expiresAt: string | null;
  // Daily AI usage
  aiMessagesToday: number;
  aiUsageDate: string;
  // Actions
  upgradeToPremium: () => void;
  downgradeToFree: () => void;
  features: () => PlanFeatures;
  isPremium: () => boolean;
  canSendAI: () => boolean;
  trackAIMessage: () => void;
  aiRemaining: () => number;
}

const FREE_AI_LIMIT = 10;

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plan: 'free',
      activatedAt: null,
      expiresAt: null,
      aiMessagesToday: 0,
      aiUsageDate: '',

      upgradeToPremium: () => {
        const now = new Date();
        const expires = new Date(now);
        expires.setMonth(expires.getMonth() + 1);
        set({
          plan: 'premium',
          activatedAt: now.toISOString(),
          expiresAt: expires.toISOString(),
        });
      },

      downgradeToFree: () => set({
        plan: 'free',
        activatedAt: null,
        expiresAt: null,
      }),

      features: () => PLAN_FEATURES[get().plan],

      isPremium: () => get().plan === 'premium',

      canSendAI: () => {
        if (get().plan === 'premium') return true;
        const today = new Date().toDateString();
        const { aiMessagesToday, aiUsageDate } = get();
        if (aiUsageDate !== today) return true;
        return aiMessagesToday < FREE_AI_LIMIT;
      },

      trackAIMessage: () => {
        const today = new Date().toDateString();
        const { aiUsageDate, aiMessagesToday } = get();
        if (aiUsageDate !== today) {
          set({ aiMessagesToday: 1, aiUsageDate: today });
        } else {
          set({ aiMessagesToday: aiMessagesToday + 1 });
        }
      },

      aiRemaining: () => {
        if (get().plan === 'premium') return Infinity;
        const today = new Date().toDateString();
        const { aiMessagesToday, aiUsageDate } = get();
        if (aiUsageDate !== today) return FREE_AI_LIMIT;
        return Math.max(0, FREE_AI_LIMIT - aiMessagesToday);
      },
    }),
    { name: 'lifeos-plan' }
  )
);
