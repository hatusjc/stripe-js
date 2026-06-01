'use client';

import { useProjectStore } from '@/lib/store/useProjectStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDate, daysUntil, getDaysLabel, cn, STATUS_LABELS, AREA_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/utils';
import { FolderKanban, Plus, Calendar, Flag, CheckCircle2, Circle, AlertTriangle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

type FilterStatus = 'todos' | 'em_andamento' | 'planejamento' | 'em_risco' | 'concluido';

const statusVariant: Record<string, 'info' | 'warning' | 'danger' | 'success' | 'ghost'> = {
  em_andamento: 'info',
  planejamento: 'ghost',
  em_risco: 'danger',
  pausado: 'warning',
  concluido: 'success',
};

export function ProjetosPage() {
  const { projects, updateTask } = useProjectStore();
  const [filter, setFilter] = useState<FilterStatus>('todos');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const filtered = filter === 'todos' ? projects : projects.filter((p) => p.status === filter);

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'em_andamento').length,
    risk: projects.filter((p) => p.status === 'em_risco').length,
    done: projects.filter((p) => p.status === 'concluido').length,
  };

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'em_andamento', label: 'Em Andamento' },
    { key: 'planejamento', label: 'Planejamento' },
    { key: 'em_risco', label: 'Em Risco' },
    { key: 'concluido', label: 'Concluídos' },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">Projetos</h2>
          <p className="text-sm text-slate-400">{stats.active} ativos · {stats.risk} em risco</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Novo Projeto</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-300' },
          { label: 'Ativos', value: stats.active, color: 'text-blue-400' },
          { label: 'Em Risco', value: stats.risk, color: 'text-red-400' },
          { label: 'Concluídos', value: stats.done, color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-4 text-center">
            <p className={cn('text-xl sm:text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filtered.map((project) => {
          const isExpanded = expandedProject === project.id;
          const completedTasks = project.tasks.filter((t) => t.status === 'concluido').length;
          const daysLeft = project.endDate ? daysUntil(project.endDate) : null;

          return (
            <Card key={project.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    project.status === 'em_risco' ? 'bg-red-500/15' :
                    project.status === 'em_andamento' ? 'bg-blue-500/15' :
                    project.status === 'concluido' ? 'bg-emerald-500/15' : 'bg-slate-700'
                  )}>
                    <FolderKanban size={18} className={
                      project.status === 'em_risco' ? 'text-red-400' :
                      project.status === 'em_andamento' ? 'text-blue-400' :
                      project.status === 'concluido' ? 'text-emerald-400' : 'text-slate-400'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{project.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={statusVariant[project.status] ?? 'ghost'}>
                          {STATUS_LABELS[project.status]}
                        </Badge>
                        <button
                          onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          <ChevronDown size={16} className={cn('transition-transform', isExpanded && 'rotate-180')} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <Badge variant="ghost">{AREA_LABELS[project.area]}</Badge>
                      <span className={cn('text-xs font-medium', PRIORITY_COLORS[project.priority])}>
                        <Flag size={10} className="inline mr-1" />
                        {PRIORITY_LABELS[project.priority]}
                      </span>
                      {daysLeft !== null && (
                        <span className={cn('text-xs flex items-center gap-1', daysLeft < 0 ? 'text-red-400' : daysLeft <= 14 ? 'text-amber-400' : 'text-slate-500')}>
                          <Calendar size={10} />
                          {getDaysLabel(daysLeft)}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">{completedTasks}/{project.tasks.length} tarefas</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 ml-13">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-400">Progresso</span>
                    <span className="text-xs font-medium text-slate-300">{project.progress}%</span>
                  </div>
                  <ProgressBar value={project.progress} size="md" />
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 border-t border-slate-800/60">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {/* Milestones */}
                    {project.milestones.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Marcos</p>
                        <div className="space-y-2">
                          {project.milestones.map((m) => (
                            <div key={m.id} className="flex items-center gap-2.5">
                              {m.completed
                                ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                : <Circle size={14} className="text-slate-600 shrink-0" />}
                              <span className={cn('text-xs', m.completed ? 'text-slate-500 line-through' : 'text-slate-300')}>
                                {m.title}
                              </span>
                              <span className="text-[10px] text-slate-600 ml-auto">{formatDate(m.dueDate)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tasks */}
                    {project.tasks.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Tarefas</p>
                        <div className="space-y-1.5">
                          {project.tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-2.5 p-2 bg-slate-800/50 rounded-lg">
                              <button
                                onClick={() => updateTask(project.id, task.id, {
                                  status: task.status === 'concluido' ? 'pendente' : 'concluido'
                                })}
                                className="shrink-0"
                              >
                                {task.status === 'concluido'
                                  ? <CheckCircle2 size={14} className="text-emerald-400" />
                                  : <Circle size={14} className="text-slate-600 hover:text-slate-400 transition-colors" />}
                              </button>
                              <span className={cn('text-xs flex-1', task.status === 'concluido' ? 'text-slate-500 line-through' : 'text-slate-300')}>
                                {task.title}
                              </span>
                              <div className={cn('w-1.5 h-1.5 rounded-full shrink-0',
                                task.priority === 'critica' ? 'bg-red-400' :
                                task.priority === 'alta' ? 'bg-amber-400' : 'bg-blue-400'
                              )} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
