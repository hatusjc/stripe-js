'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { usePlanStore } from '@/lib/store/planStore';
import { formatCurrency } from '@/lib/utils';
import { Calculator, TrendingUp, TrendingDown, Home, Briefcase, PiggyBank, Clock, Crown } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

type ScenarioType = 'demissao' | 'imovel' | 'aumento' | 'aposentadoria';

interface ScenarioResult {
  months: { label: string; base: number; scenario: number }[];
  summary: string;
  impact: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
}

const SCENARIOS: { id: ScenarioType; label: string; icon: typeof TrendingUp; desc: string; premium: boolean }[] = [
  { id: 'demissao', label: 'E se eu fosse demitido?', icon: TrendingDown, desc: 'Simula perda de renda e quanto tempo sua reserva dura', premium: false },
  { id: 'aumento', label: 'E se eu ganhasse um aumento?', icon: TrendingUp, desc: 'Simula aumento salarial e potencial de poupança', premium: false },
  { id: 'imovel', label: 'E se eu comprasse um imóvel?', icon: Home, desc: 'Simula financiamento e impacto no fluxo de caixa', premium: true },
  { id: 'aposentadoria', label: 'E se eu me aposentasse antecipado?', icon: Clock, desc: 'Calcula quanto precisa acumular para a independência financeira', premium: true },
];

