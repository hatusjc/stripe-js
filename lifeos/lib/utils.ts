import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateStr));
}

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(dateStr: string): boolean {
  return daysUntil(dateStr) < 0;
}

export function getDaysLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d atrasado`;
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  return `Em ${days} dias`;
}

export function getProgressColor(progress: number): string {
  if (progress >= 75) return 'text-emerald-500';
  if (progress >= 40) return 'text-amber-500';
  return 'text-red-500';
}

export function getProgressBarColor(progress: number): string {
  if (progress >= 75) return 'bg-emerald-500';
  if (progress >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/20';
  if (score >= 60) return 'bg-blue-500/20';
  if (score >= 40) return 'bg-amber-500/20';
  return 'bg-red-500/20';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

export const AREA_LABELS: Record<string, string> = {
  financas: 'Finanças',
  familia: 'Família',
  saude: 'Saúde',
  carreira: 'Carreira',
  patrimonio: 'Patrimônio',
  projetos: 'Projetos',
  conhecimento: 'Conhecimento',
  objetivos: 'Objetivos',
  responsabilidades: 'Responsabilidades',
};

export const AREA_COLORS: Record<string, string> = {
  financas: 'emerald',
  familia: 'pink',
  saude: 'green',
  carreira: 'blue',
  patrimonio: 'yellow',
  projetos: 'purple',
  conhecimento: 'cyan',
  objetivos: 'orange',
  responsabilidades: 'red',
};

export const PRIORITY_LABELS: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const PRIORITY_COLORS: Record<string, string> = {
  baixa: 'text-slate-400',
  media: 'text-blue-400',
  alta: 'text-amber-400',
  critica: 'text-red-400',
};

export const STATUS_LABELS: Record<string, string> = {
  planejamento: 'Planejamento',
  em_andamento: 'Em Andamento',
  em_risco: 'Em Risco',
  pausado: 'Pausado',
  concluido: 'Concluído',
  pendente: 'Pendente',
  tomada: 'Tomada',
  revisando: 'Revisando',
  ativo: 'Ativo',
  abandonado: 'Abandonado',
};
