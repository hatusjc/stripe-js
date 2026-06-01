'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { cn } from '@/lib/utils';
import { Zap, ChevronRight, Check, DollarSign, Target, Users, Heart, Briefcase, Building2 } from 'lucide-react';

const STEPS = [
  { id: 'welcome', title: 'Bem-vindo ao LifeOS' },
  { id: 'areas', title: 'Suas áreas de foco' },
  { id: 'financas', title: 'Situação financeira' },
  { id: 'objetivos', title: 'Seus objetivos' },
  { id: 'concluido', title: 'Tudo pronto!' },
];

const AREAS = [
  { id: 'financas', icon: DollarSign, label: 'Finanças', desc: 'Controle total do dinheiro', color: 'emerald' },
  { id: 'carreira', icon: Briefcase, label: 'Carreira', desc: 'Emprego e negócios', color: 'blue' },
  { id: 'familia', icon: Users, label: 'Família', desc: 'Relacionamentos e casa', color: 'pink' },
  { id: 'saude', icon: Heart, label: 'Saúde', desc: 'Corpo e mente', color: 'green' },
  { id: 'patrimonio', icon: Building2, label: 'Patrimônio', desc: 'Bens e investimentos', color: 'yellow' },
  { id: 'objetivos', icon: Target, label: 'Objetivos', desc: 'Metas e conquistas', color: 'orange' },
];

const colorMap: Record<string, string> = {
  emerald: 'border-emerald-500 bg-emerald-500/15 text-emerald-400',
  blue: 'border-blue-500 bg-blue-500/15 text-blue-400',
  pink: 'border-pink-500 bg-pink-500/15 text-pink-400',
  green: 'border-green-500 bg-green-500/15 text-green-400',
  yellow: 'border-yellow-500 bg-yellow-500/15 text-yellow-400',
  orange: 'border-orange-500 bg-orange-500/15 text-orange-400',
};

export function OnboardingWizard() {
  const { user, completeOnboarding } = useAuthStore();
  const { addAccount } = useFinanceStore();
  const [step, setStep] = useState(0);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['financas', 'objetivos']);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [mainGoal, setMainGoal] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');

  const toggleArea = (id: string) => {
    setSelectedAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    if (monthlyIncome) {
      const income = parseFloat(monthlyIncome.replace(/\D/g, '')) || 0;
      if (income > 0) {
        addAccount({
          name: 'Conta Principal',
          type: 'corrente',
          balance: income,
          institution: 'Meu Banco',
        });
      }
    }
    completeOnboarding({ name: user?.name });
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">LifeOS</span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-slate-400">{STEPS[step].title}</span>
            <span className="text-xs text-slate-500">Passo {step + 1} de {STEPS.length}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 min-h-[340px] flex flex-col">
          {step === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Olá, {user?.name?.split(' ')[0]}!
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                Em menos de 2 minutos vamos configurar o seu LifeOS personalizado. Quanto mais você configurar agora, mais útil o sistema será.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {['Suas áreas', 'Suas finanças', 'Seus objetivos'].map((t, i) => (
                  <div key={t} className="bg-slate-700/50 rounded-lg p-2.5">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-1.5">
                      <span className="text-blue-400 text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-xs text-slate-300">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">Quais áreas são prioridade?</h2>
              <p className="text-sm text-slate-400 mb-5">Selecione as áreas que mais importam para você agora</p>
              <div className="grid grid-cols-2 gap-3">
                {AREAS.map((area) => {
                  const selected = selectedAreas.includes(area.id);
                  return (
                    <button
                      key={area.id}
                      onClick={() => toggleArea(area.id)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                        selected ? colorMap[area.color] : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', selected ? 'bg-white/10' : 'bg-slate-700')}>
                        <area.icon size={16} className={selected ? '' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{area.label}</p>
                        <p className="text-[10px] opacity-70">{area.desc}</p>
                      </div>
                      {selected && <Check size={12} className="ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">Situação financeira</h2>
              <p className="text-sm text-slate-400 mb-6">Dados aproximados para personalizar seu dashboard</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Renda mensal (líquida)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                    <input
                      type="text"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value.replace(/\D/g, ''))}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Meta de poupança mensal</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                    <input
                      type="text"
                      value={savingsGoal}
                      onChange={(e) => setSavingsGoal(e.target.value.replace(/\D/g, ''))}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-600">💡 Você pode alterar isso a qualquer momento em Finanças</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">Seu principal objetivo</h2>
              <p className="text-sm text-slate-400 mb-6">O que você mais quer conquistar nos próximos 12 meses?</p>
              <div className="space-y-3">
                {[
                  'Aumentar minha renda e patrimônio',
                  'Organizar melhor minha vida financeira',
                  'Equilibrar trabalho e família',
                  'Melhorar minha saúde e bem-estar',
                  'Lançar ou escalar meu negócio',
                  'Conquistar minha independência financeira',
                ].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setMainGoal(goal)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                      mainGoal === goal
                        ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                    )}
                  >
                    {mainGoal === goal && <Check size={12} className="inline mr-2 text-blue-400" />}
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Tudo configurado!</h2>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                Seu LifeOS está pronto. Explore o dashboard e comece a registrar seus dados para obter insights personalizados.
              </p>
              <div className="mt-6 bg-slate-700/50 rounded-xl p-4 text-left w-full max-w-sm">
                <p className="text-xs font-medium text-slate-300 mb-2">Próximos passos recomendados:</p>
                <div className="space-y-1.5">
                  {['Adicionar suas contas bancárias', 'Registrar transações do mês', 'Criar seu primeiro projeto', 'Falar com a LifeOS AI'].map((t, i) => (
                    <p key={t} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center text-[9px] text-blue-400 font-bold shrink-0">{i + 1}</span>
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Voltar
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              {step === 0 ? 'Começar' : 'Continuar'}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              Ir para o Dashboard
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
