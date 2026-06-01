'use client';

import { PremiumGate } from '@/components/plan/PremiumGate';
import { useState } from 'react';
import { CheckCircle2, Link2, AlertCircle, RefreshCw, ExternalLink, Shield, Building2 } from 'lucide-react';
import { generateId } from '@/lib/utils';

interface ConnectedBank {
  id: string;
  bankId: string;
  bankName: string;
  connectedAt: string;
  lastSync: string;
  accountCount: number;
  status: 'active' | 'expired' | 'error';
}

const BANKS = [
  { id: 'nubank', name: 'Nubank', logo: '💜', color: 'border-purple-500/40 hover:border-purple-500/70', accent: 'bg-purple-600' },
  { id: 'itau', name: 'Itaú', logo: '🟠', color: 'border-orange-500/40 hover:border-orange-500/70', accent: 'bg-orange-600' },
  { id: 'bradesco', name: 'Bradesco', logo: '🔴', color: 'border-red-500/40 hover:border-red-500/70', accent: 'bg-red-600' },
  { id: 'bb', name: 'Banco do Brasil', logo: '🟡', color: 'border-yellow-500/40 hover:border-yellow-500/70', accent: 'bg-yellow-600' },
  { id: 'santander', name: 'Santander', logo: '🔴', color: 'border-red-600/40 hover:border-red-600/70', accent: 'bg-red-700' },
  { id: 'c6', name: 'C6 Bank', logo: '⬛', color: 'border-slate-500/40 hover:border-slate-400/70', accent: 'bg-slate-600' },
  { id: 'inter', name: 'Banco Inter', logo: '🟠', color: 'border-orange-400/40 hover:border-orange-400/70', accent: 'bg-orange-500' },
  { id: 'caixa', name: 'Caixa Econômica', logo: '🔵', color: 'border-blue-600/40 hover:border-blue-600/70', accent: 'bg-blue-700' },
];

type OAuthStep = 'idle' | 'consent' | 'bank_login' | 'mfa' | 'success' | 'error';

