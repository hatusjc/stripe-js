import { BankNotificationCenter } from '@/components/notifications/BankNotificationCenter';

export default function NotificacoesPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-white">Notificações Bancárias</h2>
        <p className="text-sm text-slate-400">
          Captura automática de entradas, saídas e pagamentos dos seus bancos
        </p>
      </div>
      <BankNotificationCenter />
    </div>
  );
}
