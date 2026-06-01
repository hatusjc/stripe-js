import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { generateId } from '@/lib/utils';

export type AIActionType =
  | 'ADD_TRANSACTION'
  | 'ADD_PROJECT'
  | 'ADD_GOAL'
  | 'ADD_TASK'
  | 'ADD_RESPONSIBILITY'
  | 'ADD_FAMILY_EVENT'
  | 'ADD_ASSET'
  | 'ADD_DECISION'
  | 'ADD_NOTE'
  | 'UPDATE_GOAL_PROGRESS'
  | 'UPDATE_PROJECT_PROGRESS'
  | 'ADD_HEALTH_METRIC';

export interface AIAction {
  type: AIActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  message: string;
  icon: string;
}

export const ACTION_LABELS: Record<AIActionType, { label: string; icon: string }> = {
  ADD_TRANSACTION: { label: 'Adicionar transação', icon: '💰' },
  ADD_PROJECT: { label: 'Criar projeto', icon: '📋' },
  ADD_GOAL: { label: 'Criar objetivo', icon: '🎯' },
  ADD_TASK: { label: 'Adicionar tarefa', icon: '✅' },
  ADD_RESPONSIBILITY: { label: 'Adicionar responsabilidade', icon: '🛡️' },
  ADD_FAMILY_EVENT: { label: 'Adicionar evento familiar', icon: '👨‍👩‍👧' },
  ADD_ASSET: { label: 'Adicionar patrimônio', icon: '🏠' },
  ADD_DECISION: { label: 'Registrar decisão', icon: '🧠' },
  ADD_NOTE: { label: 'Adicionar nota', icon: '📝' },
  UPDATE_GOAL_PROGRESS: { label: 'Atualizar progresso do objetivo', icon: '📈' },
  UPDATE_PROJECT_PROGRESS: { label: 'Atualizar progresso do projeto', icon: '🔄' },
  ADD_HEALTH_METRIC: { label: 'Registrar métrica de saúde', icon: '💪' },
};

