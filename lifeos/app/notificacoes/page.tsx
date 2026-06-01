'use client';

import { BankNotificationCenter } from '@/components/notifications/BankNotificationCenter';
import { PremiumGate } from '@/components/plan/PremiumGate';

export default function NotificacoesPage() {
  return (
    <PremiumGate
      feature="Notificações Bancárias"
      description="Capture automaticamente transações do SMS e push dos seus bancos (Nubank, Itaú, Bradesco, BB, Santander e mais). Aprove com um clique, anexe foto e notas."
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h2 className="text-lg font-bold text-white">Notificações Bancárias</h2>
          <p className="text-sm text-slate-400">
            Captura automática de entradas, saídas e pagamentos dos seus bancos
          </p>
        </div>
        <BankNotificationCenter />
      </div>
    </PremiumGate>
  );
}