export default function CenariosPage() {
  const { getTotalBalance, getMonthlyIncome, getMonthlyExpenses } = useFinanceStore();
  const { isPremium } = usePlanStore();
  const [active, setActive] = useState<ScenarioType>('demissao');

  const balance = getTotalBalance();
  const income = getMonthlyIncome();
  const expenses = getMonthlyExpenses();
  const savings = income - expenses;

  // Scenario params
  const [params, setParams] = useState({
    // demissao
    monthsUnemployed: 6,
    emergencyFund: balance,
    // imovel
    propertyValue: 500000,
    downPayment: 100000,
    loanRate: 10.5,
    loanYears: 30,
    // aumento
    raisePercent: 20,
    raiseSavingsRate: 50,
    // aposentadoria
    retirementAge: 50,
    currentAge: 35,
    monthlyNeeded: expenses,
    returnRate: 8,
  });

  const calcScenario = (type: ScenarioType): ScenarioResult => {
    const months: { label: string; base: number; scenario: number }[] = [];

    if (type === 'demissao') {
      let base = balance;
      let scenario = balance;
      for (let i = 1; i <= 24; i++) {
        base += savings;
        if (i <= params.monthsUnemployed) {
          scenario -= expenses;
        } else {
          scenario += savings;
        }
        if (i % 3 === 0) {
          months.push({ label: `Mês ${i}`, base: Math.max(0, base), scenario: Math.max(0, scenario) });
        }
      }
      const runsOut = balance / expenses;
      return {
        months,
        summary: `Sua reserva atual dura ${runsOut.toFixed(1)} meses sem renda. Após ${params.monthsUnemployed} meses desempregado, você teria ${formatCurrency(Math.max(0, balance - expenses * params.monthsUnemployed))} restante.`,
        impact: 'negative',
        recommendations: [
          `Mantenha ${formatCurrency(expenses * 6)} de reserva de emergência (6 meses de despesas)`,
          'Considere um seguro de vida e desemprego',
          'Diversifique suas fontes de renda',
        ],
      };
    }

    if (type === 'imovel') {
      const loanAmount = params.propertyValue - params.downPayment;
      const monthlyRate = params.loanRate / 100 / 12;
      const n = params.loanYears * 12;
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      let base = balance;
      let scenario = balance - params.downPayment;
      for (let i = 1; i <= 60; i++) {
        base += savings;
        scenario += savings - monthlyPayment;
        if (i % 6 === 0) {
          months.push({ label: `Mês ${i}`, base: Math.max(0, base), scenario: Math.max(0, scenario) });
        }
      }
      return {
        months,
        summary: `Parcela mensal: ${formatCurrency(monthlyPayment)}. Comprometeria ${((monthlyPayment / income) * 100).toFixed(1)}% da sua renda. Total pago em ${params.loanYears} anos: ${formatCurrency(monthlyPayment * n + params.downPayment)}.`,
        impact: monthlyPayment < savings ? 'positive' : 'negative',
        recommendations: [
          `A parcela representa ${((monthlyPayment / income) * 100).toFixed(1)}% da renda — ideal manter abaixo de 30%`,
          `Você precisa de ${formatCurrency(params.downPayment)} de entrada (${((params.downPayment / params.propertyValue) * 100).toFixed(0)}%)`,
          'Considere FGTS e outros subsídios disponíveis',
        ],
      };
    }

    if (type === 'aumento') {
      const raiseAmount = income * (params.raisePercent / 100);
      const extraSavings = raiseAmount * (params.raiseSavingsRate / 100);
      let base = balance;
      let scenario = balance;
      for (let i = 1; i <= 36; i++) {
        base += savings;
        scenario += savings + extraSavings;
        if (i % 3 === 0) {
          months.push({ label: `Mês ${i}`, base: Math.max(0, base), scenario: Math.max(0, scenario) });
        }
      }
      const extra3yr = extraSavings * 36;
      return {
        months,
        summary: `Com ${params.raisePercent}% de aumento (+${formatCurrency(raiseAmount)}/mês), poupando ${params.raiseSavingsRate}% do aumento, você acumularia ${formatCurrency(extra3yr)} a mais em 3 anos.`,
        impact: 'positive',
        recommendations: [
          `Invista ${formatCurrency(extraSavings)}/mês extra automaticamente`,
          'Evite inflar o padrão de vida (lifestyle inflation)',
          'Priorize quitação de dívidas ou fundo de emergência primeiro',
        ],
      };
    }

    // aposentadoria
    const yearsToRetire = params.retirementAge - params.currentAge;
    const monthsToRetire = yearsToRetire * 12;
    const annualReturn = params.returnRate / 100;
    const needed = (params.monthlyNeeded * 12) / annualReturn;
    const monthlyReturn = annualReturn / 12;
    const requiredMonthly = needed * monthlyReturn / (Math.pow(1 + monthlyReturn, monthsToRetire) - 1);
    let base = balance;
    let scenario = balance;
    for (let i = 1; i <= Math.min(monthsToRetire, 120); i++) {
      base += savings;
      scenario += requiredMonthly * (1 + monthlyReturn);
      if (i % 12 === 0) {
        months.push({ label: `Ano ${i / 12}`, base: Math.max(0, base), scenario: Math.max(0, scenario) });
      }
    }
    return {
      months,
      summary: `Para se aposentar aos ${params.retirementAge} precisando de ${formatCurrency(params.monthlyNeeded)}/mês, você precisa acumular ${formatCurrency(needed)} com retorno de ${params.returnRate}% ao ano. Investindo ${formatCurrency(requiredMonthly)}/mês por ${yearsToRetire} anos.`,
      impact: requiredMonthly < savings ? 'positive' : 'neutral',
      recommendations: [
        `Meta patrimonial: ${formatCurrency(needed)}`,
        `Investimento mensal necessário: ${formatCurrency(requiredMonthly)}`,
        `Prazo: ${yearsToRetire} anos (${monthsToRetire} meses)`,
      ],
    };
  };

  const result = calcScenario(active);
  const scenario = SCENARIOS.find((s) => s.id === active)!;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Simulador de Cenários "E se?"</h2>
        <p className="text-slate-400 text-sm mt-0.5">Visualize o impacto financeiro de decisões importantes</p>
      </div>

      {/* Scenario selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIOS.map((s) => {
          const locked = s.premium && !isPremium();
          return locked ? (
            <Link
              key={s.id}
              href="/planos"
              className="p-4 rounded-xl border border-amber-500/20 bg-slate-900/50 text-left transition-all hover:border-amber-500/40 relative group"
            >
              <div className="absolute top-3 right-3">
                <Crown size={13} className="text-amber-400" />
              </div>
              <s.icon size={20} className="text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-500 leading-snug">{s.label}</p>
              <p className="text-xs mt-1 text-amber-500/70">Premium — Ver planos</p>
            </Link>
          ) : (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`p-4 rounded-xl border text-left transition-all ${active === s.id ? 'bg-blue-600/20 border-blue-500/40 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
            >
              <s.icon size={20} className={active === s.id ? 'text-blue-400 mb-2' : 'text-slate-500 mb-2'} />
              <p className="text-sm font-medium leading-snug">{s.label}</p>
              <p className="text-xs mt-1 opacity-60">{s.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Parâmetros</h3>
          </div>

          {/* Current snapshot */}
          <div className="bg-slate-800/60 rounded-lg p-3 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between"><span>Renda mensal</span><span className="text-emerald-400">{formatCurrency(income)}</span></div>
            <div className="flex justify-between"><span>Despesas mensais</span><span className="text-red-400">{formatCurrency(expenses)}</span></div>
            <div className="flex justify-between"><span>Saldo atual</span><span className="text-blue-400">{formatCurrency(balance)}</span></div>
          </div>

          {active === 'demissao' && (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Meses desempregado</label>
                <input type="range" min={1} max={24} value={params.monthsUnemployed} onChange={(e) => setParams({ ...params, monthsUnemployed: Number(e.target.value) })} className="w-full" />
                <span className="text-sm text-white">{params.monthsUnemployed} meses</span>
              </div>
            </>
          )}
          {active === 'imovel' && (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Valor do imóvel (R$)</label>
                <input type="number" value={params.propertyValue} onChange={(e) => setParams({ ...params, propertyValue: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Entrada (R$)</label>
                <input type="number" value={params.downPayment} onChange={(e) => setParams({ ...params, downPayment: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Taxa anual (%)</label>
                <input type="number" step={0.1} value={params.loanRate} onChange={(e) => setParams({ ...params, loanRate: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Prazo (anos)</label>
                <input type="range" min={5} max={35} value={params.loanYears} onChange={(e) => setParams({ ...params, loanYears: Number(e.target.value) })} className="w-full" />
                <span className="text-sm text-white">{params.loanYears} anos</span>
              </div>
            </>
          )}
          {active === 'aumento' && (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-1">% de aumento</label>
                <input type="range" min={5} max={100} step={5} value={params.raisePercent} onChange={(e) => setParams({ ...params, raisePercent: Number(e.target.value) })} className="w-full" />
                <span className="text-sm text-white">{params.raisePercent}% (+{formatCurrency(income * params.raisePercent / 100)}/mês)</span>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">% do aumento que vai poupar</label>
                <input type="range" min={10} max={100} step={10} value={params.raiseSavingsRate} onChange={(e) => setParams({ ...params, raiseSavingsRate: Number(e.target.value) })} className="w-full" />
                <span className="text-sm text-white">{params.raiseSavingsRate}%</span>
              </div>
            </>
          )}
          {active === 'aposentadoria' && (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Sua idade atual</label>
                <input type="number" value={params.currentAge} onChange={(e) => setParams({ ...params, currentAge: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Idade desejada de aposentadoria</label>
                <input type="number" value={params.retirementAge} onChange={(e) => setParams({ ...params, retirementAge: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Renda mensal desejada (R$)</label>
                <input type="number" value={params.monthlyNeeded} onChange={(e) => setParams({ ...params, monthlyNeeded: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Retorno anual esperado (%)</label>
                <input type="range" min={4} max={15} step={0.5} value={params.returnRate} onChange={(e) => setParams({ ...params, returnRate: Number(e.target.value) })} className="w-full" />
                <span className="text-sm text-white">{params.returnRate}% ao ano</span>
              </div>
            </>
          )}
        </div>

        {/* Chart + results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Projeção Comparativa</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={result.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v)), ''] as [string, string]}
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                />
                <Legend />
                <Line dataKey="base" name="Cenário atual" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line dataKey="scenario" name={scenario.label} stroke={result.impact === 'negative' ? '#ef4444' : '#10b981'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={`rounded-xl border p-4 sm:p-5 ${result.impact === 'positive' ? 'bg-emerald-500/10 border-emerald-500/30' : result.impact === 'negative' ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
            <div className="flex items-center gap-2 mb-3">
              {result.impact === 'positive' ? <TrendingUp size={16} className="text-emerald-400" /> : result.impact === 'negative' ? <TrendingDown size={16} className="text-red-400" /> : <PiggyBank size={16} className="text-blue-400" />}
              <h3 className="text-sm font-semibold text-white">Resultado do Cenário</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">{result.summary}</p>
            <div className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-blue-400 mt-0.5">→</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
