'use client';

import { useAppStore } from '@/lib/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, daysUntil, getDaysLabel, cn } from '@/lib/utils';
import { Users, Calendar, Plus, Gift, Stethoscope, GraduationCap, Plane, Star } from 'lucide-react';

const EVENT_TYPE_ICON: Record<string, React.ReactNode> = {
  aniversario: <Gift size={14} className="text-pink-400" />,
  saude: <Stethoscope size={14} className="text-green-400" />,
  educacao: <GraduationCap size={14} className="text-blue-400" />,
  viagem: <Plane size={14} className="text-cyan-400" />,
  compromisso: <Calendar size={14} className="text-amber-400" />,
  outro: <Star size={14} className="text-slate-400" />,
};

const EVENT_TYPE_BG: Record<string, string> = {
  aniversario: 'bg-pink-500/15', saude: 'bg-green-500/15', educacao: 'bg-blue-500/15',
  viagem: 'bg-cyan-500/15', compromisso: 'bg-amber-500/15', outro: 'bg-slate-700',
};

export default function FamiliaPage() {
  const { familyEvents, familyMembers } = useAppStore();

  const upcoming = familyEvents
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date));

  const past = familyEvents
    .filter((e) => daysUntil(e.date) < 0)
    .sort((a, b) => daysUntil(b.date) - daysUntil(a.date))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Família</h2>
          <p className="text-sm text-slate-400">{familyMembers.length} membros · {upcoming.length} eventos futuros</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Plus size={14} />}>Evento</Button>
          <Button variant="primary" icon={<Plus size={14} />}>Membro</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={14} className="text-pink-400" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6">Nenhum evento próximo</p>
              )}
              {upcoming.map((event) => {
                const days = daysUntil(event.date);
                return (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-all">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', EVENT_TYPE_BG[event.type] ?? 'bg-slate-700')}>
                      {EVENT_TYPE_ICON[event.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{event.title}</p>
                          {event.person && <p className="text-xs text-slate-400">{event.person}</p>}
                          {event.notes && <p className="text-xs text-slate-500 mt-0.5">{event.notes}</p>}
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-xs font-medium text-slate-300">{formatDate(event.date)}</p>
                          <p className={cn('text-xs mt-0.5', days === 0 ? 'text-amber-400 font-medium' : days <= 7 ? 'text-blue-400' : 'text-slate-500')}>
                            {getDaysLabel(days)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {past.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-400">Eventos Passados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {past.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 py-2 opacity-60">
                    <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', EVENT_TYPE_BG[event.type] ?? 'bg-slate-700')}>
                      {EVENT_TYPE_ICON[event.type]}
                    </div>
                    <span className="text-xs text-slate-400 line-through flex-1">{event.title}</span>
                    <span className="text-xs text-slate-600">{formatDate(event.date)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Family Members */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={14} className="text-pink-400" />
                Membros da Família
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {familyMembers.map((member) => {
                const birthdays = familyEvents.filter(
                  (e) => e.type === 'aniversario' && e.person?.includes(member.name.split(' ')[0])
                );
                return (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.relationship}</p>
                      {member.birthDate && (
                        <p className="text-[10px] text-slate-500">
                          {new Date(member.birthDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
