'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { BookOpen, Plus, Search, Lightbulb, FileText, Users, Pen, Brain, GraduationCap } from 'lucide-react';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  nota: <FileText size={14} className="text-blue-400" />,
  ideia: <Lightbulb size={14} className="text-amber-400" />,
  estudo: <GraduationCap size={14} className="text-green-400" />,
  reuniao: <Users size={14} className="text-purple-400" />,
  reflexao: <Pen size={14} className="text-cyan-400" />,
  aprendizado: <Brain size={14} className="text-pink-400" />,
};

const TYPE_LABELS: Record<string, string> = {
  nota: 'Nota', ideia: 'Ideia', estudo: 'Estudo',
  reuniao: 'Reunião', reflexao: 'Reflexão', aprendizado: 'Aprendizado',
};

const TYPE_BADGE: Record<string, 'info' | 'warning' | 'success' | 'purple' | 'ghost'> = {
  nota: 'info', ideia: 'warning', estudo: 'success',
  reuniao: 'purple', reflexao: 'ghost', aprendizado: 'info',
};

export default function ConhecimentoPage() {
  const { notes } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const selected = notes.find((n) => n.id === selectedNote) ?? filtered[0] ?? null;

  const categories = [...new Set(notes.map((n) => n.category))];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">Conhecimento</h2>
          <p className="text-sm text-slate-400">{notes.length} anotações · {categories.length} categorias</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Nova Nota</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(TYPE_LABELS).slice(0, 4).map(([type, label]) => {
          const count = notes.filter((n) => n.type === type).length;
          return (
            <div key={type} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                {TYPE_ICONS[type]}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{count}</p>
                <p className="text-[10px] text-slate-400">{label}{count !== 1 ? 's' : ''}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* List */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-500"
            />
          </div>
          <div className="space-y-2">
            {filtered.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note.id)}
                className={cn(
                  'p-3 rounded-lg cursor-pointer transition-all border',
                  selected?.id === note.id
                    ? 'bg-blue-600/15 border-blue-500/30'
                    : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/80'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="shrink-0 mt-0.5">{TYPE_ICONS[note.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{note.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{note.content}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">Nenhuma nota encontrada</p>
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="h-full">
              <CardHeader className="border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {TYPE_ICONS[selected.type]}
                      <Badge variant={TYPE_BADGE[selected.type] ?? 'ghost'}>{TYPE_LABELS[selected.type]}</Badge>
                      <span className="text-xs text-slate-500">{selected.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{selected.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Criado em {new Date(selected.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">Editar</Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                {selected.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-800">
                    {selected.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500">
              <div className="text-center">
                <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selecione uma nota para visualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
