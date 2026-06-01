'use client';

import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatCurrency, getScoreColor, getScoreBg, cn } from '@/lib/utils';
import { Printer, Download, Calendar, TrendingUp, TrendingDown, Target, Shield, AlertTriangle, CheckCircle2, Star } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function RelatorioPage() {
  const { getTotalBalance, getMonthlyIncome, getMonthlyExpenses, debts, accounts } = useFinanceStore();
  const { projects } = useProjectStore();
  const { goals, responsibilities, alerts, tasks, lifeScore } = useAppStore();

  const income = getMonthlyIncome();
  const expenses = getMonthlyExpenses();
  const balance = getTotalBalance();
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const activeProjects = projects.filter((p) => p.status === 'em_andamento');
  const atRiskProjects = projects.filter((p) => p.status === 'em_risco');
  const completedTasks = tasks.filter((t) => t.status === 'concluido').length;
  const totalTasks = tasks.length;
  const activeGoals = goals.filter((g) => g.status === 'ativo');
  const avgGoalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
    : 0;
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && !a.read);
  const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0);
  const totalAssets = accounts.reduce((s, a) => s + Math.max(0, a.balance), 0);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const formatWeekDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

  const scoreAreas = [
    { label: 'Finanças', score: lifeScore.financas },
    { label: 'Saúde', score: lifeScore.saude },
    { label: 'Família', score: lifeScore.familia },
    { label: 'Carreira', score: lifeScore.carreira },
    { label: 'Patrimônio', score: lifeScore.patrimonio },
    { label: 'Organização', score: lifeScore.organizacao },
    { label: 'Metas', score: lifeScore.metas },
    { label: 'Execução', score: lifeScore.execucao },
  ].sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-lg font-bold text-white">Relatório Semanal</h2>
          <p className="text-sm text-slate-400">{formatWeekDate(weekStart)} — {formatWeekDate(weekEnd)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            <Printer size={14} />
            Imprimir PDF
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="space-y-6 print:space-y-4" id="report-content">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-6 print:bg-transparent print:border-2 print:border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                  <Star size={12} className="text-white" />
                </div>
                <span className="text-sm font-bold text-white">LifeOS · Relatório Semanal</span>
              </div>
              <p className="text-2xl font-bold text-white">Resumo da Semana</p>
              <p className="text-slate-400 text-sm mt-1">{formatWeekDate(weekStart)} a {formatWeekDate(weekEnd)}, {today.getFullYear()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Life Score</p>
              <p className={cn('text-5xl font-bold', getScoreColor(lifeScore.total))}>{lifeScore.total}</p>
              <p className="text-xs text-slate-500">/100</p>
            </div>
          </div>
        </div>

        {/* Alertas Críticos */}
        {criticalAlerts.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-3">
              <AlertTriangle size={14} />
              {criticalAlerts.length} Alerta(s) Crítico(s) — Ação Necessária
            </p>
            <div className="space-y-2">
              {criticalAlerts.map((a) => (
                <p key={a.id} className="text-xs text-red-300">• {a.title}: {a.description}</p>
              ))}
            </div>
          </div>
        )}

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Saldo Total', value: formatCurrency(balance), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Receita do Mês', value: formatCurrency(income), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Despesas', value: formatCurrency(expenses), icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            { label: 'Taxa de Poupança', value: `${savingsRate.toFixed(1)}%`, icon: Target, color: savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400', bg: savingsRate >= 20 ? 'bg-emerald-500/10' : 'bg-amber-500/10' },
          ].map((kpi) => (
            <div key={kpi.label} className={cn('rounded-xl p-4 border border-slate-700/50', kpi.bg)}>
              <p className="text-xs text-slate-400 mb-1">{kpi.label}</p>
              <p className={cn('text-xl font-bold', kpi.color)}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Main sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Life Score por área */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Star size={14} className="text-amber-400" />
              Life Score por Área
            </p>
            <div className="space-y-3">
              {scoreAreas.map((a) => (
                <div key={a.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-300">{a.label}</span>
                    <span className={cn('text-xs font-bold', getScoreColor(a.score))}>{a.score}/100</span>
                  </div>
                  <ProgressBar value={a.score} />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                Área mais forte: <span className="text-emerald-400 font-medium">{scoreAreas[scoreAreas.length - 1].label}</span> ·
                Área mais fraca: <span className="text-red-400 font-medium">{scoreAreas[0].label}</span>
              </p>
            </div>
          </div>

          {/* Execução */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-blue-400" />
              Execução da Semana
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-400">Tarefas concluídas</span>
                  <span className="text-xs font-medium text-white">{completedTasks}/{totalTasks}</span>
                </div>
                <ProgressBar value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} size="md" />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-400">Progresso médio das metas</span>
                  <span className="text-xs font-medium text-white">{avgGoalProgress}%</span>
                </div>
                <ProgressBar value={avgGoalProgress} size="md" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-blue-400">{activeProjects.length}</p>
                  <p className="text-[10px] text-slate-400">Projetos ativos</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-red-400">{atRiskProjects.length}</p>
                  <p className="text-[10px] text-slate-400">Em risco</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Objetivos */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={14} className="text-orange-400" />
            Status dos Objetivos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="bg-slate-700/40 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-medium text-white flex-1 mr-2">{goal.title}</p>
                  <span className={cn('text-sm font-bold shrink-0', getScoreColor(goal.progress))}>{goal.progress}%</span>
                </div>
                <ProgressBar value={goal.progress} />
                <p className="text-[10px] text-slate-500 mt-1.5 capitalize">{goal.area} · Prazo: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Responsabilidades */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={14} className="text-red-400" />
            Saúde das Responsabilidades
          </p>
          <div className="space-y-2">
            {responsibilities.map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 flex-1 truncate">{r.title}</span>
                <ProgressBar value={r.healthScore} className="w-24" />
                <span className={cn('text-xs font-bold w-8 text-right', getScoreColor(r.healthScore))}>{r.healthScore}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Patrimônio */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-3">Resumo Patrimonial</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-slate-400">Ativos totais</p>
              <p className="text-lg font-bold text-blue-400">{formatCurrency(totalAssets)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Dívidas</p>
              <p className="text-lg font-bold text-rose-400">{formatCurrency(totalDebt)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Patrimônio líquido</p>
              <p className={cn('text-lg font-bold', (totalAssets - totalDebt) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {formatCurrency(totalAssets - totalDebt)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 border-t border-slate-800">
          <p className="text-xs text-slate-600">
            Relatório gerado em {today.toLocaleDateString('pt-BR', { dateStyle: 'full' })} · LifeOS Personal Operating System
          </p>
        </div>
      </div>
    </div>
  );
}
