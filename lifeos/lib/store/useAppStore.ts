'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Goal, Responsibility, FamilyEvent, FamilyMember,
  Note, Asset, Decision, HealthMetric, HealthGoal,
  Alert, LifeScore, Task
} from '@/lib/types';
import { generateId } from '@/lib/utils';

interface AppState {
  // Goals
  goals: Goal[];
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;

  // Responsibilities
  responsibilities: Responsibility[];
  addResponsibility: (r: Omit<Responsibility, 'id'>) => void;
  updateResponsibility: (id: string, updates: Partial<Responsibility>) => void;

  // Family
  familyEvents: FamilyEvent[];
  familyMembers: FamilyMember[];
  addFamilyEvent: (e: Omit<FamilyEvent, 'id'>) => void;
  addFamilyMember: (m: Omit<FamilyMember, 'id'>) => void;

  // Knowledge
  notes: Note[];
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  removeNote: (id: string) => void;

  // Assets / Patrimony
  assets: Asset[];
  addAsset: (a: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;

  // Decisions
  decisions: Decision[];
  addDecision: (d: Omit<Decision, 'id' | 'createdAt'>) => void;
  updateDecision: (id: string, updates: Partial<Decision>) => void;

  // Health
  healthMetrics: HealthMetric[];
  healthGoals: HealthGoal[];
  addHealthMetric: (m: Omit<HealthMetric, 'id'>) => void;

  // Alerts
  alerts: Alert[];
  markAlertRead: (id: string) => void;
  dismissAlert: (id: string) => void;

  // Life Score
  lifeScore: LifeScore;

  // Global tasks
  tasks: Task[];
  addTask: (t: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

const future = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const past = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

const now = new Date().toISOString();

const defaultGoals: Goal[] = [
  {
    id: 'g1', title: 'Aumentar renda em 40%', description: 'Diversificar fontes de renda',
    area: 'financas', period: 'anual', progress: 45, targetDate: '2025-12-31', status: 'ativo',
    keyResults: [
      { id: 'kr1', title: 'Renda passiva mensal', targetValue: 5000, currentValue: 1200, unit: 'R$/mês' },
      { id: 'kr2', title: 'Freelances fechados', targetValue: 12, currentValue: 5, unit: 'projetos' },
    ],
  },
  {
    id: 'g2', title: 'Atingir 100kg na academia', description: 'Ganhar massa muscular',
    area: 'saude', period: '90dias', progress: 60, targetDate: future(45), status: 'ativo',
    keyResults: [
      { id: 'kr3', title: 'Peso corporal', targetValue: 100, currentValue: 93, unit: 'kg' },
      { id: 'kr4', title: 'Treinos por semana', targetValue: 5, currentValue: 3, unit: 'dias' },
    ],
  },
  {
    id: 'g3', title: 'Patrimônio de R$ 500k', description: 'Construção patrimonial',
    area: 'patrimonio', period: '5anos', progress: 27, targetDate: '2029-01-01', status: 'ativo',
    keyResults: [
      { id: 'kr5', title: 'Patrimônio total', targetValue: 500000, currentValue: 135250, unit: 'R$' },
    ],
  },
  {
    id: 'g4', title: 'Ler 24 livros no ano', description: 'Aprendizado contínuo',
    area: 'conhecimento', period: 'anual', progress: 50, targetDate: '2025-12-31', status: 'ativo',
    keyResults: [
      { id: 'kr6', title: 'Livros lidos', targetValue: 24, currentValue: 12, unit: 'livros' },
    ],
  },
];

const defaultResponsibilities: Responsibility[] = [
  {
    id: 'r1', title: 'Proteger estabilidade financeira da família',
    description: 'Garantir segurança financeira e cobertura de imprevistos',
    area: 'financas', priority: 'critica',
    relatedGoals: ['g1', 'g3'], relatedProjects: [],
    risks: ['Perda de emprego', 'Gastos médicos inesperados', 'Inflação'],
    costs: 3200, people: ['Cônjuge', 'Filhos'], healthScore: 72,
  },
  {
    id: 'r2', title: 'Educação e desenvolvimento dos filhos',
    description: 'Garantir educação de qualidade e acompanhamento',
    area: 'familia', priority: 'alta',
    relatedGoals: [], relatedProjects: [],
    risks: ['Falta de tempo', 'Custos crescentes'], costs: 1800, people: ['Filhos'], healthScore: 68,
  },
  {
    id: 'r3', title: 'Crescimento profissional contínuo',
    description: 'Manter-se atualizado e evoluir na carreira',
    area: 'carreira', priority: 'alta',
    relatedGoals: ['g1'], relatedProjects: ['p3'],
    risks: ['Mercado de trabalho', 'Obsolescência'], costs: 500, healthScore: 80,
  },
  {
    id: 'r4', title: 'Manter saúde física e mental',
    description: 'Cuidar do corpo e da mente para alta performance',
    area: 'saude', priority: 'alta',
    relatedGoals: ['g2'], relatedProjects: [],
    risks: ['Sedentarismo', 'Estresse crônico'], healthScore: 55,
  },
];

const defaultFamilyEvents: FamilyEvent[] = [
  { id: 'fe1', title: 'Aniversário - Maria', date: future(12), type: 'aniversario', person: 'Maria (esposa)', recurring: true },
  { id: 'fe2', title: 'Consulta pediátrica - Pedro', date: future(5), type: 'saude', person: 'Pedro (filho)', notes: 'Trazer cartão de vacinas' },
  { id: 'fe3', title: 'Reunião escolar', date: future(8), type: 'educacao', person: 'Pedro (filho)' },
  { id: 'fe4', title: 'Viagem Europa', date: future(62), type: 'viagem', notes: 'Confirmado - Lisboa e Madrid' },
];

const defaultFamilyMembers: FamilyMember[] = [
  { id: 'fm1', name: 'Maria Silva', relationship: 'Esposa', birthDate: '1988-06-15' },
  { id: 'fm2', name: 'Pedro Silva', relationship: 'Filho', birthDate: '2016-03-22' },
  { id: 'fm3', name: 'Ana Silva', relationship: 'Filha', birthDate: '2019-09-10' },
];

const defaultNotes: Note[] = [
  {
    id: 'n1', title: 'Estratégia para 2025', content: 'Focar em 3 frentes: renda extra, patrimônio e saúde. Prioridade máxima para lançamento do e-commerce.',
    category: 'Estratégia', tags: ['2025', 'planejamento'], type: 'reflexao',
    createdAt: past(5), updatedAt: past(5),
  },
  {
    id: 'n2', title: 'Livro: A Psicologia do Dinheiro', content: 'Principais aprendizados: riqueza é o que não se vê. Comportamento > Inteligência no campo financeiro.',
    category: 'Leituras', tags: ['finanças', 'livros'], type: 'aprendizado',
    createdAt: past(15), updatedAt: past(10),
  },
  {
    id: 'n3', title: 'Reunião com sócios - Projeto X', content: 'Decisão: adiar lançamento para Q2. Investimento inicial de R$ 50k aprovado.',
    category: 'Reuniões', tags: ['negócio', 'projeto x'], type: 'reuniao',
    createdAt: past(3), updatedAt: past(3),
  },
];

const defaultAssets: Asset[] = [
  { id: 'a1', name: 'Apartamento Centro', type: 'imovel', currentValue: 420000, acquisitionValue: 320000, acquisitionDate: '2019-03-15', description: '75m², 2 quartos' },
  { id: 'a2', name: 'Honda Civic 2023', type: 'veiculo', currentValue: 95000, acquisitionValue: 105000, acquisitionDate: '2023-01-10' },
  { id: 'a3', name: 'Carteira de Ações', type: 'investimento', currentValue: 87600, acquisitionValue: 65000, acquisitionDate: '2020-06-01', description: 'ITSA4, BBAS3, VALE3' },
  { id: 'a4', name: 'Reserva de Emergência', type: 'reserva', currentValue: 47650, acquisitionValue: 47650, acquisitionDate: past(365) },
];

const defaultDecisions: Decision[] = [
  {
    id: 'dec1', title: 'Investir em imóvel ou continuar alugando?',
    context: 'Tenho capital disponível e estou avaliando entre comprar outro apartamento ou continuar investindo em renda variável.',
    alternatives: [
      { id: 'alt1', title: 'Comprar apartamento', pros: ['Patrimônio tangível', 'Proteção contra inflação'], cons: ['Capital imobilizado', 'Baixa liquidez'], score: 7 },
      { id: 'alt2', title: 'Continuar em renda variável', pros: ['Alta liquidez', 'Potencial retorno maior'], cons: ['Volatilidade', 'Risco maior'], score: 8 },
    ],
    risks: ['Alta dos juros', 'Volatilidade do mercado'],
    benefits: ['Construção patrimonial', 'Renda passiva'],
    estimatedCost: 150000,
    expectedImpact: 'Impacto significativo no patrimônio e fluxo de caixa a longo prazo',
    status: 'revisando', createdAt: past(10),
  },
];

const defaultHealthMetrics: HealthMetric[] = [
  { id: 'hm1', type: 'exercicio', value: 45, unit: 'min', date: past(1), notes: 'Musculação - Peitoral' },
  { id: 'hm2', type: 'sono', value: 7.5, unit: 'h', date: past(1) },
  { id: 'hm3', type: 'peso', value: 93, unit: 'kg', date: past(1) },
  { id: 'hm4', type: 'hidratacao', value: 2.5, unit: 'L', date: past(1) },
];

const defaultHealthGoals: HealthGoal[] = [
  { id: 'hg1', title: 'Peso alvo', metric: 'peso', target: 100, current: 93, unit: 'kg' },
  { id: 'hg2', title: 'Treinos semanais', metric: 'exercicio', target: 5, current: 3, unit: 'dias/sem' },
  { id: 'hg3', title: 'Sono mínimo', metric: 'sono', target: 7, current: 7.5, unit: 'h/noite' },
];

const defaultAlerts: Alert[] = [
  {
    id: 'al1', type: 'financeiro', severity: 'warning',
    title: 'Fatura do cartão vencendo', description: 'Cartão Nubank: R$ 4.320 vence em 5 dias',
    area: 'financas', createdAt: now, read: false, actionUrl: '/financas',
  },
  {
    id: 'al2', type: 'projeto', severity: 'critical',
    title: 'Projeto em risco: MBA', description: 'TCC precisa ser entregue em 30 dias',
    area: 'projetos', createdAt: now, read: false, actionUrl: '/projetos',
  },
  {
    id: 'al3', type: 'meta', severity: 'info',
    title: 'Meta de leitura na metade', description: '12 de 24 livros lidos - no prazo!',
    area: 'conhecimento', createdAt: now, read: false, actionUrl: '/objetivos',
  },
  {
    id: 'al4', type: 'familia', severity: 'info',
    title: 'Aniversário em 12 dias', description: 'Aniversário de Maria se aproxima',
    area: 'familia', createdAt: now, read: false, actionUrl: '/familia',
  },
];

const defaultLifeScore: LifeScore = {
  total: 71,
  financas: 68,
  saude: 55,
  familia: 82,
  carreira: 75,
  patrimonio: 63,
  organizacao: 70,
  metas: 72,
  execucao: 78,
  updatedAt: now,
};

const defaultTasks: Task[] = [
  { id: 'dt1', title: 'Revisar orçamento mensal', status: 'pendente', priority: 'alta', area: 'financas', dueDate: future(2) },
  { id: 'dt2', title: 'Agendar consulta médica', status: 'pendente', priority: 'media', area: 'saude', dueDate: future(7) },
  { id: 'dt3', title: 'Ligar para advogado - inventário', status: 'em_andamento', priority: 'alta', area: 'familia', dueDate: future(3) },
  { id: 'dt4', title: 'Revisar contrato freelance', status: 'pendente', priority: 'critica', area: 'carreira', dueDate: future(1) },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      goals: defaultGoals,
      addGoal: (g) => set((s) => ({ goals: [...s.goals, { ...g, id: generateId() }] })),
      updateGoal: (id, updates) => set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),

      responsibilities: defaultResponsibilities,
      addResponsibility: (r) => set((s) => ({ responsibilities: [...s.responsibilities, { ...r, id: generateId() }] })),
      updateResponsibility: (id, updates) => set((s) => ({
        responsibilities: s.responsibilities.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      })),

      familyEvents: defaultFamilyEvents,
      familyMembers: defaultFamilyMembers,
      addFamilyEvent: (e) => set((s) => ({ familyEvents: [...s.familyEvents, { ...e, id: generateId() }] })),
      addFamilyMember: (m) => set((s) => ({ familyMembers: [...s.familyMembers, { ...m, id: generateId() }] })),

      notes: defaultNotes,
      addNote: (n) => {
        const now2 = new Date().toISOString();
        set((s) => ({ notes: [{ ...n, id: generateId(), createdAt: now2, updatedAt: now2 }, ...s.notes] }));
      },
      updateNote: (id, updates) => set((s) => ({
        notes: s.notes.map((n) => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
      })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      assets: defaultAssets,
      addAsset: (a) => set((s) => ({ assets: [...s.assets, { ...a, id: generateId() }] })),
      updateAsset: (id, updates) => set((s) => ({ assets: s.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),

      decisions: defaultDecisions,
      addDecision: (d) => set((s) => ({ decisions: [...s.decisions, { ...d, id: generateId(), createdAt: new Date().toISOString() }] })),
      updateDecision: (id, updates) => set((s) => ({ decisions: s.decisions.map((d) => (d.id === id ? { ...d, ...updates } : d)) })),

      healthMetrics: defaultHealthMetrics,
      healthGoals: defaultHealthGoals,
      addHealthMetric: (m) => set((s) => ({ healthMetrics: [{ ...m, id: generateId() }, ...s.healthMetrics] })),

      alerts: defaultAlerts,
      markAlertRead: (id) => set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)) })),
      dismissAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

      lifeScore: defaultLifeScore,
      tasks: defaultTasks,
      addTask: (t) => set((s) => ({ tasks: [...s.tasks, { ...t, id: generateId() }] })),
      updateTask: (id, updates) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
    }),
    { name: 'lifeos-app' }
  )
);
