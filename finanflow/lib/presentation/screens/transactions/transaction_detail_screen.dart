import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/extensions/double_extension.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/entities/transaction_entity.dart';
import '../../providers/transaction_provider.dart';

class TransactionDetailScreen extends ConsumerWidget {
  const TransactionDetailScreen({super.key, required this.id});
  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(transactionProvider).valueOrNull;
    final t = state?.transactions.where((t) => t.id == id).firstOrNull;
    if (t == null) return Scaffold(appBar: AppBar(), body: const Center(child: Text('Não encontrado')));
    final isIncome = t.type == TransactionType.income;
    final color = isIncome ? AppColors.income : AppColors.expense;
    return Scaffold(
      appBar: AppBar(title: const Text('Detalhes')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Card(child: Padding(padding: const EdgeInsets.all(20), child: Row(children: [
            CircleAvatar(backgroundColor: color.withValues(alpha: 0.15), radius: 28, child: Icon(isIncome ? Icons.arrow_upward : Icons.arrow_downward, color: color, size: 28)),
            const SizedBox(width: 16),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(t.description ?? (isIncome ? 'Receita' : 'Despesa'), style: Theme.of(context).textTheme.titleLarge),
              Text(DateFormat('dd/MM/yyyy').format(t.date)),
            ])),
            Text('${isIncome ? '+' : '-'} ${t.amountCents.toCurrencyFromCents()}', style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.w700)),
          ]))),
        ]),
      ),
    );
  }
}
