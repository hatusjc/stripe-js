import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/route_constants.dart';
import '../../../../core/extensions/double_extension.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../domain/entities/transaction_entity.dart';

class RecentTransactions extends StatelessWidget {
  const RecentTransactions({super.key, required this.transactions});
  final List<TransactionEntity> transactions;

  @override
  Widget build(BuildContext context) {
    if (transactions.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Center(
            child: Column(
              children: [
                Icon(Icons.receipt_long_outlined,
                    size: 48, color: Theme.of(context).colorScheme.outline),
                const SizedBox(height: 12),
                Text('Nenhuma transação este mês',
                    style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Transações Recentes',
                style: Theme.of(context).textTheme.titleMedium),
            TextButton(
              onPressed: () => context.go(RouteConstants.transactions),
              child: const Text('Ver todas'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Card(
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: transactions.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (ctx, i) {
              final t = transactions[i];
              return _TransactionTile(transaction: t);
            },
          ),
        ),
      ],
    );
  }
}

class _TransactionTile extends StatelessWidget {
  const _TransactionTile({required this.transaction});
  final TransactionEntity transaction;

  @override
  Widget build(BuildContext context) {
    final isIncome = transaction.type == TransactionType.income;
    final isTransfer = transaction.type == TransactionType.transfer;
    final color = isTransfer
        ? AppColors.transfer
        : isIncome
            ? AppColors.income
            : AppColors.expense;
    final sign = isIncome ? '+' : isTransfer ? '↔' : '-';

    return ListTile(
      onTap: () => context.push('/transactions/${transaction.id}'),
      leading: CircleAvatar(
        backgroundColor: color.withValues(alpha: 0.15),
        child: Icon(
          isTransfer ? Icons.swap_horiz : isIncome ? Icons.arrow_upward : Icons.arrow_downward,
          color: color,
          size: 20,
        ),
      ),
      title: Text(
        transaction.description ?? (isIncome ? 'Receita' : isTransfer ? 'Transferência' : 'Despesa'),
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: Text(
        DateFormat('dd/MM/yyyy').format(transaction.date),
        style: Theme.of(context).textTheme.bodySmall,
      ),
      trailing: Text(
        '$sign ${transaction.amountCents.toCurrencyFromCents()}',
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      ),
    );
  }
}
