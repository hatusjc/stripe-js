'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { formatCurrency, generateId } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { Upload, X, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

type RawRow = Record<string, string>;

interface ParsedTransaction {
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  date: string;
  category: string;
}

function detectColumn(headers: string[], candidates: string[]): string | undefined {
  return headers.find((h) => candidates.some((c) => h.toLowerCase().includes(c)));
}

function parseAmount(raw: string): number {
  return Math.abs(parseFloat(raw.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0);
}

function parseDate(raw: string): string {
  const parts = raw.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    if (a.length === 4) return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`;
    if (c.length === 4) return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
    const year = new Date().getFullYear();
    return `${year}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
  }
  return new Date().toISOString().slice(0, 10);
}

interface CSVImportProps {
  onClose: () => void;
}

export function CSVImport({ onClose }: CSVImportProps) {
  const { addTransaction } = useFinanceStore();
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState<ParsedTransaction[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Apenas arquivos .csv são suportados');
      return;
    }
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        const descCol = detectColumn(headers, ['descri', 'histor', 'memo', 'detail', 'lancamento']);
        const amtCol = detectColumn(headers, ['valor', 'amount', 'value', 'quantia']);
        const dateCol = detectColumn(headers, ['data', 'date', 'dt']);
        const typeCol = detectColumn(headers, ['tipo', 'type', 'natureza', 'credito', 'debito']);

        if (!amtCol || !dateCol) {
          setError('Não foi possível identificar colunas de valor/data. Verifique o formato do CSV.');
          return;
        }

        const rows: ParsedTransaction[] = results.data.map((row) => {
          const amount = parseAmount(row[amtCol] ?? '0');
          const rawType = typeCol ? (row[typeCol] ?? '') : row[amtCol] ?? '';
          const isNegative = (row[amtCol] ?? '').startsWith('-') || rawType.toLowerCase().includes('deb') || rawType.toLowerCase().includes('saída');
          return {
            description: descCol ? (row[descCol] ?? 'Transação') : 'Transação',
            amount,
            type: (isNegative ? 'despesa' : 'receita') as 'receita' | 'despesa',
            date: dateCol ? parseDate(row[dateCol] ?? '') : new Date().toISOString().slice(0, 10),
            category: isNegative ? 'Importado' : 'Importado',
          };
        }).filter((r) => r.amount > 0);

        setParsed(rows);
        setSelected(new Set(rows.map((_, i) => i)));
        setError('');
        setStep('preview');
      },
      error: () => setError('Erro ao ler o arquivo CSV'),
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleImport = () => {
    const toImport = parsed.filter((_, i) => selected.has(i));
    toImport.forEach((t) => {
      addTransaction({
        type: t.type,
        category: t.category,
        description: t.description,
        amount: t.amount,
        date: t.date,
      } as Omit<Transaction, 'id'>);
    });
    setStep('done');
  };

  const toggleRow = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Importar Extrato CSV</h3>
            <p className="text-xs text-slate-400">Nubank, Itaú, BB, Bradesco, XP e outros</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
                  dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
                )}
              >
                <Upload size={32} className="mx-auto mb-3 text-slate-500" />
                <p className="text-sm font-medium text-slate-300">Arraste o arquivo CSV aqui</p>
                <p className="text-xs text-slate-500 mt-1">ou clique para selecionar</p>
                <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-300 mb-3 flex items-center gap-1.5">
                  <FileText size={13} /> Formato esperado do CSV
                </p>
                <div className="overflow-x-auto">
                  <table className="text-[11px] text-slate-400 w-full">
                    <thead><tr className="border-b border-slate-700">
                      {['Data', 'Descrição', 'Valor', 'Tipo'].map((h) => <th key={h} className="text-left pb-1.5 pr-4 font-medium text-slate-300">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      <tr><td className="pr-4 py-1">01/06/2025</td><td className="pr-4">Salário</td><td className="pr-4">5000,00</td><td>Crédito</td></tr>
                      <tr><td className="pr-4 py-1">03/06/2025</td><td className="pr-4">Supermercado</td><td className="pr-4">-350,00</td><td>Débito</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-white">{parsed.length}</span> transações encontradas ·{' '}
                  <span className="font-semibold text-blue-400">{selected.size}</span> selecionadas
                </p>
                <button
                  onClick={() => setSelected(selected.size === parsed.length ? new Set() : new Set(parsed.map((_, i) => i)))}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {selected.size === parsed.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>

              <div className="space-y-1 max-h-72 overflow-y-auto">
                {parsed.map((t, i) => (
                  <div
                    key={i}
                    onClick={() => toggleRow(i)}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border',
                      selected.has(i) ? 'bg-slate-800 border-slate-700' : 'bg-slate-800/30 border-transparent opacity-40'
                    )}
                  >
                    <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', t.type === 'receita' ? 'bg-emerald-400' : 'bg-rose-400')} />
                    <span className="text-xs text-slate-300 flex-1 truncate">{t.description}</span>
                    <span className="text-xs text-slate-500">{t.date}</span>
                    <span className={cn('text-xs font-medium shrink-0', t.type === 'receita' ? 'text-emerald-400' : 'text-rose-400')}>
                      {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 size={48} className="text-emerald-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Importação concluída!</h4>
              <p className="text-sm text-slate-400">{selected.size} transações importadas com sucesso.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-800">
          {step === 'upload' && <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancelar</button>}
          {step === 'preview' && (
            <>
              <button onClick={() => setStep('upload')} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Voltar</button>
              <button
                onClick={handleImport}
                disabled={selected.size === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all"
              >
                Importar {selected.size} transações
              </button>
            </>
          )}
          {step === 'done' && <button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all">Fechar</button>}
        </div>
      </div>
    </div>
  );
}
