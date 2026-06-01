'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Plus, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral da sua vida' },
  '/financas': { title: 'Finanças', subtitle: 'Gestão financeira completa' },
  '/projetos': { title: 'Projetos', subtitle: 'Gerenciamento de projetos' },
  '/objetivos': { title: 'Objetivos', subtitle: 'Suas metas e resultados' },
  '/responsabilidades': { title: 'Responsabilidades', subtitle: 'Seus compromissos permanentes' },
  '/patrimonio': { title: 'Patrimônio', subtitle: 'Seus ativos e investimentos' },
  '/familia': { title: 'Família', subtitle: 'Agenda e organização familiar' },
  '/saude': { title: 'Saúde', subtitle: 'Saúde física e mental' },
  '/conhecimento': { title: 'Conhecimento', subtitle: 'Seu segundo cérebro' },
  '/decisoes': { title: 'Decisões', subtitle: 'Histórico e análise de decisões' },
  '/ia': { title: 'LifeOS AI', subtitle: 'Seu assistente inteligente' },
  '/relatorio': { title: 'Relatório Semanal', subtitle: 'Resumo executivo da semana' },
  '/casal': { title: 'Casal', subtitle: 'Espaço compartilhado com seu cônjuge' },
  '/notificacoes': { title: 'Notificações Bancárias', subtitle: 'Captura automática de transações' },
  '/orcamento': { title: 'Orçamento', subtitle: 'Controle de gastos por categoria' },
  '/cenarios': { title: 'Cenários "E se?"', subtitle: 'Simulador de decisões financeiras' },
  '/checkin': { title: 'Check-in Semanal', subtitle: 'Reflexão e atualização do Life Score' },
  '/openfinance': { title: 'Open Finance', subtitle: 'Conexão com instituições bancárias' },
  '/planos': { title: 'Planos', subtitle: 'Gratuito e Premium' },
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { alerts } = useAppStore();
  const { user } = useAuthStore();
  const page = PAGE_TITLES[pathname] ?? { title: 'LifeOS', subtitle: '' };
  const unread = alerts.filter((a) => !a.read).length;
  const isDashboard = pathname === '/';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-30">

      {/* Mobile: Dashboard greeting header */}
      {isDashboard && (
        <div className="lg:hidden px-5 pt-8 pb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[14px] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
              {user ? (
                <span className="text-white text-base font-bold">{user.name.charAt(0).toUpperCase()}</span>
              ) : (
                <Zap size={18} className="text-white" />
              )}
            </div>
            <div>
              <h1 className="text-[28px] font-bold text-white leading-tight">{greeting} 👋</h1>
              <p className="text-[15px] text-white/65 mt-0.5">Patrimônio cresceu 3,2% este mês</p>
            </div>
          </div>
          <button className="relative mt-1 p-2.5 rounded-[14px] bg-slate-800 hover:bg-slate-700 transition-all shrink-0">
            <Bell size={18} className="text-slate-400" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Mobile: Other pages compact header */}
      {!isDashboard && (
        <div className="lg:hidden h-14 flex items-center px-5 gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[10px] flex items-center justify-center shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <h1 className="text-base font-semibold text-white flex-1 truncate">{page.title}</h1>
          <button className="relative p-2 rounded-[10px] bg-slate-800 hover:bg-slate-700 transition-all">
            <Bell size={16} className="text-slate-400" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Desktop header */}
      <div className="hidden lg:flex h-14 items-center px-6 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white truncate">{page.title}</h1>
          <p className="text-xs text-slate-500 truncate">{page.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:flex items-center">
            <Search size={14} className="absolute left-3 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-500 w-48"
            />
          </div>
          <button className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all">
            <Bell size={16} className="text-slate-400" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-medium transition-all">
            <Plus size={14} />
            <span>Novo</span>
          </button>
        </div>
      </div>

    </header>
  );
}
