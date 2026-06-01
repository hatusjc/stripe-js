'use client';

import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, formatDate, daysUntil, cn } from '@/lib/utils';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, PiggyBank,
  Plus, ArrowUpRight, ArrowDownLeft, AlertCircle, Target
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

const categoryData = [
  { name: 'Moradia', value: 3200 },
  { name: 'Alimentação', value: 850 },
  { name: 'Transporte', value: 380 },
  { name: 'Saúde', value: 620 },
  { name: 'Educação', value: 297 },
  { name: 'Outros', value: 1143 },
];

export function FinancasPage() {
  const { transactions, accounts, goals, debts, getTotalBalance, getMonthlyIncome, getMonthlyExpenses } = useFinanceStore();

  const totalBalance = getTotalBalance();
  const income = getMonthlyIncome();
  const expenses = getMonthlyExpenses();
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0);
  const totalAssets = accounts.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const netWorth = totalAssets - totalDebt;

  const recentTransactions = transactions.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Finanças</h2>
          <p className="text-sm text-slate-400">Gestão financeira completa</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Nova Transação</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Patrimônio Líquido" value={formatCurrency(netWorth)} subtitle="Ativos - Dívidas" icon={<DollarSign size={16} className="text-emerald-400" />} iconBg="bg-emerald-500/15" valueColor="text-emerald-400" trend={5.2} />
        <StatCard title="Receita do Mês" value={formatCurrency(income)} subtitle="Todos os recebimentos" icon={<TrendingUp size={16} className="text-blue-400" />} iconBg="bg-blue-500/15" valueColor="text-blue-400" />
        <StatCard title="Despesas do Mês" value={formatCurrency(expenses)} subtitle="Todos os gastos" icon={<TrendingDown size={16} className="text-rose-400" />} iconBg="bg-rose-500/15" valueColor="text-rose-400" />
        <StatCard title="Taxa de Poupança" value={`${savingsRate.toFixed(1)}%`} subtitle={formatCurrency(savings) + ' economizados'} icon={<PiggyBank size={16} className="text-amber-400" />} iconBg="bg-amber-500/15" valueColor={savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 10 ? 'text-amber-400' : 'text-red-400'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Breakdown */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Distribuição de Gastos</CardTitle>
              <Badge variant="ghost">Mês atual</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v) => [formatCurrency(Number(v)), ''] as [string, string]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex flex-col justify-center">
                  {categoryData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-xs text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-300">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Transações Recentes</CardTitle>
              <Button variant="ghost" size="sm">Ver todas</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      t.type === 'receita' ? 'bg-emerald-500/15' : 'bg-rose-500/15'
                    )}>
                      {t.type === 'receita'
                        ? <ArrowDownLeft size={14} className="text-emerald-400" />
                        : <ArrowUpRight size={14} className="text-rose-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 font-medium truncate">{t.description}</p>
                      <p className="text-xs text-slate-500">{t.category} · {formatDate(t.date)}</p>
                    </div>
                    <span className={cn('text-sm font-semibold shrink-0', t.type === 'receita' ? 'text-emerald-400' : 'text-rose-400')}>
                      {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Contas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      acc.type === 'investimento' ? 'bg-purple-500/15' :
                      acc.type === 'poupanca' ? 'bg-blue-500/15' :
                      acc.type === 'cartao' ? 'bg-rose-500/15' : 'bg-emerald-500/15'
                    )}>
                      <CreditCard size={13} className={
                        acc.type === 'investimento' ? 'text-purple-400' :
                        acc.type === 'poupanca' ? 'text-blue-400' :
                        acc.type === 'cartao' ? 'text-rose-400' : 'text-emerald-400'
                      } />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-300">{acc.name}</p>
                      <p className="text-[10px] text-slate-500">{acc.institution}</p>
                    </div>
                  </div>
                  <span className={cn('text-sm font-semibold', acc.balance < 0 ? 'text-rose-400' : 'text-slate-200')}>
                    {formatCurrency(acc.balance)}
                  </span>
                </div>
              ))}
              <div className="pt-1 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-400">Total</span>
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(totalBalance)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debts */}
          {debts.length > 0 && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-400" />
                  Dívidas
                </CardTitle>
                <span className="text-xs text-rose-400 font-medium">{formatCurrency(totalDebt)}</span>
              </CardHeader>
              <CardContent className="space-y-3">
                {debts.map((debt) => {
                  const paid = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100;
                  return (
                    <div key={debt.id}>
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <p className="text-xs font-medium text-slate-300">{debt.creditor}</p>
                          <p className="text-[10px] text-slate-500">{debt.interestRate}% a.m. · Vence {formatDate(debt.dueDate)}</p>
                        </div>
                        <p className="text-xs text-rose-400 font-medium">{formatCurrency(debt.remainingAmount)}</p>
                      </div>
                      <ProgressBar value={paid} color="bg-rose-500" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Financial Goals */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target size={14} className="text-amber-400" />
                Metas Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.map((goal) => {
                const pct = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="text-xs font-medium text-slate-300">{goal.title}</p>
                      <span className="text-xs text-slate-400">{Math.round(pct)}%</span>
                    </div>
                    <ProgressBar value={pct} size="md" />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
