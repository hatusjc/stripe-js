import 'dart:io';
import 'dart:typed_data';
import 'package:csv/csv.dart';
import 'package:excel/excel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import '../../../domain/entities/transaction_entity.dart';
import '../../../domain/repositories/i_transaction_repository.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/auth_provider.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  DateTime _from = DateTime(DateTime.now().year, DateTime.now().month, 1);
  DateTime _to = DateTime(DateTime.now().year, DateTime.now().month + 1, 0);
  bool _generating = false;
  String? _lastFile;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Relatórios')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Período do relatório', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _DateButton(label: 'De', date: _from, onPick: (d) => setState(() => _from = d))),
                      const SizedBox(width: 12),
                      Expanded(child: _DateButton(label: 'Até', date: _to, onPick: (d) => setState(() => _to = d))),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Formato de exportação', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 12),
          _ExportCard(
            icon: Icons.picture_as_pdf,
            color: Colors.red,
            title: 'PDF',
            subtitle: 'Relatório formatado com tabela e resumo',
            loading: _generating,
            onExport: () => _export('pdf'),
          ),
          const SizedBox(height: 8),
          _ExportCard(
            icon: Icons.table_chart_outlined,
            color: Colors.green,
            title: 'Excel (.xlsx)',
            subtitle: 'Planilha com todas as transações',
            loading: _generating,
            onExport: () => _export('xlsx'),
          ),
          const SizedBox(height: 8),
          _ExportCard(
            icon: Icons.code,
            color: Colors.blue,
            title: 'CSV',
            subtitle: 'Arquivo de texto separado por vírgulas',
            loading: _generating,
            onExport: () => _export('csv'),
          ),
          if (_lastFile != null) ...[
            const SizedBox(height: 16),
            Card(
              color: cs.primaryContainer,
              child: ListTile(
                leading: const Icon(Icons.check_circle, color: Colors.green),
                title: const Text('Arquivo gerado com sucesso!'),
                subtitle: Text(_lastFile!.split('/').last),
                trailing: IconButton(
                  icon: const Icon(Icons.share),
                  onPressed: () => Share.shareXFiles([XFile(_lastFile!)]),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _export(String format) async {
    if (_generating) return;
    setState(() { _generating = true; _lastFile = null; });

    try {
      final userId = ref.read(authProvider).valueOrNull?.userId ?? 'default';
      final repo = ref.read(transactionRepositoryProvider);
      final range = DateRange(start: _from, end: _to.copyWith(hour: 23, minute: 59, second: 59));
      final result = await repo.getByPeriod(range, userId);
      final txns = result.fold((_) => <TransactionEntity>[], (l) => l);
      txns.sort((a, b) => a.date.compareTo(b.date));

      final dir = await getApplicationDocumentsDirectory();
      final ts = DateFormat('yyyyMMdd_HHmmss').format(DateTime.now());
      String filePath;

      if (format == 'pdf') {
        filePath = '${dir.path}/relatorio_$ts.pdf';
        final bytes = await _buildPdf(txns);
        await File(filePath).writeAsBytes(bytes);
      } else if (format == 'xlsx') {
        filePath = '${dir.path}/relatorio_$ts.xlsx';
        final bytes = _buildExcel(txns);
        await File(filePath).writeAsBytes(bytes);
      } else {
        filePath = '${dir.path}/relatorio_$ts.csv';
        final content = _buildCsv(txns);
        await File(filePath).writeAsString(content);
      }

      if (!mounted) return;
      setState(() { _generating = false; _lastFile = filePath; });
      await Share.shareXFiles([XFile(filePath)]);
    } catch (e) {
      if (!mounted) return;
      setState(() => _generating = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro ao gerar relatório: $e')));
    }
  }

  Future<Uint8List> _buildPdf(List<TransactionEntity> txns) async {
    final doc = pw.Document();
    final income = txns.where((t) => t.type == TransactionType.income).fold(0, (s, t) => s + t.amountCents);
    final expense = txns.where((t) => t.type == TransactionType.expense).fold(0, (s, t) => s + t.amountCents);

    doc.addPage(pw.MultiPage(
      pageFormat: PdfPageFormat.a4,
      build: (ctx) => [
        pw.Header(level: 0, child: pw.Text('FinanFlow — Relatório Financeiro', style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold))),
        pw.Text('Período: ${_fmtDate(_from)} a ${_fmtDate(_to)}'),
        pw.SizedBox(height: 12),
        pw.Row(children: [
          pw.Expanded(child: pw.Container(
            padding: const pw.EdgeInsets.all(8),
            decoration: pw.BoxDecoration(border: pw.Border.all()),
            child: pw.Column(children: [
              pw.Text('Receitas', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
              pw.Text(_fmtCents(income), style: const pw.TextStyle(color: PdfColors.green)),
            ]),
          )),
          pw.SizedBox(width: 8),
          pw.Expanded(child: pw.Container(
            padding: const pw.EdgeInsets.all(8),
            decoration: pw.BoxDecoration(border: pw.Border.all()),
            child: pw.Column(children: [
              pw.Text('Despesas', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
              pw.Text(_fmtCents(expense), style: const pw.TextStyle(color: PdfColors.red)),
            ]),
          )),
          pw.SizedBox(width: 8),
          pw.Expanded(child: pw.Container(
            padding: const pw.EdgeInsets.all(8),
            decoration: pw.BoxDecoration(border: pw.Border.all()),
            child: pw.Column(children: [
              pw.Text('Saldo', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
              pw.Text(_fmtCents(income - expense)),
            ]),
          )),
        ]),
        pw.SizedBox(height: 16),
        pw.Table.fromTextArray(
          headers: ['Data', 'Descrição', 'Tipo', 'Valor'],
          data: txns.map((t) => [
            _fmtDate(t.date),
            t.description ?? '-',
            _typeLabel(t.type),
            _fmtCents(t.amountCents),
          ]).toList(),
          headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10),
          cellStyle: const pw.TextStyle(fontSize: 9),
          columnWidths: {0: const pw.FixedColumnWidth(60), 1: const pw.FlexColumnWidth(), 2: const pw.FixedColumnWidth(55), 3: const pw.FixedColumnWidth(65)},
        ),
      ],
    ));
    return doc.save();
  }

  List<int> _buildExcel(List<TransactionEntity> txns) {
    final excel = Excel.createExcel();
    final sheet = excel['Transações'];
    sheet.appendRow([
      TextCellValue('Data'), TextCellValue('Descrição'), TextCellValue('Tipo'),
      TextCellValue('Valor (R\$)'), TextCellValue('Status'),
    ]);
    for (final t in txns) {
      sheet.appendRow([
        TextCellValue(_fmtDate(t.date)),
        TextCellValue(t.description ?? ''),
        TextCellValue(_typeLabel(t.type)),
        DoubleCellValue(t.amountCents / 100),
        TextCellValue(t.status.name),
      ]);
    }
    return excel.encode()!;
  }

  String _buildCsv(List<TransactionEntity> txns) {
    final rows = [
      ['Data', 'Descrição', 'Tipo', 'Valor', 'Status'],
      ...txns.map((t) => [_fmtDate(t.date), t.description ?? '', _typeLabel(t.type), (t.amountCents / 100).toStringAsFixed(2), t.status.name]),
    ];
    return const ListToCsvConverter().convert(rows);
  }

  String _fmtDate(DateTime d) => '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
  String _fmtCents(int cents) => 'R\$ ${(cents / 100).toStringAsFixed(2).replaceAll('.', ',')}';
  String _typeLabel(TransactionType t) => switch (t) {
    TransactionType.income => 'Receita',
    TransactionType.expense => 'Despesa',
    TransactionType.transfer => 'Transferência',
  };
}

class _DateButton extends StatelessWidget {
  const _DateButton({required this.label, required this.date, required this.onPick});
  final String label;
  final DateTime date;
  final void Function(DateTime) onPick;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      icon: const Icon(Icons.calendar_today, size: 16),
      label: Text('$label: ${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}'),
      onPressed: () async {
        final d = await showDatePicker(
          context: context,
          initialDate: date,
          firstDate: DateTime(2020),
          lastDate: DateTime(2100),
        );
        if (d != null) onPick(d);
      },
    );
  }
}

class _ExportCard extends StatelessWidget {
  const _ExportCard({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.loading,
    required this.onExport,
  });
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final bool loading;
  final VoidCallback onExport;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withAlpha(30),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: loading
            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
            : FilledButton.tonal(onPressed: onExport, child: const Text('Exportar')),
      ),
    );
  }
}

extension _DateCopyWith on DateTime {
  DateTime copyWith({int? hour, int? minute, int? second}) =>
      DateTime(year, month, day, hour ?? this.hour, minute ?? this.minute, second ?? this.second);
}
