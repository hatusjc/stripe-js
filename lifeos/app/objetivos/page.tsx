'use client';

import { useAppStore } from '@/lib/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Target, Plus, TrendingUp, Calendar } from 'lucide-react';
import { formatDate, getScoreColor, cn, AREA_LABELS } from '@/lib/utils';

export default function ObjetivosPage() {
  const { goals } = useAppStore();
  const activeGoals = goals.filter((g) => g.status === 'ativo');
  const completedGoals = goals.filter((g) => g.status === 'concluido');

  const periodLabels: Record<string, string> = {
    '30dias': '30 dias', '90dias': '90 dias', anual: 'Anual', '5anos': '5 anos',
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">Objetivos</h2>
          <p className="text-sm text-slate-400">{activeGoals.length} metas ativas</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Nova Meta</Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-blue-400">{activeGoals.length}</p>
          <p className="text-xs text-slate-400 mt-1">Metas Ativas</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">{completedGoals.length}</p>
          <p className="text-xs text-slate-400 mt-1">Concluídas</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-amber-400">
            {activeGoals.length > 0
              ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
              : 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Progresso Médio</p>
        </div>
      </div>

      <div className="space-y-4">
        {activeGoals.map((goal) => (
          <Card key={goal.id} hover>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target size={14} className="text-orange-400" />
                    <h3 className="text-sm font-semibold text-white">{goal.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{goal.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="info">{AREA_LABELS[goal.area]}</Badge>
                    <Badge variant="ghost">{periodLabels[goal.period]}</Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(goal.targetDate)}
                    </span>
                  </div>
                </div>
                <div className={cn('text-3xl font-bold', getScoreColor(goal.progress))}>
                  {goal.progress}%
                </div>
              </div>

              <ProgressBar value={goal.progress} size="md" showLabel={false} />

              {goal.keyResults.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Resultados-Chave</p>
                  {goal.keyResults.map((kr) => {
                    const pct = Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100));
                    return (
                      <div key={kr.id} className="bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-300">{kr.title}</p>
                          <p className="text-xs font-medium text-slate-200">
                            <span className={getScoreColor(pct)}>{kr.currentValue}</span>
                            <span className="text-slate-500"> / {kr.targetValue} {kr.unit}</span>
                          </p>
                        </div>
                        <ProgressBar value={pct} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
