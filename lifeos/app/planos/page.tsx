'use client';

import { useState, useEffect } from 'react';
import { usePlanStore } from '@/lib/store/planStore';
import {
  Crown, Check, X, Zap, Heart, Wifi, Bell, Building2,
  TrendingUp, Brain, Shield, AlertCircle, ChevronRight,
  Star, Download, Smartphone, FileText, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const PAINS = [
  {
    icon: '💸',
    pain: 'Você sabe exatamente pra onde foi cada real do seu salário esse mês?',
    solution: 'Com o Premium, Open Finance conecta seus bancos e registra tudo automaticamente.',
  },
  {
    icon: '👫',
    pain: 'Seu cônjuge fica no escuro sobre as finanças? Cada um fazendo contas separadas?',
    solution: 'O Espaço do Casal sincroniza tudo em tempo real — sem surpresas no fim do mês.',
  },
  {
    icon: '📱',
    pain: 'Recebeu uma notificação bancária e teve que abrir o app para registrar manualmente?',
    solution: 'Notificações Bancárias Premium capturam e registram a transação com um clique.',
  },
  {
    icon: '📴',
    pain: 'O app fica inútil quando você está sem internet no avião ou no interior?',
    solution: 'Modo Offline Premium: instale como app e use em qualquer lugar, sem internet.',
  },
  {
    icon: '🏖️',
    pain: 'Você sabe exatamente quando pode se aposentar com o padrão de vida atual?',
    solution: 'O Simulador "E se?" Premium calcula seu caminho para a independência financeira.',
  },
];

const COMPARISON = [
  { feature: 'Dashboard com Life Score', free: true, premium: true },
  { feature: 'Finanças — controle de transações', free: true, premium: true },
  { feature: 'Projetos, Objetivos e Responsabilidades', free: true, premium: true },
  { feature: 'Patrimônio, Família e Saúde', free: true, premium: true },
  { feature: 'Conhecimento e Decisões', free: true, premium: true },
  { feature: 'Orçamento (até 4 categorias)', free: true, premium: false },
  { feature: 'Orçamento ilimitado de categorias', free: false, premium: true },
  { feature: 'Cenários "E se?" (2 de 4)', free: true, premium: false },
  { feature: 'Todos os 4 cenários financeiros', free: false, premium: true },
  { feature: 'Check-in Semanal + Relatório', free: true, premium: true },
  { feature: 'LifeOS AI (10 mensagens/dia)', free: true, premium: false },
  { feature: 'LifeOS AI ilimitado + comandos de voz', free: false, premium: true },
  { feature: 'AI que insere e organiza seus dados', free: false, premium: true },
  { feature: 'Exportar relatórios em PDF', free: false, premium: true },
  { feature: 'Espaço do Casal', free: false, premium: true },
  { feature: 'Modo Offline + PWA instalável', free: false, premium: true },
  { feature: 'Notificações Bancárias automáticas', free: false, premium: true },
  { feature: 'Open Finance Brasil', free: false, premium: true },
  { feature: 'Notificações push (orçamento, check-in)', free: false, premium: true },
  { feature: 'Backup automático na nuvem (Supabase)', free: false, premium: true },
];

const HIGHLIGHTS = [
  { icon: Heart, label: 'Espaço do Casal', desc: 'Espaços privados e compartilhados. Notificações em tempo real para o cônjuge.' },
  { icon: Wifi, label: 'Offline + PWA', desc: 'Instale no celular. Funciona sem internet.' },
  { icon: Bell, label: 'Notif. Bancárias', desc: 'Capture do SMS/push dos bancos com um clique.' },
  { icon: Building2, label: 'Open Finance', desc: 'Conecte contas bancárias via BCB Open Finance.' },
  { icon: Brain, label: 'AI com CRUD', desc: 'Peça à IA para inserir, editar e organizar qualquer dado.' },
  { icon: FileText, label: 'PDF ilimitado', desc: 'Exporte relatórios financeiros e semanais em PDF.' },
  { icon: TrendingUp, label: 'Todos os Cenários', desc: 'Simule demissão, imóvel, aumento e aposentadoria.' },
  { icon: Download, label: 'Backup na nuvem', desc: 'Dados sincronizados e protegidos no Supabase.' },
];

function PlanosContent() {
  const { plan, isPremium, isTrialing, daysLeftInTrial, startTrial, upgradeToPremium, downgradeToFree, checkExpiry } = usePlanStore();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [showConfirm, setShowConfirm] = useState<'upgrade' | 'downgrade' | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    checkExpiry();
    // Handle Stripe success redirect
    if (params.get('upgrade') === 'success') {
      if (params.get('mock') === '1') upgradeToPremium();
      router.replace('/planos');
    }
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  const handleTrial = () => {
    startTrial();
    router.push('/');
  };

  const monthly = 29.90;
  const yearly = 249;
  const yearlyMonthly = (yearly / 12).toFixed(2);
  const trialDays = daysLeftInTrial();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Trial banner */}
      {isTrialing() && (
        <div className="bg-amber-500 text-black text-center py-2 text-sm font-semibold">
          🎉 Teste grátis ativo — {trialDays} dias restantes
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-16 pb-20">

        {/* ===== HERO — PAIN SECTION ===== */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 text-red-400 text-sm font-medium">
            <AlertCircle size={14} /> Você tem um problema que talvez não enxerga
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Adultos responsáveis <span className="text-red-400">perdem dinheiro</span><br />
            por falta de visão clara
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Não é falta de esforço. É falta de um sistema. Veja se você se identifica:
          </p>
        </div>

        {/* Pain cards */}
        <div className="space-y-4">
          {PAINS.map((p, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex gap-4 items-start group hover:border-slate-700 transition-colors">
              <span className="text-3xl shrink-0">{p.icon}</span>
              <div className="flex-1">
                <p className="text-white font-medium text-base mb-2">❌ &ldquo;{p.pain}&rdquo;</p>
                <div className="flex items-start gap-2">
                  <Crown size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-300/80 text-sm">{p.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== TRIAL CTA (primary) ===== */}
        {!isPremium() && (
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-5 sm:p-8 md:p-12 text-center space-y-5 sm:space-y-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
              <Crown size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Teste Premium por 15 dias</h2>
              <p className="text-slate-300 text-sm sm:text-lg">Completamente grátis. Sem cartão de crédito. Cancele quando quiser.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-slate-400">
              {['Todos os recursos Premium', 'Sem compromisso', 'Cancele a qualquer momento'].map((t) => (
                <div key={t} className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" />{t}</div>
              ))}
            </div>
            <button
              onClick={handleTrial}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-2xl text-lg font-bold transition-all shadow-2xl shadow-amber-500/30 hover:scale-105"
            >
              <Clock size={20} /> Começar teste grátis de 15 dias →
            </button>
            <p className="text-slate-600 text-sm">Após o teste: R$29,90/mês ou R$249/ano. Sem surpresas.</p>
          </div>
        )}

        {/* ===== PRICING CARDS ===== */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Planos e preços</h2>

          {/* Billing toggle */}
          <div className="flex justify-center">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex gap-1">
              <button onClick={() => setBilling('monthly')} className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all', billing === 'monthly' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300')}>Mensal</button>
              <button onClick={() => setBilling('yearly')} className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2', billing === 'yearly' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300')}>
                Anual <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-1.5 py-0.5 font-bold">-30%</span>
              </button>
            </div>
          </div>

          {plan !== 'free' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 flex items-center gap-3 max-w-lg mx-auto">
              <Crown size={16} className="text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">
                {isTrialing() ? `Período de teste — ${trialDays} dias restantes` : 'Plano Premium ativo — obrigado!'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free card */}
            <div className={cn('bg-slate-900 border rounded-2xl p-6 flex flex-col', plan === 'free' ? 'border-blue-500/40' : 'border-slate-800')}>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Zap size={18} className="text-blue-400" /><span className="text-white font-bold text-lg">Gratuito</span></div>
                  {plan === 'free' && <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5 font-bold">ATUAL</span>}
                </div>
                <div className="flex items-end gap-2 mt-3"><span className="text-4xl font-bold text-white">R$0</span><span className="text-slate-500 text-sm mb-1">para sempre</span></div>
                <p className="text-slate-400 text-sm mt-2">Essencial para começar a organizar sua vida.</p>
              </div>
              <div className="flex-1 space-y-2 mb-5">
                {COMPARISON.filter((f) => f.free).slice(0, 8).map((f) => (
                  <div key={f.feature} className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span className="text-slate-300 text-sm">{f.feature}</span>
                  </div>
                ))}
              </div>
              {plan === 'free'
                ? <div className="py-3 text-center text-slate-500 text-sm border border-slate-800 rounded-xl">Plano atual</div>
                : <button onClick={() => setShowConfirm('downgrade')} className="py-3 text-slate-400 hover:text-slate-200 text-sm border border-slate-700 rounded-xl transition-colors">Fazer downgrade</button>}
            </div>

            {/* Premium card */}
            <div className="relative bg-slate-900 border border-amber-500/40 rounded-2xl p-6 flex flex-col shadow-xl shadow-amber-500/5">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">⭐ Mais completo</span>
              </div>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Crown size={18} className="text-amber-400" /><span className="text-white font-bold text-lg">Premium</span></div>
                  {isPremium() && <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 font-bold">ATUAL</span>}
                </div>
                <div className="flex items-end gap-2 mt-3">
                  <span className="text-4xl font-bold text-white">R${billing === 'monthly' ? '29,90' : yearlyMonthly.replace('.', ',')}</span>
                  <span className="text-slate-500 text-sm mb-1">/mês</span>
                </div>
                {billing === 'yearly' && <p className="text-xs text-emerald-400 mt-1">R${yearly} cobrado anualmente — economize R${(monthly * 12 - yearly).toFixed(0)}/ano</p>}
                <p className="text-slate-400 text-sm mt-2">Tudo do Gratuito + recursos que mudam o jogo.</p>
              </div>
              <div className="flex-1 space-y-2 mb-5">
                {COMPARISON.filter((f) => f.premium && !f.free).slice(0, 9).map((f) => (
                  <div key={f.feature} className="flex items-center gap-2">
                    <Crown size={12} className="text-amber-400 shrink-0" />
                    <span className="text-amber-200 text-sm font-medium">{f.feature}</span>
                  </div>
                ))}
              </div>
              {isPremium()
                ? <div className="py-3 text-center text-amber-400 text-sm border border-amber-500/30 rounded-xl bg-amber-500/5"><Crown size={13} className="inline mr-1.5" />Plano ativo</div>
                : (
                  <div className="space-y-2">
                    <button onClick={handleTrial} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20">
                      Testar 15 dias grátis →
                    </button>
                    <button onClick={() => setShowConfirm('upgrade')} disabled={loading} className="w-full py-2.5 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl text-sm font-medium transition-all">
                      {loading ? 'Redirecionando...' : 'Assinar agora (sem trial)'}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* ===== FEATURE COMPARISON TABLE ===== */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white text-center">Comparação completa</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-800/60 px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Funcionalidade</span>
              <span className="text-center text-blue-400">Gratuito</span>
              <span className="text-center text-amber-400">Premium</span>
            </div>
            {COMPARISON.map((f, i) => (
              <div key={f.feature} className={cn('grid grid-cols-3 px-4 py-3 text-sm border-t border-slate-800/60', i % 2 === 0 ? '' : 'bg-slate-800/20')}>
                <span className="text-slate-300">{f.feature}</span>
                <span className="flex justify-center">{f.free ? <Check size={16} className="text-emerald-400" /> : <X size={16} className="text-slate-700" />}</span>
                <span className="flex justify-center">{f.premium ? <Check size={16} className="text-amber-400" /> : <X size={16} className="text-slate-700" />}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium highlights grid */}
        <div>
          <h2 className="text-xl font-bold text-white text-center mb-6">Recursos exclusivos Premium</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
                <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <h.icon size={16} className="text-amber-400" />
                </div>
                <div><p className="text-sm font-semibold text-white">{h.label}</p><p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{h.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: '⭐⭐⭐⭐⭐', text: '"Finalmente entendi pra onde ia meu dinheiro. Em 1 semana já identifiquei R$800 de gastos desnecessários."', name: 'Carlos M., 34' },
            { emoji: '⭐⭐⭐⭐⭐', text: '"O Espaço do Casal mudou nossa relação financeira. Chega de surpresas no fim do mês."', name: 'Ana & Pedro, SP' },
            { emoji: '⭐⭐⭐⭐⭐', text: '"O simulador de aposentadoria mostrou que posso me aposentar 8 anos antes do que eu pensava."', name: 'Roberto S., 41' },
          ].map((t) => (
            <div key={t.name} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-sm mb-2">{t.emoji}</p>
              <p className="text-slate-300 text-sm italic mb-3">{t.text}</p>
              <p className="text-slate-500 text-xs">— {t.name}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        {!isPremium() && (
          <div className="text-center space-y-4 py-6">
            <h2 className="text-2xl font-bold text-white">Sem mais desculpas. Sua vida organizada começa hoje.</h2>
            <button
              onClick={handleTrial}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-2xl text-lg font-bold transition-all shadow-2xl shadow-amber-500/30 hover:scale-105"
            >
              <Clock size={20} /> Testar grátis por 15 dias
            </button>
            <p className="text-slate-500 text-sm">Sem cartão de crédito. Cancele quando quiser.</p>
          </div>
        )}

        {/* FAQ */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-white text-center mb-4">Perguntas frequentes</h3>
          {[
            { q: 'O teste de 15 dias é realmente grátis?', a: 'Sim. Sem cartão de crédito, sem cobrança. Acesso completo ao Premium por 15 dias. Após o período, você volta automaticamente para o plano gratuito.' },
            { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem multa, sem fidelidade. Se cancelar, mantém o Premium até o fim do período pago.' },
            { q: 'O que acontece com meus dados se fizer downgrade?', a: 'Nada é apagado. Você mantém todos os dados — apenas perde acesso aos recursos exclusivos Premium.' },
            { q: 'Meus dados financeiros ficam seguros?', a: 'Todos os dados ficam localmente no seu dispositivo. Com Supabase habilitado, há backup criptografado na nuvem.' },
          ].map((item) => (
            <div key={item.q} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-1">{item.q}</p>
              <p className="text-sm text-slate-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm modals */}
      {showConfirm === 'upgrade' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center">
              <Crown size={32} className="text-amber-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Assinar Premium</h3>
              <p className="text-slate-400 text-sm mt-2">{billing === 'monthly' ? 'R$29,90/mês' : `R${yearly}/ano`} — cancele quando quiser.</p>
              <p className="text-xs text-slate-600 mt-1">(Demo — sem cobrança real sem Stripe configurado)</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancelar</button>
              <button onClick={() => { handleCheckout(); setShowConfirm(null); }} className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold">Assinar</button>
            </div>
          </div>
        </div>
      )}

      {showConfirm === 'downgrade' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center">
              <Shield size={32} className="text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Fazer downgrade?</h3>
              <p className="text-slate-400 text-sm mt-2">Você perderá acesso ao Casal, Offline, Notificações e Open Finance. Seus dados são mantidos.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Manter Premium</button>
              <button onClick={() => { downgradeToFree(); setShowConfirm(null); }} className="flex-1 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-sm">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-slate-950" />}>
      <PlanosContent />
    </Suspense>
  );
}