function OpenFinanceContent() {
  const [connected, setConnected] = useState<ConnectedBank[]>([]);
  const [oauthStep, setOauthStep] = useState<OAuthStep>('idle');
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [bankUser, setBankUser] = useState('');
  const [bankPass, setBankPass] = useState('');
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleConnect = (bank: typeof BANKS[0]) => {
    setSelectedBank(bank);
    setOauthStep('consent');
  };

  const handleConsent = () => setOauthStep('bank_login');

  const handleBankLogin = () => {
    if (!bankUser || !bankPass) return;
    setOauthStep('mfa');
  };

  const handleMfa = () => {
    if (mfaCode.length < 4) return;
    setOauthStep('success');
    setTimeout(() => {
      if (!selectedBank) return;
      setConnected((prev) => [
        ...prev.filter((c) => c.bankId !== selectedBank.id),
        {
          id: generateId(),
          bankId: selectedBank.id,
          bankName: selectedBank.name,
          connectedAt: new Date().toISOString(),
          lastSync: new Date().toISOString(),
          accountCount: Math.floor(Math.random() * 3) + 1,
          status: 'active',
        },
      ]);
      setOauthStep('idle');
      setSelectedBank(null);
      setBankUser('');
      setBankPass('');
      setMfaCode('');
    }, 2000);
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    await new Promise((r) => setTimeout(r, 1500));
    setConnected((prev) => prev.map((c) => c.id === id ? { ...c, lastSync: new Date().toISOString() } : c));
    setSyncing(null);
  };

  const handleDisconnect = (id: string) => {
    setConnected((prev) => prev.filter((c) => c.id !== id));
  };

  const connectedIds = new Set(connected.map((c) => c.bankId));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Open Finance Brasil</h2>
        <p className="text-slate-400 text-sm mt-0.5">Conecte suas contas bancárias com segurança via BCB Open Finance</p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
        <Shield size={18} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-300 font-medium">Ambiente de Demonstração</p>
          <p className="text-xs text-slate-400 mt-1">Esta é uma simulação do fluxo Open Finance. Em produção, utilizará a API oficial do Banco Central do Brasil (bcb.gov.br/estabilidadefinanceira/openfinance) com criptografia ponta-a-ponta e suas credenciais nunca são armazenadas pelo LifeOS.</p>
        </div>
      </div>

      {/* Connected banks */}
      {connected.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Contas Conectadas</h3>
          {connected.map((c) => {
            const bank = BANKS.find((b) => b.id === c.bankId);
            return (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl">{bank?.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{c.bankName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{c.status === 'active' ? 'Ativo' : 'Expirado'}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.accountCount} conta(s) · Sincronizado {new Date(c.lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSync(c.id)} className="p-2 text-slate-500 hover:text-slate-300 transition-colors" title="Sincronizar">
                    <RefreshCw size={14} className={syncing === c.id ? 'animate-spin text-blue-400' : ''} />
                  </button>
                  <button onClick={() => handleDisconnect(c.id)} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Desconectar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available banks */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Instituições Disponíveis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {BANKS.map((bank) => {
            const isConnected = connectedIds.has(bank.id);
            return (
              <button
                key={bank.id}
                onClick={() => !isConnected && handleConnect(bank)}
                disabled={isConnected}
                className={`relative p-4 bg-slate-900 border rounded-xl text-left transition-all ${isConnected ? 'opacity-60 cursor-default border-slate-800' : bank.color + ' cursor-pointer'}`}
              >
                {isConnected && (
                  <CheckCircle2 size={14} className="absolute top-3 right-3 text-emerald-400" />
                )}
                <div className="text-2xl mb-2">{bank.logo}</div>
                <p className="text-sm font-medium text-white">{bank.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{isConnected ? 'Conectado' : 'Conectar'}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* OAuth Modal */}
      {oauthStep !== 'idle' && selectedBank && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className={`${selectedBank.accent} px-6 py-4 flex items-center gap-3`}>
              <span className="text-2xl">{selectedBank.logo}</span>
              <div>
                <p className="text-white font-semibold">{selectedBank.name}</p>
                <p className="text-white/60 text-xs">Open Finance</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {oauthStep === 'consent' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink size={16} className="text-blue-400" />
                    <h3 className="text-white font-medium">Autorização de Acesso</h3>
                  </div>
                  <p className="text-slate-400 text-sm">O LifeOS solicita acesso de <strong className="text-white">leitura</strong> às seguintes informações:</p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {['Saldo e extrato de contas', 'Histórico de transações (90 dias)', 'Dados de cartão de crédito'].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" /> {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500 bg-slate-800/60 rounded-lg p-3">🔒 Suas credenciais não são compartilhadas com o LifeOS. O acesso expira automaticamente em 12 meses.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setOauthStep('idle')} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Cancelar</button>
                    <button onClick={handleConsent} className={`flex-1 py-2.5 ${selectedBank.accent} text-white rounded-xl text-sm font-medium`}>Autorizar</button>
                  </div>
                </>
              )}

              {oauthStep === 'bank_login' && (
                <>
                  <h3 className="text-white font-medium">Login {selectedBank.name}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">CPF / Agência / Usuário</label>
                      <input value={bankUser} onChange={(e) => setBankUser(e.target.value)} type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Senha</label>
                      <input value={bankPass} onChange={(e) => setBankPass(e.target.value)} type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Suas credenciais são enviadas diretamente ao {selectedBank.name} via HTTPS. O LifeOS não tem acesso.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setOauthStep('consent')} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Voltar</button>
                    <button onClick={handleBankLogin} className={`flex-1 py-2.5 ${selectedBank.accent} text-white rounded-xl text-sm font-medium`}>Entrar</button>
                  </div>
                </>
              )}

              {oauthStep === 'mfa' && (
                <>
                  <h3 className="text-white font-medium">Autenticação em 2 Fatores</h3>
                  <p className="text-slate-400 text-sm">Digite o código enviado para o seu celular cadastrado no {selectedBank.name}.</p>
                  <input
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-xl text-white text-center tracking-widest focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setOauthStep('bank_login')} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Voltar</button>
                    <button onClick={handleMfa} className={`flex-1 py-2.5 ${selectedBank.accent} text-white rounded-xl text-sm font-medium`}>Confirmar</button>
                  </div>
                </>
              )}

              {oauthStep === 'success' && (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                  <p className="text-white font-medium">Conectando {selectedBank.name}...</p>
                  <p className="text-slate-500 text-xs">Importando transações dos últimos 90 dias</p>
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {oauthStep === 'error' && (
                <div className="text-center py-4 space-y-3">
                  <AlertCircle size={40} className="text-red-400 mx-auto" />
                  <p className="text-white font-medium">Erro na conexão</p>
                  <p className="text-slate-400 text-sm">Não foi possível conectar ao {selectedBank.name}. Tente novamente.</p>
                  <button onClick={() => setOauthStep('idle')} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm">Fechar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Como funciona o Open Finance?</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Autorização', desc: 'Você autoriza o acesso na sua instituição bancária, nunca no LifeOS.' },
            { step: '2', title: 'Consentimento', desc: 'Define quais dados e por quanto tempo serão compartilhados (máx. 12 meses).' },
            { step: '3', title: 'Sincronização', desc: 'Transações são importadas automaticamente e você pode revogar a qualquer momento.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="w-7 h-7 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{item.step}</div>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OpenFinancePage() {
  return (
    <PremiumGate
      feature="Open Finance Brasil"
      description="Conecte suas contas bancárias diretamente via API Open Finance do Banco Central. Sincronize transações automaticamente de Nubank, Itaú, Bradesco, BB, Santander e mais."
    >
      <OpenFinanceContent />
    </PremiumGate>
  );
}
