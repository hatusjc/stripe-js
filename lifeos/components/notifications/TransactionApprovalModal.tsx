'use client';

import { useState, useRef } from 'react';
import { useBankNotificationStore } from '@/lib/store/bankNotificationStore';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useCoupleStore } from '@/lib/store/coupleStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { PendingTransaction } from '@/lib/types';
import { formatCurrency, generateId, cn } from '@/lib/utils';
import {
  CheckCircle2, XCircle, Camera, FileText, Tag,
  TrendingUp, TrendingDown, X, Image, Loader2
} from 'lucide-react';

const CATEGORIES = {
  despesa: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Vestuário', 'Serviços', 'Outros'],
  receita: ['Salário', 'Freelance', 'Dividendos', 'Aluguel', 'Outros'],
};

interface ApprovalModalProps {
  pending: PendingTransaction;
}

export function TransactionApprovalModal({ pending }: ApprovalModalProps) {
  const { approveTransaction, rejectTransaction } = useBankNotificationStore();
  const { addTransaction } = useFinanceStore();
  const { link, pushCoupleNotification } = useCoupleStore();
  const { user } = useAuthStore();

  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState(pending.category);
  const [description, setDescription] = useState(pending.description);
  const [isProcessing, setIsProcessing] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 400));

    const approved = approveTransaction(pending.id, {
      photo: photo ?? undefined,
      notes: notes.trim() || undefined,
      category,
    });

    addTransaction({
      type: pending.type,
      category,
      description,
      amount: pending.amount,
      date: pending.date,
      photo: photo ?? undefined,
      notes: notes.trim() || undefined,
      shared: !!link,
      addedBy: user?.id,
      fromNotification: true,
    } as any);

    // Notify partner if finances are shared
    if (link && link.sharedAreas.includes('financas')) {
      pushCoupleNotification({
        fromUserId: user?.id ?? '',
        fromName: user?.name ?? 'Você',
        toUserId: link.partnerId,
        area: 'financas',
        action: 'add',
        entityType: 'transaction',
        entityTitle: description,
        details: `${pending.type === 'receita' ? '+' : '-'}${formatCurrency(pending.amount)} · via notificação bancária`,
      });
    }

    setIsProcessing(false);
  };

  const handleReject = () => rejectTransaction(pending.id);

  return (
    <div className="bg-slate-800/95 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 w-full max-w-sm">
      {/* Header */}
      <div className={cn(
        'px-4 pt-4 pb-3 border-b border-slate-700',
        pending.type === 'receita' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center',
              pending.type === 'receita' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
            )}>
              {pending.type === 'receita'
                ? <TrendingUp size={18} className="text-emerald-400" />
                : <TrendingDown size={18} className="text-rose-400" />}
            </div>
            <div>
              <p className="text-xs text-slate-400">{pending.source} · {pending.type === 'receita' ? 'Entrada' : 'Saída'}</p>
              <p className={cn('text-xl font-bold', pending.type === 'receita' ? 'text-emerald-400' : 'text-rose-400')}>
                {pending.type === 'receita' ? '+' : '-'}{formatCurrency(pending.amount)}
              </p>
            </div>
          </div>
          <button onClick={handleReject} className="text-slate-500 hover:text-slate-300 p-1">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Transação detectada — Adicionar ao LifeOS?
        </p>

        {/* Description */}
        <div>
          <label className="text-[10px] text-slate-500 mb-1 block">Descrição</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-[10px] text-slate-500 mb-1 block">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            {CATEGORIES[pending.type].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Photo */}
        <div>
          <label className="text-[10px] text-slate-500 mb-1.5 block">Comprovante / Foto (opcional)</label>
          {photo ? (
            <div className="relative">
              <img src={photo} alt="Comprovante" className="w-full h-28 object-cover rounded-lg border border-slate-600" />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => photoRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all text-sm"
            >
              <Camera size={16} />
              Tirar foto ou selecionar
            </button>
          )}
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] text-slate-500 mb-1 block">Observações (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: almoço de trabalho, parcela 2/12..."
            rows={2}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={handleReject}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-medium transition-all"
        >
          <XCircle size={15} /> Ignorar
        </button>
        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all',
            pending.type === 'receita'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white',
            'disabled:opacity-60'
          )}
        >
          {isProcessing
            ? <Loader2 size={15} className="animate-spin" />
            : <CheckCircle2 size={15} />}
          Adicionar
        </button>
      </div>
    </div>
  );
}
