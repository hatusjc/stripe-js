'use client';

import { useState } from 'react';
import { usePlanStore } from '@/lib/store/planStore';
import { Crown, Check, X, Zap, Shield, Wifi, Heart, Bell, Building2, TrendingUp, PiggyBank, Brain, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const FREE_FEATURES = [
  { label: 'Dashboard com Life Score', included: true },
  { label: 'Finanças — controle de transações', included: true },
  { label: 'Projetos, Objetivos e Responsabilidades', included: true },
  { label: 'Patrimônio, Família e Saúde', included: true },
  { label: 'Conhecimento e Decisões', included: true },
  { label: 'Orçamento por categoria (até 4 categorias)', included: true },
  { label: 'Cenários "E se?" (2 de 4 cenários)', included: true },
  { label: 'Check-in Semanal', included: true },
  { label: 'Relatório Semanal', included: true },
  { label: 'LifeOS AI (10 mensagens/dia)', included: true },
  { label: 'Espaço do Casal', included: false },
  { label: 'Modo Offline (PWA)', included: false },
  { label: 'Notificações Bancárias', included: false },
  { label: 'Open Finance Brasil', included: false },
  { label: 'Importação de CSV', included: false },
  { label: 'Backup automático (Supabase)', included: false },
];

const PREMIUM_FEATURES = [
  { label: 'Tudo do plano Gratuito', included: true },
  { label: 'Orçamento: categorias ilimitadas', included: true },
  { label: 'Todos os 4 cenários financeiros', included: true },
  { label: 'LifeOS AI ilimitado', included: true },
  { label: 'Espaço do Casal', included: true, highlight: true },
  { label: 'Modo Offline + PWA instalável', included: true, highlight: true },
  { label: 'Notificações Bancárias automáticas', included: true, highlight: true },
  { label: 'Open Finance Brasil', included: true, highlight: true },
  { label: 'Importação de CSV', included: true },
  { label: 'Backup automático (Supabase)', included: true },
  { label: 'Suporte prioritário', included: true },
];

const HIGHLIGHTS = [
  { icon: Heart, label: 'Espaço do Casal', desc: 'Espaços privados e compartilhados com seu cônjuge. Notificações em tempo real de qualquer mudança.' },
  { icon: Wifi, label: 'Offline + PWA', desc: 'Instale no celular como app nativo. Funciona sem internet — seus dados sempre disponíveis.' },
  { icon: Bell, label: 'Notificações Bancárias', desc: 'Capture transações do SMS/push dos seus bancos e aprove com um clique.' },
  { icon: Building2, label: 'Open Finance', desc: 'Conecte suas contas bancárias diretamente via Open Finance Brasil (BCB).' },
  { icon: TrendingUp, label: 'Todos os Cenários', desc: 'Simule demissão, compra de imóvel, aumento salarial e aposentadoria antecipada.' },
  { icon: Brain, label: 'AI ilimitada', desc: 'Converse sem limite com seu assistente LifeOS AI treinado nos seus dados.' },
];

export default function PlanosPage() {
  const { plan, isPremium, upgradeToPremium, downgradeToFree } = usePlanStore();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [showConfirm, setShowConfirm] = useState<'upgrade' | 'downgrade' | null>(null);

  const monthlyPrice = 29.90;
  const yearlyPrice = 249;
  const yearlyMonthly = (yearlyPrice / 12).toFixed(2);

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-amber-400 text-sm font-medium mb-2">
          <Crown size={14} /> Planos LifeOS
        </div>
        <h2 className="text-3xl font-bold text-white">Escolha seu plano</h2>
        <p className="text-slate-400">Comece grátis. Faça upgrade quando precisar de mais poder.</p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex gap-1">
          <button
            onClick={() => setBilling('monthly')}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all', billing === 'monthly' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300')}
          >
            Mensal
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2', billing === 'yearly' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300')}
          >
            Anual
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-1.5 py-0.5 font-bold">-30%</span>
          </button>
        </div>
      </div>

      {/* Current plan banner */}
      {plan !== 'free' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
          <Crown size={16} className="text-amber-400" />
          <span className="text-amber-300 text-sm font-medium">Você está no plano Premium — obrigado por apoiar o LifeOS!</span>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free */}
        <div className={cn('bg-slate-900 border rounded-2xl p-6 flex flex-col', plan === 'free' ? 'border-blue-500/50' : 'border-slate-800')}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-blue-400" />
                <span className="text-white font-bold text-lg">Gratuito</span>
              </div>
              {plan === 'free' && (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5 font-bold uppercase">Plano atual</span>
              )}
            </div>
            <div className="mt-3">
              <span className="text-4xl font-bold text-white">R$0</span>
              <span className="text-slate-500 text-sm ml-2">para sempre</span>
            </div>
            <p className="text-slate-400 text-sm mt-2">Acesso completo às funcionalidades essenciais do LifeOS.</p>
          </div>

          <div className="flex-1 space-y-2.5 mb-6">
            {FREE_FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-2.5">
                {f.included
                  ? <Check size={15} className="text-emerald-400 shrink-0" />
                  : <X size={15} className="text-slate-700 shrink-0" />}
                <span className={cn('text-sm', f.included ? 'text-slate-300' : 'text-slate-600')}>{f.label}</span>
              </div>
            ))}
          </div>

          {plan === 'free' ? (
            <div className="py-3 text-center text-slate-500 text-sm border border-slate-800 rounded-xl">Plano atual</div>
          ) : (
            <button
              onClick={() => setShowConfirm('downgrade')}
              className="py-3 text-slate-400 hover:text-slate-200 text-sm border border-slate-700 rounded-xl transition-colors"
            >
              Fazer downgrade
            </button>
          )}
        </div>

        {/* Premium */}
        <div className="relative bg-gradient-to-b from-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-6 flex flex-col shadow-xl shadow-amber-500/5">
          {/* Popular badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
              ⭐ Mais popular
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-amber-400" />
                <span className="text-white font-bold text-lg">Premium</span>
              </div>
              {plan === 'premium' && (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 font-bold uppercase">Plano atual</span>
              )}
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                R${billing === 'monthly' ? monthlyPrice.toFixed(2).replace('.', ',') : yearlyMonthly.replace('.', ',')}
              </span>
              <span className="text-slate-500 text-sm mb-1">/mês</span>
            </div>
            {billing === 'yearly' && (
              <p className="text-xs text-emerald-400 mt-1">R${yearlyPrice} cobrado anualmente — economize R${(monthlyPrice * 12 - yearlyPrice).toFixed(0)}/ano</p>
            )}
            <p className="text-slate-400 text-sm mt-2">Acesso completo + recursos exclusivos para quem leva a vida a sério.</p>
          </div>

          <div className="flex-1 space-y-2.5 mb-6">
            {PREMIUM_FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-2.5">
                <Check size={15} className={f.highlight ? 'text-amber-400 shrink-0' : 'text-emerald-400 shrink-0'} />
                <span className={cn('text-sm', f.highlight ? 'text-amber-300 font-medium' : 'text-slate-300')}>{f.label}</span>
                {f.highlight && <Crown size={10} className="text-amber-400/60 shrink-0" />}
              </div>
            ))}
          </div>

          {plan === 'premium' ? (
            <div className="py-3 text-center text-amber-400 text-sm border border-amber-500/30 rounded-xl bg-amber-500/5">
              <Crown size={13} className="inline mr-1.5" />Plano atual — ativo
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm('upgrade')}
              className="py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20"
            >
              Ativar Premium →
            </button>
          )}
        </div>
      </div>

      {/* Premium exclusive highlights */}
      <div>
        <h3 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Recursos exclusivos Premium</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
              <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                <h.icon size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{h.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h3 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider">Perguntas frequentes</h3>
        {[
          { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem multa, sem período de fidelidade. Se cancelar, mantém o Premium até o fim do período pago.' },
          { q: 'Meus dados ficam seguros?', a: 'Todos os dados ficam localmente no seu dispositivo (localStorage). Com Supabase habilitado, é feito backup criptografado na nuvem.' },
          { q: 'O que acontece com meus dados se eu fizer downgrade?', a: 'Nada é apagado. Você continua vendo todos os dados, apenas perde acesso aos recursos exclusivos Premium.' },
          { q: 'O plano gratuito tem limite de tempo?', a: 'Não. O plano gratuito é para sempre, sem trial que expira.' },
        ].map((item) => (
          <div key={item.q} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-sm font-medium text-white mb-1">{item.q}</p>
            <p className="text-sm text-slate-400">{item.a}</p>
          </div>
        ))}
      </div>

      {/* Confirm modals */}
      {showConfirm === 'upgrade' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center">
              <Crown size={32} className="text-amber-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Ativar Premium</h3>
              <p className="text-slate-400 text-sm mt-2">
                {billing === 'monthly'
                  ? 'R$29,90/mês — cancele quando quiser.'
                  : `R$${yearlyPrice}/ano (R$${yearlyMonthly}/mês).`}
              </p>
              <p className="text-xs text-slate-600 mt-1">(Demonstração — sem cobrança real)</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancelar</button>
              <button
                onClick={() => { upgradeToPremium(); setShowConfirm(null); }}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold"
              >
                Ativar agora
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm === 'downgrade' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center">
              <Shield size={32} className="text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Fazer downgrade para Gratuito</h3>
              <p className="text-slate-400 text-sm mt-2">Você perderá acesso ao Espaço do Casal, Modo Offline, Notificações Bancárias e Open Finance. Seus dados são mantidos.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Manter Premium</button>
              <button
                onClick={() => { downgradeToFree(); setShowConfirm(null); }}
                className="flex-1 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-sm font-medium"
              >
                Confirmar downgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
