'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export interface CheckinAnswer {
  questionId: string;
  score: number;   // 1-5
  note?: string;
}

export interface CheckinEntry {
  id: string;
  weekLabel: string;   // 'Semana de DD/MM/YYYY'
  weekStart: string;   // ISO date of Monday
  answers: CheckinAnswer[];
  lifeScoreSnapshot: number;
  completedAt: string;
  highlights?: string;
  challenges?: string;
  intention?: string;
}

export interface CheckinQuestion {
  id: string;
  area: string;
  question: string;
  icon: string;
}

interface CheckinStore {
  history: CheckinEntry[];
  addEntry: (e: Omit<CheckinEntry, 'id'>) => void;
  getLastEntry: () => CheckinEntry | null;
  getWeekStart: () => string;
  hasCheckedInThisWeek: () => boolean;
}

export const CHECKIN_QUESTIONS: CheckinQuestion[] = [
  { id: 'q1', area: 'financas', question: 'Como está sua situação financeira esta semana?', icon: '💰' },
  { id: 'q2', area: 'saude', question: 'Como foi sua saúde física e energia?', icon: '💪' },
  { id: 'q3', area: 'mental', question: 'Como está sua saúde mental e equilíbrio emocional?', icon: '🧘' },
  { id: 'q4', area: 'familia', question: 'Como foi a qualidade do tempo com família?', icon: '👨‍👩‍👧‍👦' },
  { id: 'q5', area: 'projetos', question: 'Quanto avançou nos seus projetos e objetivos?', icon: '🎯' },
  { id: 'q6', area: 'conhecimento', question: 'Quanto aprendeu ou se desenvolveu esta semana?', icon: '📚' },
  { id: 'q7', area: 'geral', question: 'Qual seu nível geral de satisfação com a semana?', icon: '⭐' },
];

function getMondayOfCurrentWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export const useCheckinStore = create<CheckinStore>()(
  persist(
    (set, get) => ({
      history: [],

      addEntry: (e) => set((s) => ({
        history: [...s.history, { ...e, id: generateId() }],
      })),

      getLastEntry: () => {
        const h = get().history;
        return h.length > 0 ? h[h.length - 1] : null;
      },

      getWeekStart: getMondayOfCurrentWeek,

      hasCheckedInThisWeek: () => {
        const weekStart = getMondayOfCurrentWeek();
        return get().history.some((e) => e.weekStart === weekStart);
      },
    }),
    { name: 'lifeos-checkin' }
  )
);
