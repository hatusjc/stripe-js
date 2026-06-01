'use client';

import { useState, useRef, useEffect } from 'react';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { useBudgetStore } from '@/lib/store/budgetStore';
import { useCheckinStore } from '@/lib/store/checkinStore';
import { usePlanStore } from '@/lib/store/planStore';
import { formatCurrency, cn } from '@/lib/utils';
import { parseActions, executeAIAction, ACTION_LABELS, AIAction } from '@/lib/ai/actionExecutor';
import { PremiumGate } from '@/components/plan/PremiumGate';
import { Zap, Send, RefreshCw, RotateCcw, Crown, Check, X, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  actions?: AIAction[];
  actionResults?: { action: AIAction; executed: boolean; result?: string }[];
}

const FREE_AI_LIMIT = 10;

const QUICK_ACTIONS = [
  { label: '📊 Como está minha vida?', text: 'Faça uma análise completa da minha situação atual de vida.' },
  { label: '💰 Análise financeira', text: 'Analise minha situação financeira detalhadamente. Onde estou bem e onde preciso melhorar?' },
  { label: '🎯 Próximos passos', text: 'Quais são os 3 próximos passos mais importantes que devo tomar agora?' },
  { label: '⚠️ Pontos críticos', text: 'Quais são os maiores riscos e problemas que devo resolver urgentemente?' },
  { label: '📅 Planejar semana', text: 'Me ajude a planejar minha semana com base nos meus projetos, objetivos e responsabilidades.' },
  { label: '💡 Oportunidades', text: 'Que oportunidades você enxerga nos meus dados que eu talvez esteja perdendo?' },
];

const CRUD_EXAMPLES = [
  'Adiciona uma despesa de R$85 no supermercado hoje',
  'Cria um projeto "Academia" na área de saúde com prioridade alta',
  'Registra que corri 5km hoje por 45 minutos',
  'Adiciona um objetivo de economizar R$20.000 em 1 ano',
  'Agenda o aniversário da Maria para 15 de março',
  'Cria uma nota sobre a regra dos 50/30/20',
];

