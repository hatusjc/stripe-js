'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, Account, FinancialGoal, Debt } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface FinanceState {
  transactions: Transaction[];
  accounts: Account[];
  goals: FinancialGoal[];
  debts: Debt[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  addAccount: (a: Omit<Account, 'id'>) => void;
  addDebt: (d: Omit<Debt, 'id'>) => void;
  removeDebt: (id: string) => void;
  addGoal: (g: Omit<FinancialGoal, 'id'>) => void;
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getNetWorthFromAccounts: () => number;
}

const defaultAccounts: Account[] = [
  { id: 'acc1', name: 'Conta Corrente', type: 'corrente', balance: 12450.0, institution: 'Nubank' },
  { id: 'acc2', name: 'Poupança', type: 'poupanca', balance: 35200.0, institution: 'Itaú' },
  { id: 'acc3', name: 'Investimentos', type: 'investimento', balance: 87600.0, institution: 'XP Investimentos' },
  { id: 'acc4', name: 'Cartão de Crédito', type: 'cartao', balance: -4320.0, institution: 'Nubank' },
];

const thisMonth = new Date().toISOString().slice(0, 7);

const defaultTransactions: Transaction[] = [
  { id: 't1', type: 'receita', category: 'Salário', description: 'Salário mensal', amount: 15000, date: `${thisMonth}-05`, recurring: true },
  { id: 't2', type: 'receita', category: 'Freelance', description: 'Consultoria projeto X', amount: 3500, date: `${thisMonth}-10` },
  { id: 't3', type: 'despesa', category: 'Moradia', description: 'Aluguel', amount: 3200, date: `${thisMonth}-05`, recurring: true },
  { id: 't4', type: 'despesa', category: 'Alimentação', description: 'Supermercado', amount: 850, date: `${thisMonth}-08` },
  { id: 't5', type: 'despesa', category: 'Transporte', description: 'Combustível', amount: 380, date: `${thisMonth}-12` },
  { id: 't6', type: 'despesa', category: 'Educação', description: 'Curso online', amount: 297, date: `${thisMonth}-03`, recurring: true },
  { id: 't7', type: 'despesa', category: 'Saúde', description: 'Plano de saúde', amount: 620, date: `${thisMonth}-01`, recurring: true },
  { id: 't8', type: 'despesa', category: 'Lazer', description: 'Streaming e assinaturas', amount: 145, date: `${thisMonth}-15`, recurring: true },
  { id: 't9', type: 'receita', category: 'Dividendos', description: 'Dividendos ações', amount: 1200, date: `${thisMonth}-20` },
  { id: 't10', type: 'despesa', category: 'Investimentos', description: 'Aporte mensal', amount: 3000, date: `${thisMonth}-05`, recurring: true },
];

const defaultDebts: Debt[] = [
  { id: 'd1', creditor: 'Financiamento Veículo', totalAmount: 48000, remainingAmount: 28000, monthlyPayment: 1200, interestRate: 1.2, dueDate: '2028-06-15' },
  { id: 'd2', creditor: 'Cartão Visa', totalAmount: 5200, remainingAmount: 5200, monthlyPayment: 1500, interestRate: 3.5, dueDate: '2025-12-01' },
];

const defaultGoals: FinancialGoal[] = [
  { id: 'fg1', title: 'Fundo de Emergência', targetAmount: 90000, currentAmount: 47650, deadline: '2025-12-31', category: 'Reserva' },
  { id: 'fg2', title: 'Entrada do Apartamento', targetAmount: 150000, currentAmount: 87600, deadline: '2026-06-01', category: 'Imóvel' },
  { id: 'fg3', title: 'Aposentadoria', targetAmount: 2000000, currentAmount: 87600, deadline: '2045-01-01', category: 'Aposentadoria' },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: defaultTransactions,
      accounts: defaultAccounts,
      goals: defaultGoals,
      debts: defaultDebts,
      addTransaction: (t) => set((s) => ({ transactions: [{ ...t, id: generateId() }, ...s.transactions] })),
      removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      addAccount: (a) => set((s) => ({ accounts: [...s.accounts, { ...a, id: generateId() }] })),
      addDebt: (d) => set((s) => ({ debts: [...s.debts, { ...d, id: generateId() }] })),
      removeDebt: (id) => set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),
      addGoal: (g) => set((s) => ({ goals: [...s.goals, { ...g, id: generateId() }] })),
      getTotalBalance: () => get().accounts.reduce((sum, a) => sum + a.balance, 0),
      getMonthlyIncome: () =>
        get()
          .transactions.filter((t) => t.type === 'receita' && t.date.startsWith(thisMonth))
          .reduce((sum, t) => sum + t.amount, 0),
      getMonthlyExpenses: () =>
        get()
          .transactions.filter((t) => t.type === 'despesa' && t.date.startsWith(thisMonth))
          .reduce((sum, t) => sum + t.amount, 0),
      getNetWorthFromAccounts: () => get().accounts.reduce((sum, a) => sum + a.balance, 0),
    }),
    { name: 'lifeos-finance' }
  )
);
