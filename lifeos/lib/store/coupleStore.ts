'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoupleLink, CoupleNotification, LifeArea } from '@/lib/types';
import { generateId } from '@/lib/utils';

const DEFAULT_SHARED_AREAS: LifeArea[] = ['financas', 'familia', 'projetos', 'objetivos', 'patrimonio', 'responsabilidades'];

interface CoupleState {
  link: CoupleLink | null;
  inviteCode: string;
  notifications: CoupleNotification[];
  // Actions
  generateInviteCode: (myUserId: string) => string;
  acceptInvite: (code: string, myUserId: string, myName: string, myEmail: string) => { success: boolean; error?: string };
  disconnect: () => void;
  toggleSharedArea: (area: LifeArea) => void;
  pushCoupleNotification: (n: Omit<CoupleNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  getUnreadCount: () => number;
}

// Shared storage key between both users (simulates backend sync via localStorage)
function sharedKey(code: string) { return `lifeos-couple-shared-${code}`; }
function notifKey(userId: string) { return `lifeos-couple-notifs-${userId}`; }

export const useCoupleStore = create<CoupleState>()(
  persist(
    (set, get) => ({
      link: null,
      inviteCode: '',
      notifications: [],

      generateInviteCode: (myUserId) => {
        const code = `LIFEOS-${myUserId.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        // Store invite in shared slot so partner can find it
        localStorage.setItem(`lifeos-invite-${code}`, JSON.stringify({ code, creatorId: myUserId, createdAt: new Date().toISOString() }));
        set({ inviteCode: code });
        return code;
      },

      acceptInvite: (code, myUserId, myName, myEmail) => {
        const raw = localStorage.getItem(`lifeos-invite-${code}`);
        if (!raw) return { success: false, error: 'Código inválido ou expirado.' };
        const invite = JSON.parse(raw);
        if (invite.creatorId === myUserId) return { success: false, error: 'Você não pode usar seu próprio código.' };

        // Write shared link data so creator can also read it
        const linkData = { partnerId: myUserId, partnerName: myName, partnerEmail: myEmail, linkedAt: new Date().toISOString() };
        localStorage.setItem(sharedKey(code), JSON.stringify(linkData));

        const coupleLink: CoupleLink = {
          myUserId,
          partnerId: invite.creatorId,
          partnerName: 'Cônjuge', // will be enriched when partner reads
          partnerEmail: '',
          linkedAt: new Date().toISOString(),
          sharedAreas: DEFAULT_SHARED_AREAS,
        };
        set({ link: coupleLink });
        return { success: true };
      },

      disconnect: () => {
        const { link, inviteCode } = get();
        if (inviteCode) localStorage.removeItem(`lifeos-invite-${inviteCode}`);
        if (inviteCode) localStorage.removeItem(sharedKey(inviteCode));
        set({ link: null, inviteCode: '', notifications: [] });
      },

      toggleSharedArea: (area) => set((s) => {
        if (!s.link) return s;
        const areas = s.link.sharedAreas.includes(area)
          ? s.link.sharedAreas.filter((a) => a !== area)
          : [...s.link.sharedAreas, area];
        return { link: { ...s.link, sharedAreas: areas } };
      }),

      pushCoupleNotification: (n) => {
        const notif: CoupleNotification = { ...n, id: generateId(), createdAt: new Date().toISOString(), read: false };
        // Write to partner's notification queue in localStorage
        const key = notifKey(n.toUserId);
        const existing: CoupleNotification[] = JSON.parse(localStorage.getItem(key) ?? '[]');
        localStorage.setItem(key, JSON.stringify([notif, ...existing].slice(0, 50)));
        // Also update local if I'm the target (self-notification test)
        set((s) => ({ notifications: [notif, ...s.notifications].slice(0, 50) }));
      },

      // Poll partner notifications from localStorage (called on page focus)
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'lifeos-couple' }
  )
);

// Hook to poll partner notifications on page focus
export function usePollPartnerNotifications() {
  const { link, notifications } = useCoupleStore();

  if (typeof window === 'undefined' || !link) return;

  const key = notifKey(link.myUserId);
  const stored: CoupleNotification[] = JSON.parse(localStorage.getItem(key) ?? '[]');
  const existingIds = new Set(notifications.map((n) => n.id));
  const newOnes = stored.filter((n) => !existingIds.has(n.id));

  if (newOnes.length > 0) {
    useCoupleStore.setState((s) => ({
      notifications: [...newOnes, ...s.notifications].slice(0, 50),
    }));
    localStorage.removeItem(key);
  }
}