function buildFullContext(
  financeStore: ReturnType<typeof useFinanceStore.getState>,
  projectStore: ReturnType<typeof useProjectStore.getState>,
  appStore: ReturnType<typeof useAppStore.getState>,
  budgetStore: ReturnType<typeof useBudgetStore.getState>,
  checkinStore: ReturnType<typeof useCheckinStore.getState>,
): string {
  const income = financeStore.getMonthlyIncome();
  const expenses = financeStore.getMonthlyExpenses();
  const balance = financeStore.getTotalBalance();
  const totalDebt = financeStore.debts.reduce((s, d) => s + d.remainingAmount, 0);
  const activeGoals = appStore.goals.filter((g) => g.status === 'ativo');
  const atRiskProjects = projectStore.projects.filter((p) => p.status === 'em_risco');
  const criticalAlerts = appStore.alerts.filter((a) => a.severity === 'critical' && !a.read);
  const overdueTasks = appStore.tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'concluido');
  const lastCheckin = checkinStore.getLastEntry();

  return `## LIFE SCORE: ${appStore.lifeScore.total}/100
Finanças: ${appStore.lifeScore.financas} | Saúde: ${appStore.lifeScore.saude} | Família: ${appStore.lifeScore.familia} | Carreira: ${appStore.lifeScore.carreira} | Patrimônio: ${appStore.lifeScore.patrimonio} | Organização: ${appStore.lifeScore.organizacao} | Metas: ${appStore.lifeScore.metas} | Execução: ${appStore.lifeScore.execucao}

## FINANÇAS
Saldo total: ${formatCurrency(balance)} | Receita mensal: ${formatCurrency(income)} | Despesas: ${formatCurrency(expenses)} | Fluxo: ${formatCurrency(income - expenses)} | Poupança: ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}% | Dívidas: ${formatCurrency(totalDebt)}
Contas: ${financeStore.accounts.map((a) => `${a.name}=${formatCurrency(a.balance)}`).join(', ')}
Dívidas: ${financeStore.debts.map((d) => `${d.creditor}:${formatCurrency(d.remainingAmount)}@${d.interestRate}%`).join(', ') || 'nenhuma'}
Metas financeiras: ${financeStore.goals.map((g) => `${g.title}:${formatCurrency(g.currentAmount)}/${formatCurrency(g.targetAmount)}`).join(', ')}
Transações recentes (10): ${financeStore.transactions.slice(-10).map((t) => `[${t.date}]${t.type==='receita'?'+':'-'}${formatCurrency(t.amount)} ${t.description}(${t.category})`).join(', ')}

## ORÇAMENTO MENSAL
${budgetStore.budgets.map((b) => `${b.name}: limite ${formatCurrency(b.limit)}`).join(', ')}

## PROJETOS (${projectStore.projects.length} total)
${projectStore.projects.map((p) => `[id:${p.id}] ${p.title}: ${p.status} | ${p.progress}% | ${p.area} | ${p.priority} | fim:${p.endDate||'indefinido'}`).join('\n')}
Em risco: ${atRiskProjects.map((p) => p.title).join(', ') || 'nenhum'}

## OBJETIVOS ATIVOS (${activeGoals.length})
${activeGoals.map((g) => `[id:${g.id}] ${g.title}: ${g.progress}% | ${g.area} | prazo:${g.targetDate}`).join('\n')}
${appStore.goals.filter((g) => g.status !== 'ativo').map((g) => `[${g.status}] ${g.title}`).join(', ')}

## RESPONSABILIDADES (${appStore.responsibilities.length})
${appStore.responsibilities.map((r) => `[id:${r.id}] ${r.title}: saúde ${r.healthScore}/100 | ${r.priority} | ${r.area}`).join('\n')}

## TAREFAS
Atrasadas: ${overdueTasks.length} | ${overdueTasks.map((t) => t.title).join(', ') || 'nenhuma'}
Pendentes: ${appStore.tasks.filter((t) => t.status === 'pendente').map((t) => `${t.title}(${t.priority})`).join(', ')}

## FAMÍLIA
Membros: ${appStore.familyMembers.map((m) => `${m.name}(${m.relationship})`).join(', ')}
Próximos eventos: ${appStore.familyEvents.slice(0, 5).map((e) => `${e.title} em ${e.date}(${e.type})`).join(', ')}

## PATRIMÔNIO
${appStore.assets.map((a) => `[id:${a.id}] ${a.name}: ${formatCurrency(a.currentValue)} (${a.type})`).join('\n') || 'Nenhum'}
Total: ${formatCurrency(appStore.assets.reduce((s, a) => s + a.currentValue, 0))}

## SAÚDE
Objetivos: ${appStore.healthGoals.map((g) => `${g.title}: ${g.current}/${g.target}${g.unit}`).join(', ')}
Últimas métricas: ${appStore.healthMetrics.slice(-5).map((m) => `${m.type}:${m.value}${m.unit}@${m.date}`).join(', ')}

## CONHECIMENTO — NOTAS (${appStore.notes.length})
${appStore.notes.slice(-5).map((n) => `[id:${n.id}] "${n.title}" (${n.category})`).join('\n')}

## DECISÕES (${appStore.decisions.length})
${appStore.decisions.slice(-5).map((d) => `[id:${d.id}] ${d.title}: ${d.status}`).join('\n')}

## ALERTAS CRÍTICOS: ${criticalAlerts.length}
${criticalAlerts.map((a) => `${a.title}: ${a.description}`).join('\n') || 'nenhum'}

## ÚLTIMO CHECK-IN
${lastCheckin ? `${lastCheckin.weekLabel} | Life Score: ${lastCheckin.lifeScoreSnapshot} | Destaque: ${lastCheckin.highlights||'n/a'} | Desafio: ${lastCheckin.challenges||'n/a'} | Intenção: ${lastCheckin.intention||'n/a'}` : 'Nenhum check-in realizado ainda'}

## DATA ATUAL
${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
}

function ActionCard({ action, onConfirm, onCancel, executed, result }: {
  action: AIAction;
  onConfirm: () => void;
  onCancel: () => void;
  executed?: boolean;
  result?: string;
}) {
  const meta = ACTION_LABELS[action.type];
  return (
    <div className={cn('rounded-xl border p-3 mt-2 text-xs', executed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-blue-500/10 border-blue-500/30')}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{meta.icon}</span>
          <span className="font-semibold text-white">{meta.label}</span>
        </div>
        {executed && <Check size={14} className="text-emerald-400" />}
      </div>
      <pre className="text-slate-400 text-[10px] overflow-x-auto max-h-24 bg-slate-900/60 rounded p-2 mb-2">
        {JSON.stringify(action.data, null, 2)}
      </pre>
      {executed ? (
        <p className="text-emerald-400 font-medium">{result}</p>
      ) : (
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all">
            <Check size={12} /> Confirmar
          </button>
          <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all">
            <X size={12} /> Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-bold text-white mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-base font-bold text-white mt-4 mb-1">$1</h2>')
    .replace(/^- (.*$)/gm, '<li class="ml-3 list-disc text-slate-300">$1</li>')
    .replace(/\n/g, '<br />');
}

function IACore() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '👋 Olá! Sou a **LifeOS AI Premium**, alimentada pelo Claude.\n\nTenho acesso completo a todos os seus dados e posso **analisar, inserir, editar e organizar** qualquer informação do seu sistema.\n\nExemplos do que posso fazer:\n- "Adiciona uma despesa de R$80 no restaurante hoje"\n- "Cria um projeto de estudar inglês com prazo de dezembro"\n- "Quais são meus maiores riscos financeiros?"\n- "Planeja minha semana"\n\nO que você precisa?',
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCrudExamples, setShowCrudExamples] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const financeStore = useFinanceStore();
  const projectStore = useProjectStore();
  const appStore = useAppStore();
  const budgetStore = useBudgetStore();
  const checkinStore = useCheckinStore();
  const { canSendAI, trackAIMessage, aiRemaining, isPremium } = usePlanStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleActionConfirm = (msgIndex: number, actionIndex: number) => {
    setMessages((prev) => {
      const updated = [...prev];
      const msg = { ...updated[msgIndex] };
      const results = [...(msg.actionResults ?? msg.actions?.map((a) => ({ action: a, executed: false })) ?? [])];
      const entry = results[actionIndex];
      const res = executeAIAction(entry.action);
      results[actionIndex] = { ...entry, executed: true, result: res.message };
      msg.actionResults = results;
      updated[msgIndex] = msg;
      return updated;
    });
  };

  const handleActionCancel = (msgIndex: number, actionIndex: number) => {
    setMessages((prev) => {
      const updated = [...prev];
      const msg = { ...updated[msgIndex] };
      const results = [...(msg.actionResults ?? msg.actions?.map((a) => ({ action: a, executed: false })) ?? [])];
      results[actionIndex] = { ...results[actionIndex], executed: true, result: 'Ação cancelada.' };
      msg.actionResults = results;
      updated[msgIndex] = msg;
      return updated;
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!canSendAI()) return;
    trackAIMessage();

    const context = buildFullContext(financeStore, projectStore, appStore, budgetStore, checkinStore);
    const userMsg: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    const assistantIdx = updatedMessages.length;
    setMessages((prev) => [...prev, { role: 'assistant', content: '', streaming: true }]);
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          enableCrud: true,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIdx] = { ...updated[assistantIdx], content: fullText, streaming: true };
          return updated;
        });
      }

      // Parse actions from the complete response
      const { cleanText, actions } = parseActions(fullText);
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = {
          role: 'assistant',
          content: cleanText || fullText,
          streaming: false,
          actions: actions.length > 0 ? actions : undefined,
          actionResults: actions.length > 0 ? actions.map((a) => ({ action: a, executed: false })) : undefined,
        };
        return updated;
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIdx] = { role: 'assistant', content: '⚠️ Erro ao conectar. Verifique se ANTHROPIC_API_KEY está configurada no .env.local.', streaming: false };
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages((prev) => prev.map((m) => m.streaming ? { ...m, streaming: false } : m));
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages([{
      role: 'assistant',
      content: '👋 Chat reiniciado! Como posso ajudar?',
    }]);
  };

  const remaining = aiRemaining();

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-4 lg:-m-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">LifeOS AI</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 font-bold flex items-center gap-1">
                <Crown size={8} /> Premium
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Análise + CRUD dos seus dados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPremium() && (
            <span className="text-xs text-slate-500">{remaining} msgs restantes</span>
          )}
          <button onClick={resetChat} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors" title="Reiniciar">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Quick actions bar */}
      <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/40 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {QUICK_ACTIONS.map((q) => (
            <button
              key={q.label}
              onClick={() => sendMessage(q.text)}
              className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            >
              {q.label}
            </button>
          ))}
          <button
            onClick={() => setShowCrudExamples(!showCrudExamples)}
            className="shrink-0 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1"
          >
            <Sparkles size={11} /> Inserir dados <ChevronDown size={10} className={showCrudExamples ? 'rotate-180' : ''} />
          </button>
        </div>
        {showCrudExamples && (
          <div className="mt-2 flex flex-wrap gap-2">
            {CRUD_EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => { sendMessage(ex); setShowCrudExamples(false); }} className="px-3 py-1.5 bg-slate-800/80 border border-amber-500/20 hover:border-amber-500/40 text-slate-400 hover:text-amber-300 rounded-lg text-xs transition-all text-left">
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, msgIdx) => (
          <div key={msgIdx} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={13} className="text-white" />
              </div>
            )}
            <div className={cn('max-w-[85%] space-y-1', msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed', msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm')}>
                {msg.role === 'assistant' ? (
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                ) : msg.content}
                {msg.streaming && <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse rounded-sm" />}
              </div>

              {/* Action cards */}
              {msg.actionResults?.map((entry, aIdx) => (
                <ActionCard
                  key={aIdx}
                  action={entry.action}
                  executed={entry.executed}
                  result={entry.result}
                  onConfirm={() => handleActionConfirm(msgIdx, aIdx)}
                  onCancel={() => handleActionCancel(msgIdx, aIdx)}
                />
              ))}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white">U</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/60 shrink-0">
        {!canSendAI() ? (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            <Crown size={16} className="text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-amber-300 font-medium">Limite diário atingido</p>
              <p className="text-xs text-slate-500">Plano gratuito: {FREE_AI_LIMIT} mensagens/dia. Renova à meia-noite.</p>
            </div>
            <Link href="/planos" className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-semibold transition-all">Premium</Link>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder={isPremium() ? 'Peça análises, ou diga o que quer inserir, editar, planejar...' : 'Pergunte algo sobre sua vida...'}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isLoading}
            />
            {isLoading ? (
              <button onClick={stopGeneration} className="flex items-center gap-1.5 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                <RefreshCw size={14} className="animate-spin" /> Parar
              </button>
            ) : (
              <button onClick={() => sendMessage(input)} disabled={!input.trim()} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                <Send size={14} /> Enviar
              </button>
            )}
          </div>
        )}
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          {isPremium() ? 'LifeOS AI Premium · Claude claude-opus-4-8 · Acesso total aos seus dados' : `${remaining} msgs restantes hoje`}
        </p>
      </div>
    </div>
  );
}

export default function IAPage() {
  const { isPremium } = usePlanStore();

  if (!isPremium()) {
    return (
      <div className="space-y-6">
        {/* Free version — limited chat */}
        <FreeLimitedChat />
      </div>
    );
  }

  return <IACore />;
}

function FreeLimitedChat() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '👋 Olá! Sou a **LifeOS AI**.\n\nNo plano gratuito, posso analisar seus dados e responder perguntas (até 10 mensagens por dia).\n\nCom o **Premium**, posso também inserir transações, criar projetos, registrar objetivos e organizar qualquer dado pelo chat.\n\nO que gostaria de saber?',
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const financeStore = useFinanceStore();
  const projectStore = useProjectStore();
  const appStore = useAppStore();
  const { canSendAI, trackAIMessage, aiRemaining } = usePlanStore();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const buildBasicContext = () => {
    const income = financeStore.getMonthlyIncome();
    const expenses = financeStore.getMonthlyExpenses();
    const balance = financeStore.getTotalBalance();
    const activeGoals = appStore.goals.filter((g) => g.status === 'ativo');
    return `Life Score: ${appStore.lifeScore.total}/100 | Saldo: ${formatCurrency(balance)} | Receita: ${formatCurrency(income)} | Despesas: ${formatCurrency(expenses)} | Poupança: ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}% | Projetos: ${projectStore.projects.length} | Objetivos ativos: ${activeGoals.length}`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !canSendAI()) return;
    trackAIMessage();
    const userMsg: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    const idx = updatedMessages.length;
    setMessages((prev) => [...prev, { role: 'assistant', content: '', streaming: true }]);
    abortRef.current = new AbortController();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: buildBasicContext(), enableCrud: false, messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })) }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => { const u = [...prev]; u[idx] = { ...u[idx], content: full }; return u; });
      }
      setMessages((prev) => { const u = [...prev]; u[idx] = { role: 'assistant', content: full, streaming: false }; return u; });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setMessages((prev) => { const u = [...prev]; u[idx] = { role: 'assistant', content: '⚠️ Erro de conexão. Verifique o ANTHROPIC_API_KEY.', streaming: false }; return u; });
      }
    } finally { setIsLoading(false); }
  };

  const remaining = aiRemaining();

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-4 lg:-m-6">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm">LifeOS AI</span>
            <p className="text-[10px] text-slate-500">{remaining} mensagens restantes hoje</p>
          </div>
        </div>
        <Link href="/planos" className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded-lg text-xs font-medium transition-all">
          <Crown size={12} /> Upgrade Premium
        </Link>
      </div>
      <div className="bg-amber-500/5 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-400/80 flex items-center gap-2">
        <Crown size={11} /> <span>Premium: AI também insere, edita e organiza dados pelo chat.</span>
        <Link href="/planos" className="underline font-medium hover:text-amber-300">Ativar →</Link>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0 mt-0.5"><Zap size={13} className="text-white" /></div>}
            <div className={cn('max-w-[85%] rounded-2xl px-4 py-3 text-sm', msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200')}>
              {msg.role === 'assistant' ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} /> : msg.content}
              {msg.streaming && <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse rounded-sm" />}
            </div>
            {msg.role === 'user' && <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white">U</div>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-4 py-3 border-t border-slate-800 shrink-0">
        {!canSendAI() ? (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            <Crown size={16} className="text-amber-400 shrink-0" />
            <div className="flex-1"><p className="text-sm text-amber-300 font-medium">Limite diário atingido</p><p className="text-xs text-slate-500">10 msgs/dia no plano gratuito.</p></div>
            <Link href="/planos" className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold">Premium</Link>
          </div>
        ) : (
          <div className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)} placeholder="Pergunte algo sobre sua vida..." className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500" disabled={isLoading} />
            {isLoading
              ? <button onClick={() => abortRef.current?.abort()} className="flex items-center gap-1.5 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm"><RefreshCw size={14} className="animate-spin" /></button>
              : <button onClick={() => sendMessage(input)} disabled={!input.trim()} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm"><Send size={14} /></button>}
          </div>
        )}
      </div>
    </div>
  );
}
