'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getScoreColor, cn } from '@/lib/utils';
import { Zap, Send, Sparkles, TrendingUp, AlertTriangle, Target, Brain, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  'Como está minha vida atualmente?',
  'Onde estou falhando?',
  'O que merece atenção imediata?',
  'Qual área está piorando?',
  'Estou avançando em direção aos meus objetivos?',
  'Qual é meu próximo passo?',
];

function generateInsight(question: string, financeData: ReturnType<typeof useFinanceStore.getState>, projectData: ReturnType<typeof useProjectStore.getState>, appData: ReturnType<typeof useAppStore.getState>): string {
  const income = financeData.transactions.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
  const expenses = financeData.transactions.filter(t => t.type === 'despesa').reduce((s, t) => s + t.amount, 0);
  const balance = financeData.getTotalBalance();
  const atRisk = projectData.projects.filter(p => p.status === 'em_risco').length;
  const score = appData.lifeScore.total;
  const weakArea = Object.entries({
    Finanças: appData.lifeScore.financas,
    Saúde: appData.lifeScore.saude,
    Família: appData.lifeScore.familia,
    Carreira: appData.lifeScore.carreira,
    Patrimônio: appData.lifeScore.patrimonio,
  }).sort(([, a], [, b]) => a - b)[0];

  const q = question.toLowerCase();

  if (q.includes('como está') || q.includes('vida atualmente')) {
    return `📊 **Resumo da Sua Vida Atual**\n\n**Life Score:** ${score}/100 — ${score >= 75 ? 'Excelente' : score >= 60 ? 'Bom' : 'Precisa de atenção'}\n\n**Finanças:** Saldo total de ${formatCurrency(balance)}. Receita mensal de ${formatCurrency(income)} com despesas de ${formatCurrency(expenses)}, gerando um fluxo positivo de ${formatCurrency(income - expenses)}.\n\n**Projetos:** ${projectData.projects.filter(p => p.status === 'em_andamento').length} em andamento, ${atRisk} em risco.\n\n**Objetivos:** ${appData.goals.filter(g => g.status === 'ativo').length} metas ativas com progresso médio de ${Math.round(appData.goals.reduce((s, g) => s + g.progress, 0) / Math.max(appData.goals.length, 1))}%.\n\n**Ponto de atenção:** Sua área mais fraca é ${weakArea[0]} (${weakArea[1]}/100). Recomendo focar esforços nessa área nos próximos 30 dias.`;
  }

  if (q.includes('falhando') || q.includes('piorando')) {
    return `⚠️ **Áreas que Precisam de Atenção**\n\n1. **${weakArea[0]}** (Score: ${weakArea[1]}/100) — Esta é sua área mais crítica atualmente.\n\n${atRisk > 0 ? `2. **Projetos em Risco** — Você tem ${atRisk} projeto(s) em risco: ${projectData.projects.filter(p => p.status === 'em_risco').map(p => p.title).join(', ')}.\n\n` : ''}3. **Responsabilidades com baixa saúde** — ${appData.responsibilities.filter(r => r.healthScore < 65).map(r => r.title).join(', ')}\n\n**Recomendação:** Priorize ação imediata em ${weakArea[0]}. Reserve 30 minutos hoje para criar um plano de melhoria específico.`;
  }

  if (q.includes('atenção imediata') || q.includes('urgente')) {
    const unread = appData.alerts.filter(a => !a.read && a.severity === 'critical');
    const overdueTasks = appData.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'concluido');
    return `🚨 **Itens que Exigem Atenção Imediata**\n\n${unread.length > 0 ? `**Alertas Críticos:**\n${unread.map(a => `• ${a.title}: ${a.description}`).join('\n')}\n\n` : ''}${overdueTasks.length > 0 ? `**Tarefas Atrasadas (${overdueTasks.length}):**\n${overdueTasks.map(t => `• ${t.title}`).join('\n')}\n\n` : ''}${atRisk > 0 ? `**Projetos em Risco:**\n${projectData.projects.filter(p => p.status === 'em_risco').map(p => `• ${p.title} (${p.progress}% concluído)`).join('\n')}\n\n` : ''}${unread.length === 0 && overdueTasks.length === 0 && atRisk === 0 ? '✅ Nenhum item crítico detectado no momento. Continue mantendo o foco!' : ''}`;
  }

  if (q.includes('objetivos') || q.includes('avançando') || q.includes('metas')) {
    const goals = appData.goals.filter(g => g.status === 'ativo');
    const avgProgress = Math.round(goals.reduce((s, g) => s + g.progress, 0) / Math.max(goals.length, 1));
    const onTrack = goals.filter(g => g.progress >= 40);
    const lagging = goals.filter(g => g.progress < 40);
    return `🎯 **Análise dos Seus Objetivos**\n\n**Progresso médio:** ${avgProgress}% em ${goals.length} metas ativas\n\n**No prazo (${onTrack.length}):**\n${onTrack.map(g => `✅ ${g.title} — ${g.progress}%`).join('\n')}\n\n${lagging.length > 0 ? `**Atrasados (${lagging.length}):**\n${lagging.map(g => `⚠️ ${g.title} — ${g.progress}%`).join('\n')}\n\n` : ''}**Recomendação:** ${lagging.length > 0 ? `Priorize "${lagging[0].title}" — está abaixo do esperado. Revise suas ações e considere ajustar o prazo ou aumentar a intensidade.` : 'Continue no ritmo! Seus objetivos estão evoluindo bem.'}`;
  }

  if (q.includes('próximo passo') || q.includes('fazer')) {
    const topTasks = appData.tasks.filter(t => t.status !== 'concluido' && t.priority === 'critica').slice(0, 3);
    const riskProjects = projectData.projects.filter(p => p.status === 'em_risco');
    return `🚀 **Seu Próximo Passo Estratégico**\n\nBaseado na análise da sua situação atual:\n\n**Ação Imediata (hoje):**\n${topTasks.length > 0 ? topTasks.map(t => `• ${t.title}`).join('\n') : '• Revise suas tarefas prioritárias'}\n\n**Esta semana:**\n${riskProjects.length > 0 ? `• Agendar revisão dos projetos em risco: ${riskProjects.map(p => p.title).join(', ')}\n` : ''}• Registrar pelo menos 3 métricas de saúde\n• Revisar orçamento do mês\n\n**Este mês:**\n• Focar em melhorar a área "${weakArea[0]}" (score atual: ${weakArea[1]})\n• Agendar revisão estratégica de todos os objetivos\n\n💡 **Insight:** Sua maior oportunidade de crescimento está em ${weakArea[0]}.`;
  }

  return `🤖 **LifeOS AI**\n\nAnalisei seus dados e posso ver que você está gerenciando múltiplas frentes com um Life Score de **${score}/100**.\n\nSeu saldo atual é de ${formatCurrency(balance)}, com ${projectData.projects.filter(p => p.status === 'em_andamento').length} projetos ativos e ${appData.goals.filter(g => g.status === 'ativo').length} objetivos em andamento.\n\nPara uma análise mais específica, tente perguntar:\n• "Como está minha vida atualmente?"\n• "Onde estou falhando?"\n• "Qual é meu próximo passo?"`;
}

