'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, DollarSign, FolderKanban, Zap, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/financas', icon: DollarSign, label: 'Finanças' },
  { href: '/projetos', icon: FolderKanban, label: 'Projetos' },
  { href: '/ia', icon: Zap, label: 'IA' },
];

interface MobileBottomNavProps {
  onMoreClick: () => void;
}

export function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-t border-white/[0.08] flex items-stretch"
      style={{
        height: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 transition-all',
              isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <tab.icon size={21} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
      <button
        onClick={onMoreClick}
        className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-300 transition-all"
      >
        <MoreHorizontal size={21} />
        <span className="text-[10px] font-medium">Mais</span>
      </button>
    </nav>
  );
}
