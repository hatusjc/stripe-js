'use client';

import { useAppStore } from '@/lib/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDate, getScoreColor, getScoreBg, cn } from '@/lib/utils';
import { HeartPulse, Plus, Dumbbell, Moon, Droplets, Apple, Brain, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const METRIC_ICONS: Record<string, React.ReactNode> = {
  exercicio: <Dumbbell size={14} className="text-blue-400" />,
  sono: <Moon size={14} className="text-purple-400" />,
  hidratacao: <Droplets size={14} className="text-cyan-400" />,
  alimentacao: <Apple size={14} className="text-green-400" />,
  meditacao: <Brain size={14} className="text-violet-400" />,
  peso: <Scale size={14} className="text-amber-400" />,
};

const METRIC_LABELS: Record<string, string> = {
  exercicio: 'Exercício', sono: 'Sono', hidratacao: 'Hidratação',
  alimentacao: 'Alimentação', meditacao: 'Meditação', peso: 'Peso', outro: 'Outro',
};

const weightData = [
  { date: '01/05', peso: 96 }, { date: '08/05', peso: 95 }, { date: '15/05', peso: 94 },
  { date: '22/05', peso: 93.5 }, { date: '01/06', peso: 93 },
];

export default function SaudePage() {
  const { healthMetrics, healthGoals, lifeScore } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Saúde</h2>
          <p className="text-sm text-slate-400">Saúde física e mental</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Registrar Métrica</Button>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cn('border rounded-xl p-4 text-center', getScoreBg(lifeScore.saude))}>
          <p className="text-xs text-slate-400">Score de Saúde</p>
          <p className={cn('text-3xl font-bold mt-1', getScoreColor(lifeScore.saude))}>{lifeScore.saude}</p>
          <p className="text-xs text-slate-500 mt-1">/100</p>
        </div>
        {healthGoals.slice(0, 3).map((goal) => {
          const pct = Math.min(100, (goal.current / goal.target) * 100);
          return (
            <div key={goal.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400">{goal.title}</p>
              <div className="flex items-end gap-1 mt-1">
                <p className={cn('text-xl font-bold', getScoreColor(pct))}>{goal.current}</p>
                <p className="text-xs text-slate-500 mb-0.5">/{goal.target} {goal.unit}</p>
              </div>
              <ProgressBar value={pct} className="mt-2" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <Card>
          <CardHeader><CardTitle>Evolução do Peso</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weightData}>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v) => [`${v} kg`, 'Peso'] as [string, string]}
                />
                <Line type="monotone" dataKey="peso" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Goals */}
        <Card>
          <CardHeader><CardTitle>Metas de Saúde</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {healthGoals.map((goal) => {
              const pct = Math.min(100, (goal.current / goal.target) * 100);
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-300">{goal.title}</span>
                    <span className="text-xs text-slate-400">{goal.current}/{goal.target} {goal.unit}</span>
                  </div>
                  <ProgressBar value={pct} size="md" showLabel />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Metrics */}
      <Card>
        <CardHeader><CardTitle>Registros Recentes</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {healthMetrics.slice(0, 8).map((m) => (
              <div key={m.id} className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-2.5">
                <div className="shrink-0 mt-0.5">{METRIC_ICONS[m.type] ?? METRIC_ICONS.outro}</div>
                <div>
                  <p className="text-xs text-slate-400">{METRIC_LABELS[m.type]}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{m.value} <span className="text-xs font-normal text-slate-500">{m.unit}</span></p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{formatDate(m.date)}</p>
                  {m.notes && <p className="text-[10px] text-slate-500 mt-0.5">{m.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
