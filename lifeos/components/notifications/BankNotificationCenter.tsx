'use client';

import { useState, useEffect } from 'react';
import { useBankNotificationStore } from '@/lib/store/bankNotificationStore';
import { TransactionApprovalModal } from '@/components/notifications/TransactionApprovalModal';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Bell, BellRing, Smartphone, Send, ChevronDown,
  CheckCircle2, XCircle, Clock, Zap
} from 'lucide-react';

// Common bank SMS examples for testing
const SAMPLE_NOTIFICATIONS = [
  'Compra no débito de R$ 89,90 em IFOOD aprovada. Saldo: R$ 2.341,00. Nubank',
  'Pix recebido R$ 1.500,00 de MARIA SILVA. Saldo: R$ 3.841,00',
  'Pagamento de R$ 320,00 para CONTA DE LUZ realizado. Itaú',
  'Transferência recebida R$ 3.000,00 - Salário. Bradesco',
  'Compra R$ 156,80 em POSTO IPIRANGA aprovada. C6 Bank',
  'Débito de R$ 49,90 - SPOTIFY BRASIL. Santander',
];

export function BankNotificationCenter() {
  const {
    rawNotifications, pendingTransactions, permissionGranted,
    setPermission, addRawNotification, dismissNotification, clearApproved
  } = useBankNotificationStore();
  const [customText, setCustomText] = useState('');
  const [showSamples, setShowSamples] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [notifApiSupported] = useState(() => typeof window !== 'undefined' && 'Notification' in window);

  const pendingCount = pendingTransactions.length;

  const requestPermission = async () => {
    setRequesting(true);
    try {
      if (notifApiSupported) {
        const result = await Notification.requestPermission();
        setPermission(result === 'granted');
        if (result === 'granted') {
          new Notification('LifeOS', {
            body: 'Notificações bancárias ativadas! Transações serão capturadas automaticamente.',
            icon: '/favicon.ico',
          });
        }
      } else {
        setPermission(true); // fallback for environments without Notification API
      }
    } catch {
      setPermission(true);
    }
    setRequesting(false);
  };

  const handleSimulate = (text: string) => {
    addRawNotification(text.trim() || customText.trim(), 'Banco');
    setCustomText('');
  };

  const approved = rawNotifications.filter((n) => n.status === 'approved');
  const rejected = rawNotifications.filter((n) => n.status === 'rejected');

  return (
    <div className="space-y-5">
      {/* Permission request */}
      {!permissionGranted && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
              <BellRing size={20} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">Ativar captura de notificações</p>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Permita que o LifeOS receba notificações do dispositivo para capturar automaticamente
                entradas, saídas e pagamentos dos seus aplicativos bancários.
              </p>
              <button
                onClick={requestPermission}
                disabled={requesting}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                <Smartphone size={14} />
                {requesting ? 'Solicitando...' : 'Permitir notificações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {permissionGranted && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Monitorando notificações bancárias</span>
          <span className="ml-auto text-[10px] text-slate-500">Em tempo real</span>
        </div>
      )}

      {/* Pending approvals */}
      {pendingCount > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">
              Aguardando aprovação ({pendingCount})
            </p>
          </div>
          <div className="space-y-3">
            {pendingTransactions.map((pending) => (
              <TransactionApprovalModal key={pending.id} pending={pending} />
            ))}
          </div>
        </div>
      )}

      {/* Simulate / Test input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-blue-400" />
          <p className="text-sm font-semibold text-white">Simular notificação bancária</p>
          <span className="ml-auto text-[10px] text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">Teste</span>
        </div>
        <p className="text-xs text-slate-400">
          Cole o texto de um SMS/push bancário para testar a captura automática:
        </p>
        <div className="flex gap-2">
          <input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Ex: Compra de R$ 150,00 em MERCADO aprovada"
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={() => handleSimulate(customText)}
            disabled={!customText.trim()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            <Send size={13} />
            Enviar
          </button>
        </div>

        {/* Sample notifications */}
        <button
          onClick={() => setShowSamples(!showSamples)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronDown size={13} className={cn('transition-transform', showSamples && 'rotate-180')} />
          {showSamples ? 'Ocultar' : 'Ver'} exemplos prontos
        </button>
        {showSamples && (
          <div className="space-y-1.5">
            {SAMPLE_NOTIFICATIONS.map((sample, i) => (
              <button
                key={i}
                onClick={() => handleSimulate(sample)}
                className="w-full text-left text-xs text-slate-400 hover:text-white p-2.5 bg-slate-900/60 hover:bg-slate-700/60 rounded-lg transition-all border border-slate-700/50 leading-relaxed"
              >
                {sample}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {(approved.length > 0 || rejected.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Histórico</p>
            <button onClick={clearApproved} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Limpar aprovadas
            </button>
          </div>
          <div className="space-y-2">
            {[...approved, ...rejected].map((n) => (
              <div
                key={n.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border',
                  n.status === 'approved'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-slate-800/40 border-slate-700/50 opacity-50'
                )}
              >
                {n.status === 'approved'
                  ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  : <XCircle size={15} className="text-slate-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">{n.parsedDescription}</p>
                  <p className="text-[10px] text-slate-500">{n.source} · {n.status === 'approved' ? 'Adicionado' : 'Ignorado'}</p>
                </div>
                {n.parsedAmount && (
                  <span className={cn('text-xs font-semibold shrink-0', n.parsedType === 'receita' ? 'text-emerald-400' : 'text-rose-400')}>
                    {n.parsedType === 'receita' ? '+' : '-'}{formatCurrency(n.parsedAmount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {rawNotifications.length === 0 && !pendingCount && (
        <div className="text-center py-8 text-slate-500">
          <Smartphone size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma notificação bancária ainda</p>
          <p className="text-xs mt-1">Simule uma acima para testar</p>
        </div>
      )}
    </div>
  );
}
