'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { usePlanStore } from '@/lib/store/planStore';
import Link from 'next/link';
import { Crown } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => Promise<void> | void;
  label?: string;
  className?: string;
}

export function ExportButton({ onExport, label = 'Exportar PDF', className }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const { isPremium } = usePlanStore();

  if (!isPremium()) {
    return (
      <Link
        href="/planos"
        className={`flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded-lg text-sm font-medium transition-all ${className}`}
      >
        <Crown size={14} /> PDF — Premium
      </Link>
    );
  }

  const handleClick = async () => {
    setLoading(true);
    try {
      await onExport();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 rounded-lg text-sm font-medium transition-all ${className}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      {label}
    </button>
  );
}

// Generate a clean financial PDF using jsPDF
export async function generateFinancePDF(data: {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  transactions: { date: string; description: string; category: string; type: string; amount: number }[];
}) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LifeOS', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Financeiro — ' + data.month, 14, 27);

  // Summary boxes
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  const boxes = [
    { label: 'Receitas', value: `R$ ${data.income.toFixed(2)}`, color: [16, 185, 129] as [number, number, number] },
    { label: 'Despesas', value: `R$ ${data.expenses.toFixed(2)}`, color: [239, 68, 68] as [number, number, number] },
    { label: 'Saldo', value: `R$ ${data.balance.toFixed(2)}`, color: [59, 130, 246] as [number, number, number] },
  ];
  boxes.forEach((box, i) => {
    const x = 14 + i * 64;
    doc.setFillColor(...box.color);
    doc.roundedRect(x, 42, 58, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(box.label, x + 4, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(box.value, x + 4, 57);
    doc.setFontSize(9);
  });

  // Transactions table
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Transações', 14, 74);

  autoTable(doc, {
    startY: 78,
    head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
    body: data.transactions.map((t) => [
      t.date,
      t.description,
      t.category,
      t.type === 'receita' ? 'Receita' : 'Despesa',
      `R$ ${t.amount.toFixed(2)}`,
    ]),
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      4: { halign: 'right' },
    },
    didParseCell: (hookData) => {
      if (hookData.column.index === 4 && hookData.section === 'body') {
        const type = data.transactions[hookData.row.index]?.type;
        hookData.cell.styles.textColor = type === 'receita' ? [16, 185, 129] : [239, 68, 68];
      }
    },
  });

  // Footer
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `LifeOS — Gerado em ${new Date().toLocaleDateString('pt-BR')} — Página ${i} de ${pageCount}`,
      14, 287
    );
  }

  doc.save(`lifeos-financas-${data.month.toLowerCase().replace(/\s/g, '-')}.pdf`);
}

export async function generateReportPDF(reportData: {
  lifeScore: number;
  month: string;
  income: number;
  expenses: number;
  savings: number;
  projectsActive: number;
  goalsAvgProgress: number;
  topAlerts: string[];
}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LifeOS', 14, 18);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Semanal — ' + reportData.month, 14, 28);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(String(reportData.lifeScore), 170, 30);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('/100', 185, 30);

  let y = 52;
  const section = (title: string) => {
    doc.setFillColor(30, 41, 59);
    doc.rect(14, y - 5, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 16, y + 1);
    y += 10;
  };
  const row = (label: string, value: string) => {
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(label, 16, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 150, y, { align: 'right' });
    y += 7;
  };

  section('FINANÇAS');
  row('Receitas', `R$ ${reportData.income.toFixed(2)}`);
  row('Despesas', `R$ ${reportData.expenses.toFixed(2)}`);
  row('Poupança', `R$ ${reportData.savings.toFixed(2)}`);

  y += 4;
  section('PROJETOS & OBJETIVOS');
  row('Projetos em andamento', String(reportData.projectsActive));
  row('Progresso médio dos objetivos', `${reportData.goalsAvgProgress}%`);

  if (reportData.topAlerts.length > 0) {
    y += 4;
    section('ALERTAS');
    reportData.topAlerts.slice(0, 5).forEach((alert) => {
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`• ${alert}`, 16, y);
      y += 6;
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 287);

  doc.save(`lifeos-relatorio-${reportData.month.toLowerCase().replace(/\s/g, '-')}.pdf`);
}
