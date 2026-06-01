'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCurrency, cn, STATUS_LABELS } from '@/lib/utils';
import { Brain, Plus, CheckCircle2, XCircle, Minus, ThumbsUp, ThumbsDown, DollarSign } from 'lucide-react';

const STATUS_BADGE: Record<string, 'warning' | 'success' | 'info'> = {
  pendente: 'warning', tomada: 'success', revisando: 'info',
};

export default function DecisoesPage() {
  const { decisions, updateDecision } = useAppStore();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedDecision = decisions.find((d) => d.id === selected) ?? decisions[0] ?? null;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">Decisões</h2>
          <p className="text-sm text-slate-400">{decisions.length} decisões registradas</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Nova Decisão</Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Pendentes', count: decisions.filter((d) => d.status === 'pendente').length, color: 'text-amber-400' },
          { label: 'Tomadas', count: decisions.filter((d) => d.status === 'tomada').length, color: 'text-emerald-400' },
          { label: 'Revisando', count: decisions.filter((d) => d.status === 'revisando').length, color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center">
            <p className={cn('text-2xl font-bold', s.color)}>{s.count}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* List */}
        <div className="space-y-3">
          {decisions.map((d) => (
            <div
              key={d.id}
              onClick={() => setSelected(d.id)}
              className={cn(
                'p-4 rounded-xl cursor-pointer transition-all border',
                selectedDecision?.id === d.id
                  ? 'bg-blue-600/15 border-blue-500/30'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/80'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-white leading-snug">{d.title}</p>
                <Badge variant={STATUS_BADGE[d.status]}>{STATUS_LABELS[d.status]}</Badge>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{d.context}</p>
              <p className="text-[10px] text-slate-600 mt-2">{formatDate(d.createdAt)}</p>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selectedDecision ? (
            <Card>
              <CardHeader className="border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={14} className="text-violet-400" />
                      <Badge variant={STATUS_BADGE[selectedDecision.status]}>{STATUS_LABELS[selectedDecision.status]}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{selectedDecision.title}</h3>
                  </div>
                  {selectedDecision.status === 'pendente' || selectedDecision.status === 'revisando' ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => updateDecision(selectedDecision.id, { status: 'tomada', decidedAt: new Date().toISOString() })}
                    >
                      Marcar Decidida
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Contexto</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedDecision.context}</p>
                </div>

                {selectedDecision.estimatedCost && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-amber-400" />
                    <span className="text-xs text-slate-400">Custo estimado:</span>
                    <span className="text-sm font-medium text-amber-400">{formatCurrency(selectedDecision.estimatedCost)}</span>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Alternativas</p>
                  <div className="space-y-3">
                    {selectedDecision.alternatives.map((alt) => (
                      <div key={alt.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-white">{alt.title}</p>
                          {alt.score && (
                            <span className={cn('text-lg font-bold', alt.score >= 7 ? 'text-emerald-400' : alt.score >= 5 ? 'text-amber-400' : 'text-red-400')}>
                              {alt.score}/10
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mb-1.5 uppercase tracking-wider">
                              <ThumbsUp size={9} /> Prós
                            </p>
                            {alt.pros.map((pro, i) => (
                              <p key={i} className="text-xs text-slate-300 flex items-start gap-1.5 mb-1">
                                <CheckCircle2 size={10} className="text-emerald-400 shrink-0 mt-0.5" />{pro}
                              </p>
                            ))}
                          </div>
                          <div>
                            <p className="text-[10px] text-red-400 flex items-center gap-1 mb-1.5 uppercase tracking-wider">
                              <ThumbsDown size={9} /> Contras
                            </p>
                            {alt.cons.map((con, i) => (
                              <p key={i} className="text-xs text-slate-300 flex items-start gap-1.5 mb-1">
                                <XCircle size={10} className="text-red-400 shrink-0 mt-0.5" />{con}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(selectedDecision.risks.length > 0 || selectedDecision.benefits.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">Riscos</p>
                      {selectedDecision.risks.map((r, i) => (
                        <p key={i} className="text-xs text-slate-400 mb-1">· {r}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">Benefícios</p>
                      {selectedDecision.benefits.map((b, i) => (
                        <p key={i} className="text-xs text-slate-400 mb-1">· {b}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Impacto Esperado</p>
                  <p className="text-sm text-slate-300">{selectedDecision.expectedImpact}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500">
              <div className="text-center">
                <Brain size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selecione uma decisão</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
