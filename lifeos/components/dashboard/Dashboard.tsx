'use client';

import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatCurrency, formatDate, daysUntil, getDaysLabel, getScoreColor, getScoreBg, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Target, Shield, Zap, ArrowRight, Activity,
  FolderKanban, Star, Bell, Calendar, Flame, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

const cashFlowData = [
  { month: 'Jan', receita: 16500, despesa: 9200 },
  { month: 'Fev', receita: 15000, despesa: 8800 },
  { month: 'Mar', receita: 18200, despesa: 10100 },
  { month: 'Abr', receita: 15000, despesa: 9400 },
  { month: 'Mai', receita: 19700, despesa: 8490 },
  { month: 'Jun', receita: 19700, despesa: 8490 },
];

const PRIORITY_DOT: Record<string, string> = {
  critica: 'bg-red-400',
  alta: 'bg-amber-400',
  media: 'bg-blue-400',
  baixa: 'bg-slate-500',
};

/* ─── Reusable mini-card used in 2×2 grids ─────────────────────────────── */
function MiniCard({
  label, value, valueColor = 'text-white', icon, iconBg, sub, children,
}: {
  label: string;
  value?: string;
  valueColor?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="bg-[rgba(15,23,42,0.85)] border border-white/[0.08] rounded-[20px] p-5 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex flex-col justify-between"
      style={{ minHeight: 120 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-medium text-slate-300/85 leading-tight">{label}</p>
        {icon && (
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', iconBg ?? 'bg-slate-700')}>
            {icon}
          </div>
        )}
      </div>
      {value && (
        <div>
          <p className={cn('text-[22px] font-bold leading-none truncate', valueColor)}>{value}</p>
          {sub && <p className="text-[13px] text-slate-500 mt-1.5">{sub}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ─── Section header ────────────────────────────────────────────────────── */
function SectionHeader({ icon, title, linkHref, linkLabel, aside }: {
  icon: React.ReactNode;
  title: string;
  linkHref?: string;
  linkLabel?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {linkHref && (
        <Link href={linkHref} className="text-[13px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
          {linkLabel ?? 'Ver tudo'} <ArrowRight size={12} />
        </Link>
      )}
      {aside && !linkHref && aside}
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────────────────── */
export function Dashboard() {
  const { getTotalBalance, getMonthlyIncome, getMonthlyExpenses, accounts } = useFinanceStore();
  const { projects, getAtRiskProjects } = useProjectStore();
  const { goals, responsibilities, familyEvents, alerts, lifeScore, tasks, markAlertRead } = useAppStore();

  const totalBalance = getTotalBalance();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const cashFlow = monthlyIncome - monthlyExpenses;
  const investmentBalance = accounts
    .filter((a) => a.type === 'investimento')
    .reduce((s, a) => s + a.balance, 0);

  const atRiskProjects = getAtRiskProjects();
  const activeProjects = projects.filter((p) => p.status === 'em_andamento');
  const featuredProjects = [...activeProjects, ...atRiskProjects].slice(0, 4);

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

      {/* ── Daily badges ──────────────────────────────────────────────── */}
      {(todayTasks.length > 0 || overdueTasks.length > 0) && (
        <div className="flex items-center gap-3 flex-wrap">
          {todayTasks.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-4 py-2">
              <Flame size={14} className="text-orange-400" />
              <span className="text-[13px] font-semibold text-orange-300">
                {todayTasks.length} tarefa{todayTasks.length !== 1 ? 's' : ''} para hoje
              </span>
            </div>
          )}
          {overdueTasks.length > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-full px-4 py-2">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-[13px] font-semibold text-red-300">
                {overdueTasks.length} atrasado{overdueTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Desktop 3-col / Mobile single-col split ───────────────────── */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">

        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Primary Balance Card */}
          <div
            className="bg-gradient-to-br from-blue-600/25 via-blue-500/10 to-purple-600/15 border border-white/[0.08] rounded-[24px] p-6 shadow-[0_8px_32px_rgba(59,130,246,0.18)] backdrop-blur-md"
            style={{ minHeight: 140 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[15px] font-medium text-white/75">Saldo Total</p>
                <p className="text-[12px] text-white/45 mt-0.5">Todas as contas</p>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-3 py-1.5">
                <TrendingUp size={12} className="text-emerald-400" />
                <span className="text-[13px] font-semibold text-emerald-400">+3,2%</span>
              </div>
            </div>
            <p className="text-[36px] font-bold text-white leading-none tracking-tight">
              {formatCurrency(totalBalance)}
            </p>
          </div>

          {/* Secondary 2×2 grid */}
          <div className="grid grid-cols-2 gap-4">
            <MiniCard
              label="Receita"
              value={formatCurrency(monthlyIncome)}
              valueColor="text-emerald-400"
              icon={<TrendingUp size={14} className="text-emerald-400" />}
              iconBg="bg-emerald-500/15"
              sub="Mês atual"
            />
            <MiniCard
              label="Despesas"
              value={formatCurrency(monthlyExpenses)}
              valueColor="text-rose-400"
              icon={<TrendingDown size={14} className="text-rose-400" />}
              iconBg="bg-rose-500/15"
              sub="Mês atual"
            />
            <MiniCard
              label="Fluxo de Caixa"
              value={formatCurrency(cashFlow)}
              valueColor={cashFlow >= 0 ? 'text-blue-400' : 'text-red-400'}
              icon={<Activity size={14} className={cashFlow >= 0 ? 'text-blue-400' : 'text-red-400'} />}
              iconBg={cashFlow >= 0 ? 'bg-blue-500/15' : 'bg-red-500/15'}
              sub={cashFlow >= 0 ? 'Positivo' : 'Negativo'}
            />
            <MiniCard
              label="Investimentos"
              value={formatCurrency(investmentBalance)}
              valueColor="text-purple-400"
              icon={<Star size={14} className="text-purple-400" />}
              iconBg="bg-purple-500/15"
              sub="Carteira total"
            />
          </div>

          {/* Cash Flow Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Fluxo de Caixa</CardTitle>
                <Link href="/financas" className="text-[13px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
                  Ver tudo <ArrowRight size={12} />
                </Link>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[13px] text-slate-400">Receita</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[13px] text-slate-400">Despesas</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={cashFlowData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', fontSize: '13px', padding: '12px 16px' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                    formatter={(value) => [formatCurrency(Number(value)), ''] as [string, string]}
                  />
                  <Area type="monotone" dataKey="receita" stroke="#10b981" fill="url(#gReceita)" strokeWidth={2.5} name="Receita" dot={false} />
                  <Area type="monotone" dataKey="despesa" stroke="#f43f5e" fill="url(#gDespesa)" strokeWidth={2.5} name="Despesas" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <div>
            <SectionHeader
              icon={<FolderKanban size={16} className="text-purple-400" />}
              title="Projetos Ativos"
              linkHref="/projetos"
            />
            <div className="space-y-3">
              {featuredProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-[rgba(15,23,42,0.85)] border border-white/[0.08] rounded-[16px] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md hover:border-white/[0.12] transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-[15px] font-medium text-white leading-tight">{p.title}</p>
                    <Badge variant={p.status === 'em_risco' ? 'danger' : 'info'}>
                      {p.status === 'em_risco' ? 'Risco' : 'Em andamento'}
                    </Badge>
                  </div>
                  <ProgressBar value={p.progress} />
                  <p className="text-[13px] text-slate-500 mt-3">{p.progress}% concluído</p>
                </div>
              ))}
              {featuredProjects.length === 0 && (
                <div className="bg-[rgba(15,23,42,0.85)] border border-white/[0.08] rounded-[16px] p-6 text-center">
                  <p className="text-[14px] text-slate-500">Nenhum projeto ativo</p>
                </div>
              )}
            </div>
          </div>

          {/* Priority Tasks */}
          <div>
            <SectionHeader
              icon={<CheckCircle2 size={16} className="text-blue-400" />}
              title="Tarefas Prioritárias"
              aside={<span className="text-[13px] text-slate-500">{pendingTasks.length} pendentes</span>}
            />
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((task) => {
                const days = task.dueDate ? daysUntil(task.dueDate) : null;
                const isOverdue = days !== null && days < 0;
                return (
                  <div
                    key={task.id}
                    className="bg-[rgba(15,23,42,0.85)] border border-white/[0.08] rounded-[16px] px-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md flex items-center gap-3 cursor-pointer hover:border-white/[0.12] active:scale-[0.99] transition-all"
                    style={{ minHeight: 56 }}
                  >
                    <div className={cn('w-2 h-2 rounded-full shrink-0', PRIORITY_DOT[task.priority] ?? 'bg-slate-500')} />
                    <div className="flex-1 min-w-0 py-4">
                      <p className="text-[15px] font-medium text-white truncate">{task.title}</p>
                      {days !== null && (
                        <p className={cn('text-[13px] mt-0.5', isOverdue ? 'text-red-400' : 'text-slate-500')}>
                          {getDaysLabel(days)}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-600 shrink-0" />
                  </div>
                );
              })}
              {pendingTasks.length === 0 && (
                <div className="bg-[rgba(15,23,42,0.85)] border border-white/[0.08] rounded-[16px] p-6 text-center">
                  <p className="text-[14px] text-slate-500">Sem tarefas pendentes 🎉</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1/3 — desktop sidebar content */}
        <div className="space-y-6">

          {/* Life Score */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star size={15} className="text-amber-400" />
                  Life Score
                </CardTitle>
                <span className={cn('text-[28px] font-bold', getScoreColor(lifeScore.total))}>
                  {lifeScore.total}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {radarData.map((d) => (
                  <div key={d.subject} className={cn('flex items-center justify-between rounded-xl px-3 py-2', getScoreBg(d.value))}>
                    <span className="text-[12px] text-slate-400">{d.subject}</span>
                    <span className={cn('text-[12px] font-bold', getScoreColor(d.value))}>{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {unreadAlerts.length > 0 && (
            <div>
              <SectionHeader
                icon={<Bell size={16} className="text-red-400" />}
                title="Alertas"
                aside={<Badge variant="danger">{unreadAlerts.length}</Badge>}
              />
              <div className="space-y-3">
                {unreadAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'rounded-[16px] p-4 cursor-pointer transition-all active:scale-[0.99]',
                      alert.severity === 'critical' ? 'bg-red-500/10 border border-red-500/20' :
                      alert.severity === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' :
                      'bg-blue-500/10 border border-blue-500/20'
                    )}
                    onClick={() => markAlertRead(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={14} className={cn('mt-0.5 shrink-0',
                        alert.severity === 'critical' ? 'text-red-400' :
                        alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                      )} />
                      <div>
                        <p className="text-[14px] font-medium text-white">{alert.title}</p>
                        <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={15} className="text-pink-400" />
                    Próximos Eventos
                  </CardTitle>
                  <Link href="/familia" className="text-[13px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                    Ver <ArrowRight size={12} />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => {
                  const days = daysUntil(event.date);
                  return (
                    <div key={event.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-[12px] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] text-slate-400 uppercase leading-none">
                          {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}
                        </span>
                        <span className="text-[15px] font-bold text-white leading-none mt-0.5">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-white truncate">{event.title}</p>
                        <p className="text-[13px] text-slate-500 mt-0.5">{getDaysLabel(days)}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Goals ─────────────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          icon={<Target size={16} className="text-orange-400" />}
          title="Objetivos em Andamento"
          linkHref="/objetivos"
          linkLabel="Ver todos"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {activeGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-[rgba(15,23,42,0.85)] border border-white/[0.08] rounded-[20px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md hover:border-white/[0.12] transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[14px] font-medium text-white leading-tight flex-1 mr-2">{goal.title}</p>
                <span className={cn('text-[18px] font-bold shrink-0', getScoreColor(goal.progress))}>
                  {goal.progress}%
                </span>
              </div>
              <ProgressBar value={goal.progress} />
              <p className="text-[12px] text-slate-500 mt-2">{formatDate(goal.targetDate)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Responsibilities ──────────────────────────────────────────── */}
      <div>
        <SectionHeader
          icon={<Shield size={16} className="text-red-400" />}
          title="Responsabilidades"
          linkHref="/responsabilidades"
          linkLabel="Ver todas"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {responsibilities.slice(0, 4).map((r) => (
            <div
              key={r.id}
              className="bg-[rgba(15,23,42,0.85)] border border-white/[0.08] rounded-[20px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md"
            >
              <div className="flex items-start gap-2 mb-3">
                <Shield size={14} className={cn('mt-0.5 shrink-0',
                  r.priority === 'critica' ? 'text-red-400' :
                  r.priority === 'alta' ? 'text-amber-400' : 'text-blue-400'
                )} />
                <p className="text-[14px] font-medium text-white leading-tight">{r.title}</p>
              </div>
              <ProgressBar value={r.healthScore} />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[12px] text-slate-500 capitalize">{r.area}</span>
                <span className={cn('text-[13px] font-bold', getScoreColor(r.healthScore))}>{r.healthScore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
