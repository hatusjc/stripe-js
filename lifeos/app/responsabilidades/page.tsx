'use client';

import { useAppStore } from '@/lib/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getScoreColor, getScoreBg, cn, AREA_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/utils';
import { Shield, Plus, AlertTriangle, Users, DollarSign, Flag } from 'lucide-react';

export default function ResponsabilidadesPage() {
  const { responsibilities } = useAppStore();

  const avgHealth = responsibilities.length > 0
    ? Math.round(responsibilities.reduce((s, r) => s + r.healthScore, 0) / responsibilities.length)
    : 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">Responsabilidades</h2>
          <p className="text-sm text-slate-400">Seus compromissos permanentes</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Nova Responsabilidade</Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-slate-200">{responsibilities.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 sm:p-4 text-center">
          <p className={cn('text-xl sm:text-2xl font-bold', getScoreColor(avgHealth))}>{avgHealth}</p>
          <p className="text-xs text-slate-400 mt-1">Saúde Média</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-red-400">
            {responsibilities.filter((r) => r.healthScore < 60).length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Precisam de Atenção</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {responsibilities.map((r) => (
          <Card key={r.id} hover>
            <CardContent className="pt-5">
              <div className="flex items-start gap-3 mb-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                  r.priority === 'critica' ? 'bg-red-500/15' : r.priority === 'alta' ? 'bg-amber-500/15' : 'bg-blue-500/15'
                )}>
                  <Shield size={18} className={
                    r.priority === 'critica' ? 'text-red-400' : r.priority === 'alta' ? 'text-amber-400' : 'text-blue-400'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">{r.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{r.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="ghost">{AREA_LABELS[r.area]}</Badge>
                    <span className={cn('text-xs flex items-center gap-1', PRIORITY_COLORS[r.priority])}>
                      <Flag size={10} />
                      {PRIORITY_LABELS[r.priority]}
                    </span>
                  </div>
                </div>
                <div className={cn('flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold', getScoreBg(r.healthScore), getScoreColor(r.healthScore))}>
                  {r.healthScore}
                </div>
              </div>

              <ProgressBar value={r.healthScore} size="md" />

              <div className="grid grid-cols-2 gap-3 mt-4">
                {r.risks.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <AlertTriangle size={9} /> Riscos
                    </p>
                    <div className="space-y-1">
                      {r.risks.slice(0, 3).map((risk, i) => (
                        <p key={i} className="text-[11px] text-slate-400 flex items-start gap-1">
                          <span className="text-amber-500 mt-0.5">·</span> {risk}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  {r.people && r.people.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Users size={9} /> Pessoas
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {r.people.map((p, i) => <Badge key={i} variant="ghost">{p}</Badge>)}
                      </div>
                    </div>
                  )}
                  {r.costs && (
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        <DollarSign size={9} className="inline" /> Custo Mensal
                      </p>
                      <p className="text-xs text-slate-300 font-medium">
                        R$ {r.costs.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
