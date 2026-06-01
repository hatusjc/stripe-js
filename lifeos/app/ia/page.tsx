'use client';

import { useState, useRef, useEffect } from 'react';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, getScoreColor, cn } from '@/lib/utils';
import { Zap, Send, Sparkles, RefreshCw, RotateCcw, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

const QUICK_QUESTIONS = [
  'Como está minha vida atualmente?',
  'Onde estou falhando?',
  'O que merece atenção imediata?',
  'Qual área está piorando?',
  'Estou avançando nos meus objetivos?',
  'Qual é meu próximo passo?',
  'Analise minha situação financeira',
  'Quais riscos devo gerenciar esta semana?',
];

function buildContext(
  financeStore: ReturnType<typeof useFinanceStore.getState>,
  projectStore: ReturnType<typeof useProjectStore.getState>,
  appStore: ReturnType<typeof useAppStore.getState>
): string {
  const income = financeStore.getMonthlyIncome();
  const expenses = financeStore.getMonthlyExpenses();
  const balance = financeStore.getTotalBalance();
  const totalDebt = financeStore.debts.reduce((s, d) => s + d.remainingAmount, 0);

  const activeGoals = appStore.goals.filter((g) => g.status === 'ativo');
  const atRiskProjects = projectStore.projects.filter((p) => p.status === 'em_risco');
  const criticalAlerts = appStore.alerts.filter((a) => a.severity === 'critical' && !a.read);
  const overdueTasks = appStore.tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'concluido');

  return `## DADOS DO USUÁRIO

### Life Score: ${appStore.lifeScore.total}/100
- Finanças: ${appStore.lifeScore.financas}/100
- Saúde: ${appStore.lifeScore.saude}/100
- Família: ${appStore.lifeScore.familia}/100
- Carreira: ${appStore.lifeScore.carreira}/100
- Patrimônio: ${appStore.lifeScore.patrimonio}/100
- Organização: ${appStore.lifeScore.organizacao}/100
- Metas: ${appStore.lifeScore.metas}/100
- Execução: ${appStore.lifeScore.execucao}/100

### Finanças
- Saldo total: ${formatCurrency(balance)}
- Receita mensal: ${formatCurrency(income)}
- Despesas mensais: ${formatCurrency(expenses)}
- Fluxo de caixa: ${formatCurrency(income - expenses)}
- Total de dívidas: ${formatCurrency(totalDebt)}
- Taxa de poupança: ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}%
- Contas: ${financeStore.accounts.map((a) => `${a.name} (${formatCurrency(a.balance)})`).join(', ')}
- Dívidas: ${financeStore.debts.map((d) => `${d.creditor}: ${formatCurrency(d.remainingAmount)} a ${d.interestRate}% a.m.`).join(', ')}

### Metas Financeiras
${financeStore.goals.map((g) => `- ${g.title}: ${formatCurrency(g.currentAmount)} de ${formatCurrency(g.targetAmount)} (${Math.round(g.currentAmount / g.targetAmount * 100)}%)`).join('\n')}

### Projetos (${projectStore.projects.length} total)
${projectStore.projects.map((p) => `- ${p.title}: ${p.status} | ${p.progress}% | Área: ${p.area} | Prioridade: ${p.priority}`).join('\n')}

### Projetos em Risco: ${atRiskProjects.length}
${atRiskProjects.map((p) => `- ${p.title}`).join('\n') || 'Nenhum'}

### Objetivos Ativos (${activeGoals.length})
${activeGoals.map((g) => `- ${g.title}: ${g.progress}% | ${g.area} | Prazo: ${g.targetDate}`).join('\n')}

### Responsabilidades (${appStore.responsibilities.length})
${appStore.responsibilities.map((r) => `- ${r.title}: saúde ${r.healthScore}/100 | prioridade: ${r.priority}`).join('\n')}

### Alertas Críticos: ${criticalAlerts.length}
${criticalAlerts.map((a) => `- ${a.title}: ${a.description}`).join('\n') || 'Nenhum'}

### Tarefas Atrasadas: ${overdueTasks.length}
${overdueTasks.map((t) => `- ${t.title}`).join('\n') || 'Nenhuma'}

### Família
- Membros: ${appStore.familyMembers.map((m) => m.name + ' (' + m.relationship + ')').join(', ')}
- Próximos eventos: ${appStore.familyEvents.slice(0, 3).map((e) => `${e.title} em ${e.date}`).join(', ')}

### Patrimônio
${appStore.assets.map((a) => `- ${a.name}: ${formatCurrency(a.currentValue)} (${a.type})`).join('\n')}

### Saúde — últimas métricas
${appStore.healthMetrics.slice(0, 4).map((m) => `- ${m.type}: ${m.value} ${m.unit}`).join('\n')}`;
}

