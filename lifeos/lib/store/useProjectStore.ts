'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Task } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface ProjectState {
  projects: Project[];
  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addTask: (projectId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  getActiveProjects: () => Project[];
  getAtRiskProjects: () => Project[];
}

const today = new Date().toISOString().slice(0, 10);
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

const defaultProjects: Project[] = [
  {
    id: 'p1',
    title: 'Lançamento do E-commerce',
    description: 'Criar loja virtual para vender produtos digitais',
    status: 'em_andamento',
    priority: 'alta',
    area: 'carreira',
    startDate: past(30),
    endDate: future(45),
    progress: 65,
    milestones: [
      { id: 'm1', title: 'Definir produtos', dueDate: past(20), completed: true },
      { id: 'm2', title: 'Criar landing page', dueDate: past(5), completed: true },
      { id: 'm3', title: 'Integrar pagamento', dueDate: future(15), completed: false },
      { id: 'm4', title: 'Lançamento', dueDate: future(45), completed: false },
    ],
    tasks: [
      { id: 'tk1', title: 'Configurar Stripe', status: 'em_andamento', priority: 'critica', projectId: 'p1' },
      { id: 'tk2', title: 'Design da homepage', status: 'concluido', priority: 'alta', projectId: 'p1' },
      { id: 'tk3', title: 'Testes de pagamento', status: 'pendente', priority: 'alta', projectId: 'p1' },
    ],
    tags: ['negócio', 'renda extra'],
  },
  {
    id: 'p2',
    title: 'Reforma da Cozinha',
    description: 'Renovar completamente a cozinha da casa',
    status: 'planejamento',
    priority: 'media',
    area: 'familia',
    startDate: future(30),
    endDate: future(90),
    progress: 10,
    milestones: [
      { id: 'm5', title: 'Contratar arquiteto', dueDate: future(30), completed: false },
      { id: 'm6', title: 'Aprovação do projeto', dueDate: future(50), completed: false },
      { id: 'm7', title: 'Inicio das obras', dueDate: future(70), completed: false },
    ],
    tasks: [
      { id: 'tk4', title: 'Pesquisar materiais', status: 'em_andamento', priority: 'media', projectId: 'p2' },
      { id: 'tk5', title: 'Solicitar 3 orçamentos', status: 'pendente', priority: 'alta', projectId: 'p2' },
    ],
    tags: ['família', 'casa'],
  },
  {
    id: 'p3',
    title: 'Conclusão MBA',
    description: 'Finalizar MBA em Gestão Empresarial',
    status: 'em_risco',
    priority: 'alta',
    area: 'carreira',
    startDate: past(180),
    endDate: future(30),
    progress: 80,
    milestones: [
      { id: 'm8', title: 'Defesa do TCC', dueDate: future(30), completed: false },
    ],
    tasks: [
      { id: 'tk6', title: 'Entregar TCC final', status: 'em_andamento', priority: 'critica', projectId: 'p3' },
      { id: 'tk7', title: 'Preparar apresentação', status: 'pendente', priority: 'alta', projectId: 'p3' },
    ],
    tags: ['educação'],
  },
  {
    id: 'p4',
    title: 'Viagem Família - Europa',
    description: 'Planejamento da viagem de férias para Europa',
    status: 'planejamento',
    priority: 'media',
    area: 'familia',
    startDate: future(60),
    endDate: future(75),
    progress: 25,
    milestones: [
      { id: 'm9', title: 'Comprar passagens', dueDate: future(30), completed: false },
      { id: 'm10', title: 'Reservar hotéis', dueDate: future(45), completed: false },
    ],
    tasks: [
      { id: 'tk8', title: 'Pesquisar destinos', status: 'concluido', priority: 'baixa', projectId: 'p4' },
      { id: 'tk9', title: 'Comparar preços passagens', status: 'em_andamento', priority: 'media', projectId: 'p4' },
    ],
    tags: ['família', 'lazer'],
  },
];

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: defaultProjects,
      addProject: (p) => set((s) => ({ projects: [...s.projects, { ...p, id: generateId() }] })),
      updateProject: (id, updates) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),
      removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      addTask: (projectId, task) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, tasks: [...p.tasks, { ...task, id: generateId() }] } : p
          ),
        })),
      updateTask: (projectId, taskId, updates) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)) }
              : p
          ),
        })),
      getActiveProjects: () => get().projects.filter((p) => p.status === 'em_andamento'),
      getAtRiskProjects: () => get().projects.filter((p) => p.status === 'em_risco'),
    }),
    { name: 'lifeos-projects' }
  )
);
