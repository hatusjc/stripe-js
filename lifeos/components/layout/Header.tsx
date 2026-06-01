'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Plus, Menu } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';

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
  const page = PAGE_TITLES[pathname] ?? { title: 'LifeOS', subtitle: '' };
  const unread = alerts.filter((a) => !a.read).length;

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button onClick={onMenuClick} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-white truncate">{page.title}</h1>
        <p className="text-xs text-slate-500 hidden sm:block truncate">{today}</p>
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
          <span className="hidden sm:block">Novo</span>
        </button>
      </div>
    </header>
  );
}