export function executeAIAction(action: AIAction): ActionResult {
  try {
    const { data } = action;
    const today = new Date().toISOString().split('T')[0];

    switch (action.type) {
      case 'ADD_TRANSACTION':
        useFinanceStore.getState().addTransaction({
          type: data.type ?? 'despesa',
          category: data.category ?? 'outros',
          description: data.description ?? 'Transação',
          amount: Number(data.amount) || 0,
          date: data.date ?? today,
          recurring: data.recurring ?? false,
          tags: data.tags ?? [],
        });
        return { success: true, message: `${data.type === 'receita' ? 'Receita' : 'Despesa'} de R$${Number(data.amount).toFixed(2)} adicionada.`, icon: '💰' };

      case 'ADD_PROJECT':
        useProjectStore.getState().addProject({
          title: data.title ?? 'Novo Projeto',
          description: data.description ?? '',
          status: 'planejamento',
          priority: data.priority ?? 'media',
          area: data.area ?? 'carreira',
          startDate: today,
          endDate: data.endDate,
          progress: 0,
          milestones: [],
          tasks: [],
          tags: data.tags ?? [],
        });
        return { success: true, message: `Projeto "${data.title}" criado com sucesso.`, icon: '📋' };

      case 'ADD_GOAL':
        useAppStore.getState().addGoal({
          title: data.title ?? 'Novo Objetivo',
          description: data.description ?? '',
          area: data.area ?? 'carreira',
          period: data.period ?? '90dias',
          progress: 0,
          targetDate: data.targetDate ?? data.dueDate ?? today,
          keyResults: [],
          status: 'ativo',
        });
        return { success: true, message: `Objetivo "${data.title}" criado.`, icon: '🎯' };

      case 'ADD_TASK':
        useAppStore.getState().addTask({
          title: data.title ?? 'Nova Tarefa',
          status: 'pendente',
          priority: data.priority ?? 'media',
          dueDate: data.dueDate,
          area: data.area,
          notes: data.notes,
        });
        return { success: true, message: `Tarefa "${data.title}" adicionada.`, icon: '✅' };

      case 'ADD_RESPONSIBILITY':
        useAppStore.getState().addResponsibility({
          title: data.title ?? 'Nova Responsabilidade',
          description: data.description ?? '',
          area: data.area ?? 'carreira',
          priority: data.priority ?? 'media',
          relatedGoals: [],
          relatedProjects: [],
          risks: [],
          costs: data.costs,
          people: data.people ?? [],
          healthScore: 100,
        });
        return { success: true, message: `Responsabilidade "${data.title}" registrada.`, icon: '🛡️' };

      case 'ADD_FAMILY_EVENT':
        useAppStore.getState().addFamilyEvent({
          title: data.title ?? 'Evento',
          date: data.date ?? today,
          type: data.eventType ?? 'outro',
          person: data.person,
          notes: data.notes,
          recurring: data.recurring ?? false,
        });
        return { success: true, message: `Evento "${data.title}" adicionado à agenda familiar.`, icon: '👨‍👩‍👧' };

      case 'ADD_ASSET':
        useAppStore.getState().addAsset({
          name: data.name ?? 'Patrimônio',
          type: data.assetType ?? 'outro',
          currentValue: Number(data.currentValue) || Number(data.value) || 0,
          acquisitionValue: Number(data.acquisitionValue) || Number(data.value) || 0,
          acquisitionDate: data.acquisitionDate ?? today,
          description: data.description,
        });
        return { success: true, message: `Patrimônio "${data.name}" registrado.`, icon: '🏠' };

      case 'ADD_DECISION':
        useAppStore.getState().addDecision({
          title: data.title ?? 'Decisão',
          context: data.context ?? data.description ?? '',
          alternatives: data.alternatives ?? [],
          risks: data.risks ?? [],
          benefits: data.benefits ?? [],
          estimatedCost: data.estimatedCost,
          expectedImpact: data.expectedImpact ?? '',
          status: 'pendente',
        });
        return { success: true, message: `Decisão "${data.title}" registrada.`, icon: '🧠' };

      case 'ADD_NOTE':
        useAppStore.getState().addNote({
          title: data.title ?? 'Nova Nota',
          content: data.content ?? '',
          category: data.category ?? 'geral',
          tags: data.tags ?? [],
          type: data.noteType ?? 'nota',
        });
        return { success: true, message: `Nota "${data.title}" salva no conhecimento.`, icon: '📝' };

      case 'UPDATE_GOAL_PROGRESS':
        useAppStore.getState().updateGoal(data.id, { progress: Number(data.progress) });
        return { success: true, message: `Progresso do objetivo atualizado para ${data.progress}%.`, icon: '📈' };

      case 'UPDATE_PROJECT_PROGRESS':
        useProjectStore.getState().updateProject(data.id, {
          progress: Number(data.progress),
          ...(data.status ? { status: data.status } : {}),
        });
        return { success: true, message: `Progresso do projeto atualizado para ${data.progress}%.`, icon: '🔄' };

      case 'ADD_HEALTH_METRIC':
        useAppStore.getState().addHealthMetric({
          type: data.metricType ?? 'outro',
          value: Number(data.value) || 0,
          unit: data.unit ?? '',
          date: data.date ?? today,
          notes: data.notes,
        });
        return { success: true, message: `Métrica de saúde registrada.`, icon: '💪' };

      default:
        return { success: false, message: 'Ação desconhecida.', icon: '❓' };
    }
  } catch (e) {
    return { success: false, message: `Erro ao executar ação: ${String(e)}`, icon: '❌' };
  }
}

// Parse `<action>JSON</action>` blocks from AI response text
export function parseActions(text: string): { cleanText: string; actions: AIAction[] } {
  const actions: AIAction[] = [];
  const cleanText = text.replace(/<action>([\s\S]*?)<\/action>/g, (_, json) => {
    try {
      const parsed = JSON.parse(json.trim());
      if (parsed.type && parsed.data) actions.push(parsed as AIAction);
    } catch { /* ignore malformed */ }
    return '';
  }).trim();
  return { cleanText, actions };
}
