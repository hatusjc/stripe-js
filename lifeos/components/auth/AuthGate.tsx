'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, login, register, isLoading } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (user) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      const result = await login(email, password);
      if (!result.success) setError(result.error ?? 'Erro ao entrar');
    } else {
      if (!name.trim()) { setError('Digite seu nome'); return; }
      const result = await register(name, email, password);
      if (!result.success) setError(result.error ?? 'Erro ao criar conta');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">LifeOS</span>
            <p className="text-xs text-slate-500">Personal Operating System</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              O Sistema Operacional<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                para sua vida real.
              </span>
            </h2>
            <p className="text-slate-400 mt-4 text-lg leading-relaxed max-w-md">
              Finanças, projetos, família, saúde e objetivos — tudo em um lugar. Com inteligência artificial integrada.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: '📊', title: 'Dashboard completo', desc: 'Visão em tempo real de todas as áreas da sua vida' },
              { icon: '🤖', title: 'IA personalizada', desc: 'Pergunte qualquer coisa sobre sua situação atual' },
              { icon: '🎯', title: 'Life Score', desc: 'Métricas que transformam complexidade em clareza' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">© 2025 LifeOS. Todos os dados ficam no seu dispositivo.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">LifeOS</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-1">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
          </h3>
          <p className="text-sm text-slate-400 mb-8">
            {mode === 'login'
              ? 'Entre para acessar seu sistema operacional pessoal'
              : 'Comece a organizar sua vida em minutos'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="João Silva"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@email.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              {mode === 'login' ? 'Entrar' : 'Criar minha conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {mode === 'login' ? 'Criar conta grátis' : 'Entrar'}
              </button>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-600 text-center">Demo rápido: use qualquer email + senha para testar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