export default function IAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Olá! Sou a **LifeOS AI**, alimentada pelo Claude.\n\nTenho acesso completo aos seus dados — finanças, projetos, objetivos, responsabilidades, família e saúde — e posso analisar sua situação em tempo real.\n\nO que você gostaria de saber hoje?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const financeStore = useFinanceStore();
  const projectStore = useProjectStore();
  const appStore = useAppStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const context = buildContext(financeStore, projectStore, appStore);
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
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error('Falha na resposta da API');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m, i) => i === assistantIdx ? { ...m, content: accumulated, streaming: true } : m)
        );
      }

      setMessages((prev) =>
        prev.map((m, i) => i === assistantIdx ? { ...m, content: accumulated, streaming: false } : m)
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === assistantIdx ? { ...m, content: '⚠️ Não foi possível conectar à IA. Verifique se a chave `ANTHROPIC_API_KEY` está configurada no `.env.local`.', streaming: false } : m
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages((prev) => prev.map((m) => ({ ...m, streaming: false })));
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Conversa reiniciada. Como posso ajudar?',
    }]);
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) return <p key={i} className="font-bold text-white text-base mt-3 mb-1">{line.slice(3)}</p>;
      if (line.startsWith('### ')) return <p key={i} className="font-semibold text-blue-300 text-sm mt-2 mb-0.5">{line.slice(4)}</p>;
      if (line.startsWith('- ') || line.startsWith('• ')) return (
        <p key={i} className="text-sm text-slate-300 pl-3 flex items-start gap-1.5">
          <span className="text-blue-400 shrink-0 mt-1">·</span>
          <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
        </p>
      );
      const html = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
      return line ? <p key={i} className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} /> : <div key={i} className="h-1.5" />;
    });
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            LifeOS AI
          </h2>
          <p className="text-sm text-slate-400">Powered by Claude · Análise em tempo real dos seus dados</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 bg-slate-800 rounded-lg">
            <RotateCcw size={12} /> Limpar
          </button>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        {/* Quick questions + score */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={13} className="text-amber-400" />
                Perguntas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="w-full text-left text-xs text-slate-300 hover:text-white p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all border border-slate-700/50 hover:border-slate-600 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Life Score</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {Object.entries({
                Finanças: appStore.lifeScore.financas,
                Saúde: appStore.lifeScore.saude,
                Família: appStore.lifeScore.familia,
                Carreira: appStore.lifeScore.carreira,
                Patrimônio: appStore.lifeScore.patrimonio,
              }).map(([area, score]) => (
                <div key={area} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{area}</span>
                  <span className={cn('text-xs font-bold', getScoreColor(score))}>{score}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[520px]">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mt-1">
                      <Zap size={13} className="text-white" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[88%] rounded-2xl px-4 py-3',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-800 border border-slate-700 rounded-tl-sm'
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="space-y-0.5">
                        {renderContent(msg.content)}
                        {msg.streaming && (
                          <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5 rounded-sm" />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                      <User size={13} className="text-slate-400" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                  placeholder="Pergunte algo sobre sua vida..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                />
                {isLoading ? (
                  <button
                    onClick={stopGeneration}
                    className="flex items-center gap-1.5 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  >
                    <RefreshCw size={14} className="animate-spin" />
                    <span className="hidden sm:block">Parar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim()}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  >
                    <Send size={14} />
                    <span className="hidden sm:block">Enviar</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-600 mt-2 text-center">
                Configure ANTHROPIC_API_KEY no .env.local para ativar a IA completa
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
