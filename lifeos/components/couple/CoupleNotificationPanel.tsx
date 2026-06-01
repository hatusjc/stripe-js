'use client';

import { useEffect } from 'react';
import { useCoupleStore, usePollPartnerNotifications } from '@/lib/store/coupleStore';
import { cn, AREA_LABELS } from '@/lib/utils';
import { Heart, Bell, Check, DollarSign, Users, FolderKanban, Target, Shield, Building2 } from 'lucide-react';

const AREA_ICONS: Record<string, React.ReactNode> = {
  financas: <DollarSign size={13} className="text-emerald-400" />,
  familia: <Users size={13} className="text-pink-400" />,
  projetos: <FolderKanban size={13} className="text-purple-400" />,
  objetivos: <Target size={13} className="text-orange-400" />,
  patrimonio: <Building2 size={13} className="text-yellow-400" />,
  responsabilidades: <Shield size={13} className="text-red-400" />,
};

const ACTION_LABELS: Record<string, string> = {
  add: 'adicionou',
  edit: 'editou',
  delete: 'removeu',
};

export function CoupleNotificationPanel() {
  const { link, notifications, markRead, markAllRead, getUnreadCount } = useCoupleStore();

  // Poll for new partner notifications whenever component mounts
  useEffect(() => {
    usePollPartnerNotifications();
    const interval = setInterval(usePollPartnerNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!link) return null;

  const unread = getUnreadCount();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Heart size={14} className="text-pink-400" />
          Notificações do Casal
          {unread > 0 && (
            <span className="w-5 h-5 bg-pink-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </h4>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
            Marcar todas como lidas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Bell size={24} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma notificação ainda</p>
          <p className="text-xs mt-1">As mudanças do seu cônjuge aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                !notif.read
                  ? 'bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/15'
                  : 'bg-slate-800/40 border-slate-800 opacity-60'
              )}
            >
              <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                {AREA_ICONS[notif.area] ?? <Bell size={13} className="text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-white">{notif.fromName}</span>{' '}
                  {ACTION_LABELS[notif.action] ?? notif.action}{' '}
                  <span className="text-pink-300">{notif.entityTitle}</span>{' '}
                  em <span className="text-slate-200">{AREA_LABELS[notif.area] ?? notif.area}</span>
                </p>
                {notif.details && <p className="text-[11px] text-slate-500 mt-0.5">{notif.details}</p>}
                <p className="text-[10px] text-slate-600 mt-1">
                  {new Date(notif.createdAt).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </p>
              </div>
              {!notif.read && <div className="w-2 h-2 bg-pink-400 rounded-full shrink-0 mt-1" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
