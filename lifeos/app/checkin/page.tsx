'use client';

import { useState } from 'react';
import { useCheckinStore, CHECKIN_QUESTIONS } from '@/lib/store/checkinStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, ChevronRight, Star, BarChart3, Calendar } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const SCORE_LABELS = ['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'];
const SCORE_COLORS = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

export default function CheckinPage() {
  const { history, addEntry, hasCheckedInThisWeek, getWeekStart } = useCheckinStore();
  const { lifeScore } = useAppStore();
  const [step, setStep] = useState<'start' | 'questions' | 'finish' | 'done'>('start');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; score: number; note?: string }[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentNote, setCurrentNote] = useState('');
  const [highlights, setHighlights] = useState('');
  const [challenges, setChallenges] = useState('');
  const [intention, setIntention] = useState('');
  const [tab, setTab] = useState<'do' | 'history'>('do');

  const alreadyDone = hasCheckedInThisWeek();
  const weekStart = getWeekStart();
  const weekDate = new Date(weekStart + 'T00:00:00');

  const handleScore = (score: number) => setCurrentScore(score);

  const handleNext = () => {
    const q = CHECKIN_QUESTIONS[qIndex];
    const updated = [...answers.filter((a) => a.questionId !== q.id), { questionId: q.id, score: currentScore, note: currentNote || undefined }];
    setAnswers(updated);
    setCurrentScore(0);
    setCurrentNote('');
    if (qIndex < CHECKIN_QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setStep('finish');
    }
  };

  const handleComplete = () => {
    const avgScore = answers.reduce((s, a) => s + a.score, 0) / answers.length;
    const newLifeScore = Math.round(lifeScore.total * 0.7 + avgScore * 20 * 0.3);
    const label = `Semana de ${weekDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    addEntry({
      weekLabel: label,
      weekStart,
      answers,
      lifeScoreSnapshot: newLifeScore,
      highlights: highlights || undefined,
      challenges: challenges || undefined,
      intention: intention || undefined,
      completedAt: new Date().toISOString(),
    });
    setStep('done');
  };

  const radarData = history.slice(-1)[0]?.answers.map((a) => {
    const q = CHECKIN_QUESTIONS.find((q) => q.id === a.questionId);
    return { subject: q?.icon ?? '', score: a.score * 20 };
  }) ?? [];

  const trendData = history.slice(-8).map((e) => ({
    label: e.weekLabel.replace('Semana de ', ''),
    score: e.lifeScoreSnapshot,
  }));

  if (tab === 'history') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Check-in Semanal</h2>
            <p className="text-slate-400 text-sm">Histórico de reflexões semanais</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTab('do')} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm">Fazer check-in</button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 text-slate-500">Nenhum check-in realizado ainda.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Evolução do Life Score</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
                  <Line dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {radarData.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Perfil Último Check-in</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 14 }} />
                    <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="lg:col-span-2 space-y-3">
              {history.slice().reverse().map((e) => (
                <div key={e.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-400" />
                      <span className="text-sm font-medium text-white">{e.weekLabel}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400" />
                      <span className="text-sm text-white font-bold">{e.lifeScoreSnapshot}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {e.answers.map((a) => {
                      const q = CHECKIN_QUESTIONS.find((q) => q.id === a.questionId);
                      return (
                        <div key={a.questionId} className="flex items-center gap-1 text-xs">
                          <span>{q?.icon}</span>
                          <span className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[9px] font-bold ${SCORE_COLORS[a.score]}`}>{a.score}</span>
                        </div>
                      );
                    })}
                  </div>
                  {e.highlights && <p className="text-xs text-slate-400"><span className="text-emerald-400">✓ </span>{e.highlights}</p>}
                  {e.challenges && <p className="text-xs text-slate-400 mt-1"><span className="text-red-400">⚠ </span>{e.challenges}</p>}
                  {e.intention && <p className="text-xs text-slate-400 mt-1"><span className="text-blue-400">→ </span>{e.intention}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Check-in Semanal</h2>
          <p className="text-slate-400 text-sm">Reflexão e atualização do Life Score</p>
        </div>
        <button onClick={() => setTab('history')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm">
          <BarChart3 size={14} /> Histórico
        </button>
      </div>

      {step === 'start' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 text-center space-y-5 sm:space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Star size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Reflexão da Semana</h3>
            <p className="text-slate-400 text-sm">{weekDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          {alreadyDone ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-300 text-sm">Você já fez o check-in desta semana!</p>
              <button onClick={() => setTab('history')} className="mt-3 text-xs text-slate-400 underline">Ver histórico</button>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-sm">{CHECKIN_QUESTIONS.length} perguntas · ~3 minutos</p>
              <button
                onClick={() => { setStep('questions'); setQIndex(0); setAnswers([]); }}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all"
              >
                Iniciar Check-in
              </button>
            </>
          )}
        </div>
      )}

      {step === 'questions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{qIndex + 1} de {CHECKIN_QUESTIONS.length}</span>
            <div className="flex gap-1">
              {CHECKIN_QUESTIONS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < qIndex ? 'bg-blue-500' : i === qIndex ? 'bg-blue-400' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
          <div className="text-center py-4">
            <div className="text-4xl mb-4">{CHECKIN_QUESTIONS[qIndex].icon}</div>
            <p className="text-white text-lg font-medium">{CHECKIN_QUESTIONS[qIndex].question}</p>
          </div>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => handleScore(s)}
                className={`w-12 h-12 rounded-xl font-bold text-sm transition-all ${currentScore === s ? `${SCORE_COLORS[s]} text-white scale-110` : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
          {currentScore > 0 && (
            <p className="text-center text-xs text-slate-400">{SCORE_LABELS[currentScore]}</p>
          )}
          <div>
            <textarea
              placeholder="Nota opcional (o que aconteceu, contexto...)"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <button
            disabled={currentScore === 0}
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
          >
            {qIndex === CHECKIN_QUESTIONS.length - 1 ? 'Finalizar' : 'Próxima'} <ChevronRight size={16} />
          </button>
        </div>
      )}

      {step === 'finish' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
          <h3 className="text-white font-semibold">Quase lá! Reflexões finais</h3>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Maior conquista ou destaque da semana</label>
            <textarea rows={2} value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="O que foi bem? O que você se orgulha?" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Principal desafio ou dificuldade</label>
            <textarea rows={2} value={challenges} onChange={(e) => setChallenges(e.target.value)} placeholder="O que foi difícil? O que pode melhorar?" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Intenção para a próxima semana</label>
            <textarea rows={2} value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="O que você quer focar na semana que vem?" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <button onClick={handleComplete} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all">
            Salvar Check-in
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 text-center space-y-4">
          <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Check-in Salvo!</h3>
          <p className="text-slate-400 text-sm">Seu Life Score foi atualizado com base nas suas respostas.</p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => { setStep('start'); setQIndex(0); setAnswers([]); setHighlights(''); setChallenges(''); setIntention(''); }} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Novo Check-in</button>
            <button onClick={() => setTab('history')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm">Ver Histórico</button>
          </div>
        </div>
      )}
    </div>
  );
}
