'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/lib/store/budgetStore';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { usePlanStore } from '@/lib/store/planStore';
import { formatCurrency } from '@/lib/utils';
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, TrendingUp, Crown } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const CATEGORY_OPTIONS = [
  { value: 'moradia', label: 'Moradia', icon: '🏠' },
  { value: 'alimentacao', label: 'Alimentação', icon: '🍽️' },
  { value: 'transporte', label: 'Transporte', icon: '🚗' },
  { value: 'lazer', label: 'Lazer', icon: '🎉' },
  { value: 'saude', label: 'Saúde', icon: '💊' },
  { value: 'educacao', label: 'Educação', icon: '📚' },
  { value: 'vestuario', label: 'Vestuário', icon: '👗' },
  { value: 'assinaturas', label: 'Assinaturas', icon: '📱' },
  { value: 'outros', label: 'Outros', icon: '📦' },
];

const COLOR_OPTIONS = [
  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-red-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
];

const COLOR_HEX: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308',
  'bg-purple-500': '#a855f7',
  'bg-red-500': '#ef4444',
  'bg-cyan-500': '#06b6d4',
  'bg-orange-500': '#f97316',
  'bg-pink-500': '#ec4899',
};

const FREE_BUDGET_LIMIT = 4;

export default function OrcamentoPage() {
  const { budgets, alerts, addBudget, updateBudget, removeBudget, dismissAlert } = useBudgetStore();
  const { transactions } = useFinanceStore();
  const { isPremium } = usePlanStore();
  const [showForm, setShowForm] = useState(false);
  const canAddMore = isPremium() || budgets.length < FREE_BUDGET_LIMIT;
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', limit: '', category: 'outros', color: 'bg-blue-500', icon: '📦' });

  const currentMonth = new Date().toISOString().slice(0, 7);

  const getSpent = (category: string) => {
    return transactions
      .filter((t) => {
        const tMonth = t.date.slice(0, 7);
        return t.type === 'despesa' && t.category.toLowerCase() === category.toLowerCase() && tMonth === currentMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const chartData = budgets.map((b) => {
    const spent = getSpent(b.category);
    return {
      name: b.name,
      Gasto: spent,
      Orçamento: b.limit,
      fill: COLOR_HEX[b.color] ?? '#3b82f6',
    };
  });

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + getSpent(b.category), 0);
  const activeAlerts = alerts.filter((a) => !a.dismissed && a.month === currentMonth);

  const handleSave = () => {
    const limit = parseFloat(form.limit);
    if (!form.name || isNaN(limit)) return;
    const cat = CATEGORY_OPTIONS.find((c) => c.value === form.category);
    const payload = { name: form.name, limit, category: form.category, color: form.color, icon: cat?.icon ?? '📦' };
    if (editId) {
      updateBudget(editId, payload);
      setEditId(null);
    } else {
      addBudget(payload);
    }
    setForm({ name: '', limit: '', category: 'outros', color: 'bg-blue-500', icon: '📦' });
    setShowForm(false);
  };

  const handleEdit = (b: typeof budgets[0]) => {
    setEditId(b.id);
    setForm({ name: b.name, limit: String(b.limit), category: b.category, color: b.color, icon: b.icon });
    setShowForm(true);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">Orçamento por Categoria</h2>
          <p className="text-slate-400 text-sm mt-0.5">Controle seus gastos mensais por área</p>
        </div>
        {canAddMore ? (
          <button
            onClick={() => { setEditId(null); setForm({ name: '', limit: '', category: 'outros', color: 'bg-blue-500', icon: '📦' }); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all"
          >
            <Plus size={16} /> Nova Categoria
          </button>
        ) : (
          <Link
            href="/planos"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-all"
          >
            <Crown size={14} /> Limite atingido — Premium
          </Link>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-500 text-xs uppercase tracking-wider">Total Orçado</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalBudget)}</p>
          <p className="text-slate-500 text-xs mt-1">este mês</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-500 text-xs uppercase tracking-wider">Total Gasto</p>
          <p className={`text-2xl font-bold mt-1 ${totalSpent > totalBudget ? 'text-red-400' : 'text-emerald-400'}`}>
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-slate-500 text-xs mt-1">{((totalSpent / totalBudget) * 100).toFixed(0)}% do orçamento</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-500 text-xs uppercase tracking-wider">Saldo Restante</p>
          <p className={`text-2xl font-bold mt-1 ${totalBudget - totalSpent < 0 ? 'text-red-400' : 'text-blue-400'}`}>
            {formatCurrency(totalBudget - totalSpent)}
          </p>
          <p className="text-slate-500 text-xs mt-1">disponível</p>
        </div>
      </div>

      {/* Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${alert.type === 'exceeded' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
              <AlertTriangle size={16} />
              <span className="flex-1 text-sm">
                {alert.type === 'exceeded'
                  ? `Orçamento de ${alert.categoryName} excedido!`
                  : `${alert.categoryName} atingiu ${(alert.threshold * 100).toFixed(0)}% do orçamento`}
              </span>
              <button onClick={() => dismissAlert(alert.id)} className="text-xs opacity-60 hover:opacity-100">Fechar</button>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Gasto vs Orçamento</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              formatter={(v) => [formatCurrency(Number(v)), ''] as [string, string]}
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="Orçamento" fill="#1e293b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Gasto" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.Gasto > entry.Orçamento ? '#ef4444' : entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budget cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const spent = getSpent(b.category);
          const pct = Math.min((spent / b.limit) * 100, 100);
          const over = spent > b.limit;
          const warn = pct >= 75 && !over;
          return (
            <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-white font-medium text-sm">{b.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {over ? <AlertTriangle size={14} className="text-red-400" /> : warn ? <AlertTriangle size={14} className="text-amber-400" /> : <CheckCircle2 size={14} className="text-emerald-400" />}
                  <button onClick={() => handleEdit(b)} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => removeBudget(b.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>{formatCurrency(spent)} gastos</span>
                <span>de {formatCurrency(b.limit)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : warn ? 'bg-amber-500' : b.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={`text-xs mt-1.5 ${over ? 'text-red-400' : 'text-slate-500'}`}>
                {over ? `${formatCurrency(spent - b.limit)} acima do limite` : `${formatCurrency(b.limit - spent)} disponível (${pct.toFixed(0)}%)`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-white">{editId ? 'Editar' : 'Nova'} Categoria de Orçamento</h3>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nome</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Limite Mensal (R$)</label>
              <input type="number" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Categoria</label>
              <select value={form.category} onChange={(e) => { const cat = CATEGORY_OPTIONS.find((c) => c.value === e.target.value); setForm({ ...form, category: e.target.value, icon: cat?.icon ?? '📦' }); }} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })} className={`w-7 h-7 rounded-full ${c} ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`} />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm">Cancelar</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
