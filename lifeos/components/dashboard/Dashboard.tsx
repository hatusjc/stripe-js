'use client';

import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatCurrency, formatDate, daysUntil, getDaysLabel, getScoreColor, getScoreBg, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Clock, Target, Shield, Users, Zap, ArrowRight, Activity,
  FolderKanban, BookOpen, Star, Bell, Calendar, Flame
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

const cashFlowData = [
  { month: 'Jan', receita: 16500, despesa: 9200 },
  { month: 'Fev', receita: 15000, despesa: 8800 },
  { month: 'Mar', receita: 18200, despesa: 10100 },
  { month: 'Abr', receita: 15000, despesa: 9400 },
  { month: 'Mai', receita: 19700, despesa: 8490 },
  { month: 'Jun', receita: 19700, despesa: 8490 },
];

export function Dashboard() {
  const { getTotalBalance, getMonthlyIncome, getMonthlyExpenses, debts } = useFinanceStore();
  const { projects, getAtRiskProjects } = useProjectStore();
  const { goals, responsibilities, familyEvents, alerts, lifeScore, tasks, dismissAlert, markAlertRead } = useAppStore();

  const totalBalance = getTotalBalance();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const cashFlow = monthlyIncome - monthlyExpenses;

  const atRiskProjects = getAtRiskProjects();
  const activeProjects = projects.filter((p) => p.status === 'em_andamento');
  const unreadAlerts = alerts.filter((a) => !a.read);
  const pendingTasks = tasks.filter((t) => t.status !== 'concluido');
  const todayTasks = pendingTasks.filter((t) => t.dueDate && daysUntil(t.dueDate) <= 1);
  const overdueTasks = pendingTasks.filter((t) => t.dueDate && daysUntil(t.dueDate) < 0);

  const upcomingEvents = familyEvents
    .filter((e) => daysUntil(e.date) >= 0 && daysUntil(e.date) <= 30)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
    .slice(0, 4);

  const activeGoals = goals.filter((g) => g.status === 'ativo').slice(0, 4);

  const radarData = [
    { subject: 'Finanças', value: lifeScore.financas },
    { subject: 'Saúde', value: lifeScore.saude },
    { subject: 'Família', value: lifeScore.familia },
    { subject: 'Carreira', value: lifeScore.carreira },
    { subject: 'Patrimônio', value: lifeScore.patrimonio },
    { subject: 'Metas', value: lifeScore.metas },
    { subject: 'Execução', value: lifeScore.execucao },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Bom dia! 👋</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {overdueTasks.length > 0
              ? `Você tem ${overdueTasks.length} item(s) atrasado(s) e ${unreadAlerts.length} alertas`
              : 'Tudo sob controle. Aqui está seu resumo do dia.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {overdueTasks.length > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-xs text-red-400 font-medium">{overdueTasks.length} atrasado(s)</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-1.5">
            <Flame size={14} className="text-orange-400" />
            <span className="text-xs text-slate-300 font-medium">{todayTasks.length} para hoje</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          subtitle="Todas as contas"
          icon={<DollarSign size={16} className="text-emerald-400" />}
          iconBg="bg-emerald-500/15"
          valueColor="text-emerald-400"
          trend={3.2}
        />
        <StatCard
          title="Receita Mensal"
          value={formatCurrency(monthlyIncome)}
          subtitle="Mês atual"
          icon={<TrendingUp size={16} className="text-blue-400" />}
          iconBg="bg-blue-500/15"
          valueColor="text-blue-400"
          trend={12.4}
        />
        <StatCard
          title="Despesas Mensais"
          value={formatCurrency(monthlyExpenses)}
          subtitle="Mês atual"
          icon={<TrendingDown size={16} className="text-rose-400" />}
          iconBg="bg-rose-500/15"
          valueColor="text-rose-400"
          trend={-2.1}
        />
        <StatCard
          title="Fluxo de Caixa"
          value={formatCurrency(cashFlow)}
          subtitle={cashFlow >= 0 ? 'Positivo' : 'Negativo'}
          icon={<Activity size={16} className={cashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'} />}
          iconBg={cashFlow >= 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'}
          valueColor={cashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Cash Flow Chart + Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cash Flow Chart */}
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-4">
              <CardTitle>Fluxo de Caixa</CardTitle>
              <Link href="/financas" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Ver tudo <ArrowRight size={12} />
              </Link>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={cashFlowData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value) => [formatCurrency(Number(value)), ''] as [string, string]}
                  />
                  <Area type="monotone" dataKey="receita" stroke="#10b981" fill="url(#colorReceita)" strokeWidth={2} name="Receita" />
                  <Area type="monotone" dataKey="despesa" stroke="#f43f5e" fill="url(#colorDespesa)" strokeWidth={2} name="Despesas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projects + Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Projects */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban size={14} className="text-purple-400" />
                  Projetos Ativos
                </CardTitle>
                <Link href="/projetos" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Ver tudo <ArrowRight size={12} />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...activeProjects, ...atRiskProjects].slice(0, 3).map((p) => (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium truncate flex-1 mr-2">{p.title}</span>
                      <Badge variant={p.status === 'em_risco' ? 'danger' : 'info'} className="shrink-0">
                        {p.status === 'em_risco' ? 'Risco' : 'Ativo'}
                      </Badge>
                    </div>
                    <ProgressBar value={p.progress} />
                    <p className="text-[10px] text-slate-500">{p.progress}% concluído</p>
                  </div>
                ))}
                {activeProjects.length === 0 && atRiskProjects.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">Nenhum projeto ativo</p>
                )}
              </CardContent>
            </Card>

            {/* Today's Tasks */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" />
                  Tarefas Prioritárias
                </CardTitle>
                <span className="text-xs text-slate-500">{pendingTasks.length} pendentes</span>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingTasks.slice(0, 5).map((task) => {
                  const days = task.dueDate ? daysUntil(task.dueDate) : null;
                  const isOverdue = days !== null && days < 0;
                  return (
                    <div key={task.id} className="flex items-start gap-2.5 py-1.5 border-b border-slate-800/60 last:border-0">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                        task.priority === 'critica' ? 'bg-red-400' :
                        task.priority === 'alta' ? 'bg-amber-400' :
                        task.priority === 'media' ? 'bg-blue-400' : 'bg-slate-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 font-medium truncate">{task.title}</p>
                        {days !== null && (
                          <p className={cn('text-[10px] mt-0.5', isOverdue ? 'text-red-400' : 'text-slate-500')}>
                            {getDaysLabel(days)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {pendingTasks.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">Sem tarefas pendentes 🎉</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Life Score Radar */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star size={14} className="text-amber-400" />
                Life Score
              </CardTitle>
              <span className={cn('text-2xl font-bold', getScoreColor(lifeScore.total))}>{lifeScore.total}</span>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {radarData.map((d) => (
                  <div key={d.subject} className={cn('flex items-center justify-between rounded-md px-2 py-1', getScoreBg(d.value))}>
                    <span className="text-[10px] text-slate-400">{d.subject}</span>
                    <span className={cn('text-[10px] font-bold', getScoreColor(d.value))}>{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {unreadAlerts.length > 0 && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell size={14} className="text-red-400" />
                  Alertas
                </CardTitle>
                <Badge variant="danger">{unreadAlerts.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {unreadAlerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-start gap-2.5 p-2 rounded-lg cursor-pointer',
                      alert.severity === 'critical' ? 'bg-red-500/10 border border-red-500/20' :
                      alert.severity === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' :
                      'bg-blue-500/10 border border-blue-500/20'
                    )}
                    onClick={() => markAlertRead(alert.id)}
                  >
                    <AlertTriangle size={12} className={
                      alert.severity === 'critical' ? 'text-red-400 mt-0.5 shrink-0' :
                      alert.severity === 'warning' ? 'text-amber-400 mt-0.5 shrink-0' :
                      'text-blue-400 mt-0.5 shrink-0'
                    } />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300">{alert.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{alert.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Family Events */}
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={14} className="text-pink-400" />
                  Próximos Eventos
                </CardTitle>
                <Link href="/familia" className="text-xs text-blue-400 hover:text-blue-300">
                  <ArrowRight size={12} />
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingEvents.map((event) => {
                  const days = daysUntil(event.date);
                  return (
                    <div key={event.id} className="flex items-center gap-3 py-1.5">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] text-slate-400 uppercase leading-none">
                          {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}
                        </span>
                        <span className="text-xs font-bold text-white leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 font-medium truncate">{event.title}</p>
                        <p className="text-[10px] text-slate-500">{getDaysLabel(days)}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Goals Row */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Target size={15} className="text-orange-400" />
            Objetivos em Andamento
          </h3>
          <Link href="/objetivos" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeGoals.map((goal) => (
            <Card key={goal.id} hover>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{goal.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{goal.area} · {goal.period}</p>
                  </div>
                  <span className={cn('text-lg font-bold ml-2', getScoreColor(goal.progress))}>
                    {goal.progress}%
                  </span>
                </div>
                <ProgressBar value={goal.progress} size="md" />
                <p className="text-[10px] text-slate-500 mt-2">
                  Prazo: {formatDate(goal.targetDate)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Responsibilities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Shield size={15} className="text-red-400" />
            Responsabilidades
          </h3>
          <Link href="/responsabilidades" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {responsibilities.slice(0, 4).map((r) => (
            <Card key={r.id} hover>
              <CardContent className="pt-4">
                <div className="flex items-start gap-2 mb-3">
                  <Shield size={14} className={cn(
                    r.priority === 'critica' ? 'text-red-400' :
                    r.priority === 'alta' ? 'text-amber-400' : 'text-blue-400'
                  )} />
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{r.title}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 capitalize">{r.area}</span>
                  <div className={cn('flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full', getScoreBg(r.healthScore), getScoreColor(r.healthScore))}>
                    {r.healthScore}
                  </div>
                </div>
                <ProgressBar value={r.healthScore} className="mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
