import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/route_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/entities/transaction_entity.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/settings_provider.dart';
import 'widgets/balance_card.dart';
import 'widgets/spending_chart.dart';
import 'widgets/recent_transactions.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final txnState = ref.watch(transactionProvider);
    final settings = ref.watch(settingsProvider).valueOrNull;
    final hideBalance = settings?.hideBalance ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('FinanFlow'),
        actions: [
          IconButton(
            icon: Icon(hideBalance ? Icons.visibility_off_outlined : Icons.visibility_outlined),
            onPressed: () {
              ref.read(settingsProvider.notifier).updateSettings(
                    (s) => s.copyWith(hideBalance: !hideBalance),
                  );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: txnState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (state) => RefreshIndicator(
          onRefresh: () => ref.read(transactionProvider.notifier).refresh(),
          child: CustomScrollView(
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    BalanceCard(
                      balanceCents: state.balanceCents,
                      incomeCents: state.totalIncomeCents,
                      expenseCents: state.totalExpenseCents,
                      hideBalance: hideBalance,
                      currencySymbol: _currencySymbol(settings?.currencyCode),
                    ),
                    const SizedBox(height: 16),

                    // Quick Actions
                    Row(
                      children: [
                        _QuickActionBtn(
                          icon: Icons.add,
                          label: 'Receita',
                          color: AppColors.income,
                          onTap: () => context.push(
                            RouteConstants.transactionAdd,
                            extra: TransactionType.income,
                          ),
                        ),
                        const SizedBox(width: 8),
                        _QuickActionBtn(
                          icon: Icons.remove,
                          label: 'Despesa',
                          color: AppColors.expense,
                          onTap: () => context.push(
                            RouteConstants.transactionAdd,
                            extra: TransactionType.expense,
                          ),
                        ),
                        const SizedBox(width: 8),
                        _QuickActionBtn(
                          icon: Icons.swap_horiz,
                          label: 'Transferir',
                          color: AppColors.transfer,
                          onTap: () => context.push(
                            RouteConstants.transactionAdd,
                            extra: TransactionType.transfer,
                          ),
                        ),
                        const SizedBox(width: 8),
                        _QuickActionBtn(
                          icon: Icons.bar_chart,
                          label: 'Relatório',
                          color: Theme.of(context).colorScheme.primary,
                          onTap: () => context.go(RouteConstants.reports),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Spending chart
                    if (state.transactions.isNotEmpty) ...[
                      SpendingChart(transactions: state.transactions),
                      const SizedBox(height: 16),
                    ],

                    // Recent transactions
                    RecentTransactions(transactions: state.transactions.take(10).toList()),
                    const SizedBox(height: 80),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(RouteConstants.transactionAdd),
        icon: const Icon(Icons.add),
        label: const Text('Nova transação'),
      ),
    );
  }

  String _currencySymbol(String? code) {
    switch (code) {
      case 'USD': return '\$';
      case 'EUR': return '€';
      default: return 'R\$';
    }
  }
}

class _QuickActionBtn extends StatelessWidget {
  const _QuickActionBtn({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 4),
              Text(label,
                  style: TextStyle(
                    fontSize: 11,
                    color: color,
                    fontWeight: FontWeight.w600,
                  )),
            ],
          ),
        ),
      ),
    );
  }
}
