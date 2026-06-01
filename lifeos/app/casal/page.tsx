'use client';

import { PremiumGate } from '@/components/plan/PremiumGate';
import { useState, useEffect } from 'react';
import { useCoupleStore, usePollPartnerNotifications } from '@/lib/store/coupleStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { CoupleSettings } from '@/components/couple/CoupleSettings';
import { CoupleNotificationPanel } from '@/components/couple/CoupleNotificationPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, daysUntil, getDaysLabel, cn } from '@/lib/utils';
import {
  Heart, DollarSign, FolderKanban, Calendar, Target,
  Shield, TrendingUp, TrendingDown, Lock, Globe
} from 'lucide-react';

function CasalPageContent() {
  const { user } = useAuthStore();
  const { link, notifications } = useCoupleStore();
  const { getTotalBalance, getMonthlyIncome, getMonthlyExpenses, transactions } = useFinanceStore();
  const { goals, responsibilities, familyEvents } = useAppStore();
  const { projects } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'compartilhado' | 'configuracoes' | 'notificacoes'>('compartilhado');

  useEffect(() => {
    usePollPartnerNotifications();
  }, []);

  const income = getMonthlyIncome();
  const expenses = getMonthlyExpenses();
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const sharedAreas = link?.sharedAreas ?? [];
  const upcomingEvents = familyEvents
    .filter((e) => daysUntil(e.date) >= 0 && daysUntil(e.date) <= 30)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
    .slice(0, 5);

  const sharedProjects = projects.filter((p) =>
    sharedAreas.includes(p.area as any) || p.area === 'familia'
  ).slice(0, 4);

  const sharedGoals = goals.filter((g) =>
    sharedAreas.includes(g.area as any)
  ).slice(0, 4);

  const tabs = [
    { id: 'compartilhado', label: 'Compartilhado', icon: Globe },
    { id: 'notificacoes', label: 'Notificações', icon: Heart, badge: unreadNotifs },
    { id: 'configuracoes', label: 'Configurações', icon: Shield },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart size={18} className="text-pink-400" />
            Espaço do Casal
          </h2>
          <p className="text-sm text-slate-400">
            {link ? `Conectado · Áreas compartilhadas: ${sharedAreas.length}` : 'Conecte com seu cônjuge para compartilhar dados'}
          </p>
        </div>
        {link && (
          <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 rounded-full px-4 py-1.5">
            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
            <span className="text-xs text-pink-300 font-medium">Casal vinculado</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id
                ? 'bg-pink-600/80 text-white'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <tab.icon size={13} />
            {tab.label}
            {'badge' in tab && tab.badge > 0 && (
              <span className="w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Shared view */}
      {activeTab === 'compartilhado' && (
        <div className="space-y-6">
          {!link ? (
            <div className="text-center py-12">
              <Lock size={40} className="mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">Configure a conexão com seu cônjuge na aba Configurações</p>
            </div>
          ) : (
            <>
              {/* Financial summary (if shared) */}
              {sharedAreas.includes('financas') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-400" />
                      Resumo Financeiro Compartilhado
                      <Badge variant="success">Compartilhado</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-1">Saldo Total</p>
                        <p className="text-lg font-bold text-emerald-400">{formatCurrency(getTotalBalance())}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-1">Receita Mensal</p>
                        <p className="text-lg font-bold text-blue-400">{formatCurrency(income)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-1">Despesas</p>
                        <p className="text-lg font-bold text-rose-400">{formatCurrency(expenses)}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <p className="text-xs font-medium text-slate-400 mb-2">Últimas transações</p>
                      {transactions.slice(0, 4).map((t) => (
                        <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0">
                          <div className="flex items-center gap-2">
                            {t.type === 'receita'
                              ? <TrendingUp size={12} className="text-emerald-400" />
                              : <TrendingDown size={12} className="text-rose-400" />}
                            <span className="text-xs text-slate-300">{t.description}</span>
                            {t.addedBy && t.addedBy !== user?.id && (
                              <Badge variant="ghost">parceiro(a)</Badge>
                            )}
                          </div>
                          <span className={cn('text-xs font-semibold', t.type === 'receita' ? 'text-emerald-400' : 'text-rose-400')}>
                            {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Family events */}
              {sharedAreas.includes('familia') && upcomingEvents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar size={14} className="text-pink-400" />
                      Próximos Eventos da Família
                      <Badge variant="ghost">Compartilhado</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {upcomingEvents.map((ev) => {
                      const d = daysUntil(ev.date);
                      return (
                        <div key={ev.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                          <div>
                            <p className="text-sm text-white font-medium">{ev.title}</p>
                            {ev.person && <p className="text-xs text-slate-400">{ev.person}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-300">{formatDate(ev.date)}</p>
                            <p className={cn('text-xs', d <= 3 ? 'text-amber-400' : 'text-slate-500')}>{getDaysLabel(d)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Shared projects */}
              {sharedAreas.includes('projetos') && sharedProjects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban size={14} className="text-purple-400" />
                      Projetos Compartilhados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    {sharedProjects.map((p) => (
                      <div key={p.id} className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-white truncate">{p.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{p.status}</p>
                        <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5">
                          <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{p.progress}%</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Shared goals */}
              {sharedAreas.includes('objetivos') && sharedGoals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target size={14} className="text-orange-400" />
                      Objetivos Compartilhados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sharedGoals.map((g) => (
                      <div key={g.id}>
                        <div className="flex justify-between mb-1.5">
                          <p className="text-xs text-slate-300">{g.title}</p>
                          <p className="text-xs font-bold text-orange-400">{g.progress}%</p>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                          <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${g.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notificacoes' && (
        <Card>
          <CardContent className="pt-5">
            <CoupleNotificationPanel />
          </CardContent>
        </Card>
      )}

      {/* Settings tab */}
      {activeTab === 'configuracoes' && (
        <Card>
          <CardContent className="pt-5">
            <CoupleSettings />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CasalPage() {
  return (
    <PremiumGate
      feature="Espaço do Casal"
      description="Crie espaços privados e compartilhados com seu cônjuge. Receba notificações em tempo real quando qualquer dado compartilhado for modificado."
    >
      <CasalPageContent />
    </PremiumGate>
  );
}