export default function IAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Olá! Sou a **LifeOS AI**, sua assistente inteligente pessoal.\n\nTenho acesso a todos os seus dados — finanças, projetos, objetivos, responsabilidades e saúde — e posso ajudá-lo a entender sua situação atual e tomar melhores decisões.\n\nO que você gostaria de saber hoje?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const financeStore = useFinanceStore();
  const projectStore = useProjectStore();
  const appStore = useAppStore();

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const response = generateInsight(text, financeStore, projectStore, appStore);
    const assistantMsg: Message = { role: 'assistant', content: response, timestamp: new Date() };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-white mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
      }
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
      return <p key={i} className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            LifeOS AI
          </h2>
          <p className="text-sm text-slate-400">Seu assistente inteligente pessoal</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                Perguntas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs text-slate-300 hover:text-white p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all border border-slate-700/50 hover:border-slate-600"
                >
                  {q}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Life Score quick view */}
          <Card>
            <CardHeader>
              <CardTitle>Life Score Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[85%] rounded-xl p-3',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 border border-slate-700'
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="space-y-0.5">
                        {formatContent(msg.content)}
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <p className="text-[10px] mt-2 opacity-40">
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw size={14} className="text-blue-400 animate-spin" />
                      <span className="text-xs text-slate-400">Analisando seus dados...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                  placeholder="Pergunte algo sobre sua vida..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                />
                <Button
                  variant="primary"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  icon={<Send size={14} />}
                >
                  Enviar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
