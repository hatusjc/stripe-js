'use client';

import Link from 'next/link';
import { Crown, Lock } from 'lucide-react';
import { usePlanStore } from '@/lib/store/planStore';

interface PremiumGateProps {
  feature: string;
  description?: string;
  children: React.ReactNode;
}

export function PremiumGate({ feature, description, children }: PremiumGateProps) {
  const { isPremium } = usePlanStore();
  if (isPremium()) return <>{children}</>;

  return (
    <div className="relative min-h-[400px] rounded-2xl overflow-hidden">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40 scale-[0.98] origin-top">
        {children}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950/60 backdrop-blur-sm">
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Recurso Premium</h3>
          <p className="text-sm text-amber-400 font-medium mb-2">{feature}</p>
          {description && <p className="text-sm text-slate-400 mb-6">{description}</p>}
          <Link
            href="/planos"
            className="block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20"
          >
            Ver Planos →
          </Link>
          <p className="text-xs text-slate-600 mt-3">R$29,90/mês · Cancele quando quiser</p>
        </div>
      </div>
    </div>
  );
}

interface PremiumBadgeProps {
  inline?: boolean;
}

export function PremiumBadge({ inline }: PremiumBadgeProps) {
  return (
    <span className={`${inline ? 'inline-flex' : 'flex'} items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
      <Crown size={9} /> Premium
    </span>
  );
}

interface FeatureLockProps {
  children: React.ReactNode;
  locked: boolean;
  tooltip?: string;
}

export function FeatureLock({ children, locked, tooltip }: FeatureLockProps) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative group">
      <div className="pointer-events-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Lock size={12} className="text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">{tooltip ?? 'Premium'}</span>
        </div>
      </div>
    </div>
  );
}
