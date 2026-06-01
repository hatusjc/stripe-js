'use client';

import { useAppStore } from '@/lib/store/useAppStore';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Building2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TYPE_LABELS: Record<string, string> = {
  imovel: 'Imóvel', veiculo: 'Veículo', empresa: 'Empresa',
  investimento: 'Investimento', reserva: 'Reserva', outro: 'Outro',
};

const TYPE_COLORS: Record<string, string> = {
  imovel: 'text-blue-400', veiculo: 'text-purple-400', empresa: 'text-amber-400',
  investimento: 'text-emerald-400', reserva: 'text-cyan-400', outro: 'text-slate-400',
};

const TYPE_BG: Record<string, string> = {
  imovel: 'bg-blue-500/15', veiculo: 'bg-purple-500/15', empresa: 'bg-amber-500/15',
  investimento: 'bg-emerald-500/15', reserva: 'bg-cyan-500/15', outro: 'bg-slate-700',
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4', '#94a3b8'];

export default function PatrimonioPage() {
  const { assets } = useAppStore();
  const { debts } = useFinanceStore();

  const totalAssets = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalDebts = debts.reduce((s, d) => s + d.remainingAmount, 0);
  const netWorth = totalAssets - totalDebts;
  const totalAcquisition = assets.reduce((s, a) => s + a.acquisitionValue, 0);
  const appreciation = ((totalAssets - totalAcquisition) / totalAcquisition) * 100;

  const chartData = assets.map((a) => ({ name: a.name.slice(0, 15), value: a.currentValue }));

  const byType = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + a.currentValue;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Patrimônio</h2>
          <p className="text-sm text-slate-400">Seus ativos e investimentos</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Novo Ativo</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-400">Patrimônio Líquido</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(netWorth)}</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-400">Total de Ativos</p>
          <p className="text-xl font-bold text-blue-400 mt-1">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-400">Total de Dívidas</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{formatCurrency(totalDebts)}</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-400">Valorização</p>
          <div className="flex items-center gap-1 mt-1">
            {appreciation >= 0 ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-red-400" />}
            <p className={cn('text-xl font-bold', appreciation >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {appreciation >= 0 ? '+' : ''}{appreciation.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Distribuição por Ativo</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v) => [v !== undefined ? formatCurrency(Number(v)) : '', 'Valor'] as [string, string]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {assets.map((asset) => {
              const gain = asset.currentValue - asset.acquisitionValue;
              const gainPct = (gain / asset.acquisitionValue) * 100;
              return (
                <Card key={asset.id} hover>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', TYPE_BG[asset.type])}>
                        <Building2 size={18} className={TYPE_COLORS[asset.type]} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{asset.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="ghost">{TYPE_LABELS[asset.type]}</Badge>
                              <span className="text-[10px] text-slate-500">Adq. {formatDate(asset.acquisitionDate)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">{formatCurrency(asset.currentValue)}</p>
                            <p className={cn('text-xs font-medium', gain >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                              {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        {asset.description && <p className="text-xs text-slate-500 mt-1">{asset.description}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Por Tipo</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(byType).map(([type, value], i) => {
                const pct = (value / totalAssets) * 100;
                return (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={cn('text-xs font-medium', TYPE_COLORS[type])}>{TYPE_LABELS[type]}</span>
                      <div className="text-right">
                        <span className="text-xs text-slate-300 font-medium">{formatCurrency(value)}</span>
                        <span className="text-[10px] text-slate-500 ml-2">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Evolução Patrimonial</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Custo de Aquisição', value: totalAcquisition, color: 'text-slate-400' },
                  { label: 'Valor Atual', value: totalAssets, color: 'text-blue-400' },
                  { label: 'Valorização Total', value: totalAssets - totalAcquisition, color: 'text-emerald-400' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className={cn('text-sm font-semibold', item.color)}>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
