'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store/useAppStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useCoupleStore } from '@/lib/store/coupleStore';
import { useBankNotificationStore } from '@/lib/store/bankNotificationStore';
import { usePlanStore } from '@/lib/store/planStore';
import {
  LayoutDashboard, DollarSign, FolderKanban, Target, Shield,
  BookOpen, Users, Brain, HeartPulse, Zap, Building2,
  Bell, ChevronRight, Star, LogOut, X, Heart, Smartphone,
  PiggyBank, TrendingUp, CalendarCheck, Landmark, Crown,
} from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400', premium: false },
  { href: '/financas', icon: DollarSign, label: 'Finanças', color: 'text-emerald-400', premium: false },
  { href: '/orcamento', icon: PiggyBank, label: 'Orçamento', color: 'text-emerald-300', premium: false },
  { href: '/cenarios', icon: TrendingUp, label: 'Cenários "E se?"', color: 'text-teal-400', premium: false },
  { href: '/projetos', icon: FolderKanban, label: 'Projetos', color: 'text-purple-400', premium: false },
  { href: '/objetivos', icon: Target, label: 'Objetivos', color: 'text-orange-400', premium: false },
  { href: '/responsabilidades', icon: Shield, label: 'Responsabilidades', color: 'text-red-400', premium: false },
  { href: '/patrimonio', icon: Building2, label: 'Patrimônio', color: 'text-yellow-400', premium: false },
  { href: '/familia', icon: Users, label: 'Família', color: 'text-pink-400', premium: false },
  { href: '/saude', icon: HeartPulse, label: 'Saúde', color: 'text-green-400', premium: false },
  { href: '/conhecimento', icon: BookOpen, label: 'Conhecimento', color: 'text-cyan-400', premium: false },
  { href: '/decisoes', icon: Brain, label: 'Decisões', color: 'text-violet-400', premium: false },
  { href: '/ia', icon: Zap, label: 'LifeOS AI', color: 'text-amber-400', premium: false },
  { href: '/checkin', icon: CalendarCheck, label: 'Check-in Semanal', color: 'text-indigo-400', premium: false },
  { href: '/relatorio', icon: Bell, label: 'Relatório Semanal', color: 'text-slate-400', premium: false },
  { href: '/casal', icon: Heart, label: 'Casal', color: 'text-pink-400', premium: true },
  { href: '/notificacoes', icon: Smartphone, label: 'Notif. Bancárias', color: 'text-blue-400', premium: true },
  { href: '/openfinance', icon: Landmark, label: 'Open Finance', color: 'text-sky-400', premium: true },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { alerts, lifeScore } = useAppStore();
  const { user, logout } = useAuthStore();
  const { notifications: coupleNotifs } = useCoupleStore();
  const { pendingTransactions } = useBankNotificationStore();
  const { plan } = usePlanStore();
  const unreadAlerts = alerts.filter((a) => !a.read).length;
  const unreadCouple = coupleNotifs.filter((n) => !n.read).length;
  const pendingBankCount = pendingTransactions.length;

  const getBadge = (href: string) => {
    if (href === '/') return unreadAlerts > 0 ? unreadAlerts : null;
    if (href === '/casal') return unreadCouple > 0 ? unreadCouple : null;
    if (href === '/notificacoes') return pendingBankCount > 0 ? pendingBankCount : null;
    return null;
  };

  const content = (
    <aside className="h-full w-60 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">LifeOS</span>
            <p className="text-[10px] text-slate-500 -mt-0.5">Personal OS</p>
          </div>
        </div>
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Seja Premium CTA — top of menu */}
      {plan === 'free' && (
        <div className="px-3 pt-3">
          <Link
            href="/planos"
            onClick={onMobileClose}
            className="flex items-center gap-2.5 w-full px-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl transition-all group shadow-lg shadow-amber-500/20"
          >
            <Crown size={16} className="text-white shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">✨ Seja Premium</p>
              <p className="text-[10px] text-amber-100/80">Teste grátis · 15 dias · sem cartão</p>
            </div>
            <ChevronRight size={13} className="text-white/60 group-hover:text-white transition-colors" />
          </Link>
        </div>
      )}

      {/* Life Score */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="bg-slate-800/80 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Life Score</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-white">{lifeScore.total}</span>
              <span className="text-xs text-slate-500 mb-0.5">/100</span>
            </div>
          </div>
          <div className="w-12 h-12 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={lifeScore.total >= 80 ? '#10b981' : lifeScore.total >= 60 ? '#3b82f6' : lifeScore.total >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${lifeScore.total} ${100 - lifeScore.total}`}
                strokeLinecap="round"
              />
            </svg>
            <Star size={12} className="absolute inset-0 m-auto text-amber-400" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = item.premium && plan === 'free';
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group',
                isActive
                  ? 'bg-blue-600/20 text-white border border-blue-500/20'
                  : isLocked
                  ? 'text-slate-600 hover:text-slate-500 hover:bg-slate-800/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <item.icon size={16} className={isActive ? item.color : isLocked ? 'text-slate-700' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="flex-1 font-medium">{item.label}</span>
              {isLocked && <Crown size={11} className="text-amber-600/60 shrink-0" />}
              {!isLocked && (() => {
                const badge = getBadge(item.href);
                if (!badge) return null;
                const color = item.href === '/casal' ? 'bg-pink-500' : item.href === '/notificacoes' ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <span className={`w-5 h-5 ${color} rounded-full text-[10px] text-white flex items-center justify-center font-bold`}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                );
              })()}
              {isActive && !isLocked && <ChevronRight size={12} className="text-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Plan CTA — bottom */}
      {plan !== 'free' && (
        <div className="px-4 pb-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-lg">
            <Crown size={11} className="text-amber-400" />
            <span className="text-[10px] text-amber-400 font-semibold">PREMIUM ATIVO</span>
          </div>
        </div>
      )}

      {/* User + Logout */}
      <div className="px-3 py-3 border-t border-slate-800 space-y-1">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={15} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-60 z-40">
        {content}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <div className="relative w-60 h-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
