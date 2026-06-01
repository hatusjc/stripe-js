'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BankNotificationRaw, PendingTransaction } from '@/lib/types';
import { generateId } from '@/lib/utils';

// Regex patterns for Brazilian bank SMS/push notifications
const BANK_PATTERNS = [
  // Nubank: "Compra no débito de R$ 150,00 em SUPERMERCADO aprovada"
  { re: /compra.*?r\$\s*([\d.,]+).*?em\s+(.+?)(?:\s+aprovada|\s+realizada|$)/i, type: 'despesa' as const, bank: 'Nubank' },
  // Itaú: "Débito de R$ 89,90 - FARMACIA"
  { re: /débit[oa].*?r\$\s*([\d.,]+)[\s\-]+(.+)/i, type: 'despesa' as const, bank: 'Itaú' },
  // Generic: "Pagamento de R$ 200,00 para CONTA LUZ"
  { re: /pagamento.*?r\$\s*([\d.,]+).*?para\s+(.+)/i, type: 'despesa' as const, bank: 'Banco' },
  // PIX out: "Pix enviado R$ 500,00 para João"
  { re: /pix\s+(?:enviado|realizado).*?r\$\s*([\d.,]+).*?para\s+(.+)/i, type: 'despesa' as const, bank: 'Pix' },
  // PIX in: "Pix recebido R$ 1.200,00 de Maria"
  { re: /pix\s+recebido.*?r\$\s*([\d.,]+).*?de\s+(.+)/i, type: 'receita' as const, bank: 'Pix' },
  // Transfer in: "Transferência recebida R$ 3.000,00"
  { re: /transfer[eê]ncia\s+recebida.*?r\$\s*([\d.,]+)/i, type: 'receita' as const, bank: 'Banco' },
  // Transfer out: "Transferência de R$ 1.000,00 realizada"
  { re: /transfer[eê]ncia.*?r\$\s*([\d.,]+).*?realizada/i, type: 'despesa' as const, bank: 'Banco' },
  // Credit: "Crédito de R$ 5.000,00 - Salário"
  { re: /cr[eé]dito.*?r\$\s*([\d.,]+)[\s\-]+(.+)/i, type: 'receita' as const, bank: 'Banco' },
  // Generic amount detection
  { re: /r\$\s*([\d.,]+)/i, type: 'despesa' as const, bank: 'Banco' },
];

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.')) || 0;
}

function parseBankText(text: string): Partial<BankNotificationRaw> {
  for (const pattern of BANK_PATTERNS) {
    const m = text.match(pattern.re);
    if (m) {
      return {
        parsedAmount: parseAmount(m[1]),
        parsedType: pattern.type,
        parsedDescription: m[2]?.trim().slice(0, 60) || 'Transação bancária',
        parsedDate: new Date().toISOString().slice(0, 10),
        source: pattern.bank,
      };
    }
  }
  return { parsedDescription: 'Transação bancária', parsedDate: new Date().toISOString().slice(0, 10) };
}

interface BankNotificationState {
  rawNotifications: BankNotificationRaw[];
  pendingTransactions: PendingTransaction[];
  permissionGranted: boolean;
  setPermission: (v: boolean) => void;
  addRawNotification: (text: string, source?: string) => BankNotificationRaw;
  approveTransaction: (pendingId: string, extra?: { photo?: string; notes?: string; category?: string }) => PendingTransaction;
  rejectTransaction: (pendingId: string) => void;
  dismissNotification: (id: string) => void;
  clearApproved: () => void;
}

export const useBankNotificationStore = create<BankNotificationState>()(
  persist(
    (set, get) => ({
      rawNotifications: [],
      pendingTransactions: [],
      permissionGranted: false,

      setPermission: (v) => set({ permissionGranted: v }),

      addRawNotification: (text, source = 'Banco') => {
        const parsed = parseBankText(text);
        const raw: BankNotificationRaw = {
          id: generateId(),
          source: parsed.source ?? source,
          rawText: text,
          parsedAmount: parsed.parsedAmount,
          parsedType: parsed.parsedType,
          parsedDescription: parsed.parsedDescription,
          parsedDate: parsed.parsedDate,
          receivedAt: new Date().toISOString(),
          status: 'pending',
        };

        const pending: PendingTransaction = {
          id: generateId(),
          bankNotificationId: raw.id,
          type: raw.parsedType ?? 'despesa',
          description: raw.parsedDescription ?? 'Transação',
          amount: raw.parsedAmount ?? 0,
          date: raw.parsedDate ?? new Date().toISOString().slice(0, 10),
          category: raw.parsedType === 'receita' ? 'Receita' : 'Outros',
          source: raw.source,
        };

        set((s) => ({
          rawNotifications: [raw, ...s.rawNotifications].slice(0, 100),
          pendingTransactions: [pending, ...s.pendingTransactions],
        }));
        return raw;
      },

      approveTransaction: (pendingId, extra = {}) => {
        const pending = get().pendingTransactions.find((p) => p.id === pendingId)!;
        const approved = { ...pending, ...extra };
        set((s) => ({
          pendingTransactions: s.pendingTransactions.filter((p) => p.id !== pendingId),
          rawNotifications: s.rawNotifications.map((n) =>
            n.id === approved.bankNotificationId ? { ...n, status: 'approved' as const } : n
          ),
        }));
        return approved;
      },

      rejectTransaction: (pendingId) => {
        const pending = get().pendingTransactions.find((p) => p.id === pendingId);
        set((s) => ({
          pendingTransactions: s.pendingTransactions.filter((p) => p.id !== pendingId),
          rawNotifications: s.rawNotifications.map((n) =>
            n.id === pending?.bankNotificationId ? { ...n, status: 'rejected' as const } : n
          ),
        }));
      },

      dismissNotification: (id) => set((s) => ({
        rawNotifications: s.rawNotifications.filter((n) => n.id !== id),
      })),

      clearApproved: () => set((s) => ({
        rawNotifications: s.rawNotifications.filter((n) => n.status === 'pending'),
      })),
    }),
    { name: 'lifeos-bank-notifications' }
  )
);
