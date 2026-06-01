'use client';

import { useState, useEffect } from 'react';
import { useCoupleStore } from '@/lib/store/coupleStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { cn, AREA_LABELS } from '@/lib/utils';
import type { LifeArea } from '@/lib/types';
import {
  Heart, Copy, Check, Link, Unlink, Shield, DollarSign,
  Users, Target, FolderKanban, Building2, BookOpen, Brain, HeartPulse
} from 'lucide-react';

const AREA_ICONS: Record<string, React.ReactNode> = {
  financas: <DollarSign size={14} />,
  familia: <Users size={14} />,
  projetos: <FolderKanban size={14} />,
  objetivos: <Target size={14} />,
  patrimonio: <Building2 size={14} />,
  responsabilidades: <Shield size={14} />,
  conhecimento: <BookOpen size={14} />,
  decisoes: <Brain size={14} />,
  saude: <HeartPulse size={14} />,
};

const SHAREABLE_AREAS: LifeArea[] = [
  'financas', 'familia', 'projetos', 'objetivos',
  'patrimonio', 'responsabilidades',
];

const PRIVATE_AREAS: LifeArea[] = ['saude', 'conhecimento'];

export function CoupleSettings() {
  const { user } = useAuthStore();
  const { link, inviteCode, generateInviteCode, acceptInvite, disconnect, toggleSharedArea } = useCoupleStore();
  const [mode, setMode] = useState<'idle' | 'generate' | 'accept'>('idle');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentCode = inviteCode || (user ? generateInviteCode(user.id) : '');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAccept = () => {
    if (!user) return;
    const result = acceptInvite(inputCode.trim().toUpperCase(), user.id, user.name, user.email);
    if (result.success) {
      setSuccess('Casal vinculado com sucesso!');
      setError('');
    } else {
      setError(result.error ?? 'Erro');
    }
  };

  if (link) {
    return (
      <div className="space-y-6">
        {/* Connected status */}
        <div className="bg-pink-500/10 border border-pink-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                <Heart size={20} className="text-pink-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Casal vinculado</p>
                <p className="text-xs text-slate-400">Conectado desde {new Date(link.linkedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
              <Unlink size={12} /> Desconectar
            </button>
          </div>
        </div>

        {/* Shared areas */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-1">Áreas compartilhadas</h4>
          <p className="text-xs text-slate-400 mb-4">
            Ambos veem e são notificados sobre mudanças nestas áreas
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SHAREABLE_AREAS.map((area) => {
              const isShared = link.sharedAreas.includes(area);
              return (
                <button
                  key={area}
                  onClick={() => toggleSharedArea(area)}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all',
                    isShared
                      ? 'bg-pink-500/15 border-pink-500/40 text-pink-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  )}
                >
                  <span>{AREA_ICONS[area]}</span>
                  <span className="text-xs font-medium">{AREA_LABELS[area]}</span>
                  {isShared && <Check size={11} className="ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Private areas */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-1">Áreas sempre privadas</h4>
          <p className="text-xs text-slate-400 mb-3">Apenas você tem acesso a estas áreas</p>
          <div className="grid grid-cols-2 gap-2">
            {PRIVATE_AREAS.map((area) => (
              <div
                key={area}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-slate-500"
              >
                <span>{AREA_ICONS[area]}</span>
                <span className="text-xs">{AREA_LABELS[area]}</span>
                <Shield size={10} className="ml-auto text-slate-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-pink-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart size={28} className="text-pink-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Conectar com cônjuge</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Compartilhe finanças, projetos e família com seu parceiro(a). Cada um mantém suas áreas privadas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode('generate')}
          className={cn(
            'p-4 rounded-xl border text-left transition-all',
            mode === 'generate'
              ? 'bg-blue-500/15 border-blue-500/40'
              : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
          )}
        >
          <Link size={18} className="text-blue-400 mb-2" />
          <p className="text-sm font-semibold text-white">Gerar código</p>
          <p className="text-xs text-slate-400 mt-0.5">Envie para seu cônjuge conectar</p>
        </button>
        <button
          onClick={() => setMode('accept')}
          className={cn(
            'p-4 rounded-xl border text-left transition-all',
            mode === 'accept'
              ? 'bg-pink-500/15 border-pink-500/40'
              : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
          )}
        >
          <Heart size={18} className="text-pink-400 mb-2" />
          <p className="text-sm font-semibold text-white">Inserir código</p>
          <p className="text-xs text-slate-400 mt-0.5">Tenho um código do meu cônjuge</p>
        </button>
      </div>

      {mode === 'generate' && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-xs text-slate-400">Compartilhe este código com seu cônjuge:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 font-mono text-sm text-blue-300 tracking-widest">
              {currentCode}
            </div>
            <button
              onClick={handleCopy}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500">O código expira em 24 horas após o primeiro uso.</p>
        </div>
      )}

      {mode === 'accept' && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-xs text-slate-400">Digite o código do seu cônjuge:</p>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="LIFEOS-XXXX-XXXX"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-pink-500 transition-colors tracking-widest"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-emerald-400">{success}</p>}
          <button
            onClick={handleAccept}
            disabled={inputCode.length < 8}
            className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-all"
          >
            Conectar casal
          </button>
        </div>
      )}
    </div>
  );
}
