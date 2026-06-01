'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Plan = 'free' | 'premium';

export interface PlanFeatures {
  coupleSpace: boolean;
  offlinePWA: boolean;
  bankNotifications: boolean;
  openFinance: boolean;
  unlimitedBudgetCategories: boolean;
  allScenarios: boolean;
  unlimitedAI: boolean;
  aiCrud: boolean;
  csvImport: boolean;
  supabaseSync: boolean;
  pdfExport: boolean;
  pushNotifications: boolean;
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
    aiCrud: false,
    csvImport: false,
    supabaseSync: false,
    pdfExport: false,
    pushNotifications: false,
  },
  premium: {
    coupleSpace: true,
    offlinePWA: true,
    bankNotifications: true,
    openFinance: true,
    unlimitedBudgetCategories: true,
    allScenarios: true,
    unlimitedAI: true,
    aiCrud: true,
    csvImport: true,
    supabaseSync: true,
    pdfExport: true,
    pushNotifications: true,
  },
};

const TRIAL_DAYS = 15;

interface PlanStore {
  plan: Plan;
  activatedAt: string | null;
  expiresAt: string | null;
  isTrial: boolean;
  // Daily AI usage
  aiMessagesToday: number;
  aiUsageDate: string;
  // Actions
  upgradeToPremium: () => void;
  startTrial: () => void;
  downgradeToFree: () => void;
  checkExpiry: () => void;
  features: () => PlanFeatures;
  isPremium: () => boolean;
  isTrialing: () => boolean;
  daysLeftInTrial: () => number;
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
      isTrial: false,
      aiMessagesToday: 0,
      aiUsageDate: '',

      upgradeToPremium: () => {
        const now = new Date();
        const expires = new Date(now);
        expires.setMonth(expires.getMonth() + 1);
        set({ plan: 'premium', activatedAt: now.toISOString(), expiresAt: expires.toISOString(), isTrial: false });
      },

      startTrial: () => {
        const now = new Date();
        const expires = new Date(now);
        expires.setDate(expires.getDate() + TRIAL_DAYS);
        set({ plan: 'premium', activatedAt: now.toISOString(), expiresAt: expires.toISOString(), isTrial: true });
      },

      downgradeToFree: () => set({ plan: 'free', activatedAt: null, expiresAt: null, isTrial: false }),

      checkExpiry: () => {
        const { expiresAt, plan } = get();
        if (plan === 'premium' && expiresAt && new Date(expiresAt) < new Date()) {
          set({ plan: 'free', activatedAt: null, expiresAt: null, isTrial: false });
        }
      },

      isTrialing: () => get().isTrial && get().plan === 'premium',

      daysLeftInTrial: () => {
        const { expiresAt, isTrial } = get();
        if (!isTrial || !expiresAt) return 0;
        const diff = new Date(expiresAt).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      },

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
