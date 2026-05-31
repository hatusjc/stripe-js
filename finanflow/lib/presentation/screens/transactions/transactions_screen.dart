import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/route_constants.dart';
import '../../../core/extensions/double_extension.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/entities/transaction_entity.dart';
import '../../providers/transaction_provider.dart';

class TransactionsScreen extends ConsumerWidget {
  const TransactionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(transactionProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Transações')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (data) => data.transactions.isEmpty
            ? const Center(child: Text('Nenhuma transação'))
            : ListView.builder(
                itemCount: data.transactions.length,
                itemBuilder: (ctx, i) {
                  final t = data.transactions[i];
                  final isIncome = t.type == TransactionType.income;
                  final color = isIncome ? AppColors.income : AppColors.expense;
                  return Slidable(
                    endActionPane: ActionPane(
                      motion: const DrawerMotion(),
                      children: [
                        SlidableAction(
                          onPressed: (_) =>
                              ref.read(transactionProvider.notifier).deleteTransaction(t.id),
                          backgroundColor: AppColors.expense,
                          foregroundColor: Colors.white,
                          icon: Icons.delete,
                          label: 'Excluir',
                        ),
                      ],
                    ),
                    child: ListTile(
                      onTap: () => context.push('/transactions/${t.id}'),
                      leading: CircleAvatar(
                        backgroundColor: color.withValues(alpha: 0.15),
                        child: Icon(
                          isIncome ? Icons.arrow_upward : Icons.arrow_downward,
                          color: color, size: 20,
                        ),
                      ),
                      title: Text(t.description ?? (isIncome ? 'Receita' : 'Despesa')),
                      subtitle: Text(DateFormat('dd/MM/yyyy').format(t.date)),
                      trailing: Text(
                        '${isIncome ? '+' : '-'} ${t.amountCents.toCurrencyFromCents()}',
                        style: TextStyle(color: color, fontWeight: FontWeight.w600),
                      ),
                    ),
                  );
                },
              ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push(RouteConstants.transactionAdd),
        child: const Icon(Icons.add),
      ),
    );
  }
}
