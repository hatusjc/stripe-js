import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../../domain/entities/transaction_entity.dart';
import '../../providers/transaction_provider.dart';

class AddTransactionScreen extends ConsumerStatefulWidget {
  const AddTransactionScreen({super.key});
  @override
  ConsumerState<AddTransactionScreen> createState() => _AddTransactionScreenState();
}

class _AddTransactionScreenState extends ConsumerState<AddTransactionScreen> {
  TransactionType _type = TransactionType.expense;
  final _amountCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  DateTime _date = DateTime.now();
  bool _saving = false;

  @override
  void dispose() { _amountCtrl.dispose(); _descCtrl.dispose(); super.dispose(); }

  Future<void> _save() async {
    final amountText = _amountCtrl.text.replaceAll(',', '.').replaceAll(r'R$', '').trim();
    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Valor inválido'))); return; }
    setState(() => _saving = true);
    const uuid = Uuid();
    final now = DateTime.now();
    final t = TransactionEntity(
      id: uuid.v4(), userId: 'default', categoryId: 'cat_other_expense',
      type: _type, amountCents: (amount * 100).round(),
      description: _descCtrl.text.isEmpty ? null : _descCtrl.text,
      date: _date, isRecurring: false,
      status: TransactionStatus.confirmed, createdAt: now, updatedAt: now,
    );
    final ok = await ref.read(transactionProvider.notifier).addTransaction(t);
    if (mounted) { setState(() => _saving = false); if (ok) context.pop(); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nova Transação')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          SegmentedButton<TransactionType>(
            segments: const [
              ButtonSegment(value: TransactionType.expense, label: Text('Despesa'), icon: Icon(Icons.arrow_downward)),
              ButtonSegment(value: TransactionType.income, label: Text('Receita'), icon: Icon(Icons.arrow_upward)),
              ButtonSegment(value: TransactionType.transfer, label: Text('Transfer'), icon: Icon(Icons.swap_horiz)),
            ],
            selected: {_type},
            onSelectionChanged: (s) => setState(() => _type = s.first),
          ),
          const SizedBox(height: 16),
          TextField(controller: _amountCtrl, decoration: const InputDecoration(labelText: 'Valor', prefixText: 'R\$ '), keyboardType: const TextInputType.numberWithOptions(decimal: true)),
          const SizedBox(height: 12),
          TextField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Descrição')),
          const SizedBox(height: 12),
          ListTile(
            title: Text('Data: ${_date.day}/${_date.month}/${_date.year}'),
            trailing: const Icon(Icons.calendar_today),
            onTap: () async {
              final d = await showDatePicker(context: context, initialDate: _date, firstDate: DateTime(2000), lastDate: DateTime(2100));
              if (d != null) setState(() => _date = d);
            },
          ),
          const Spacer(),
          FilledButton(onPressed: _saving ? null : _save, child: _saving ? const CircularProgressIndicator() : const Text('Salvar')),
        ]),
      ),
    );
  }
}
