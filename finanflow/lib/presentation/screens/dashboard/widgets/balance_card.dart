import 'package:flutter/material.dart';
import '../../../../core/extensions/double_extension.dart';
import '../../../../core/theme/app_colors.dart';

class BalanceCard extends StatelessWidget {
  const BalanceCard({
    super.key,
    required this.balanceCents,
    required this.incomeCents,
    required this.expenseCents,
    required this.hideBalance,
    this.currencySymbol = 'R\$',
  });

  final int balanceCents;
  final int incomeCents;
  final int expenseCents;
  final bool hideBalance;
  final String currencySymbol;

  @override
  Widget build(BuildContext context) {


    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.premiumGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.seed.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Saldo do Mês',
            style: TextStyle(color: Colors.white70, fontSize: 14, fontFamily: 'Inter'),
          ),
          const SizedBox(height: 8),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: Text(
              hideBalance
                  ? '••••••'
                  : balanceCents.toCurrencyFromCents(symbol: currencySymbol),
              key: ValueKey(hideBalance),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontFamily: 'Inter',
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _StatItem(
                  label: 'Receitas',
                  valueCents: incomeCents,
                  color: AppColors.income,
                  icon: Icons.arrow_upward,
                  hidden: hideBalance,
                  symbol: currencySymbol,
                ),
              ),
              Container(width: 1, height: 40, color: Colors.white24),
              Expanded(
                child: _StatItem(
                  label: 'Despesas',
                  valueCents: expenseCents,
                  color: const Color(0xFFFF6B6B),
                  icon: Icons.arrow_downward,
                  hidden: hideBalance,
                  symbol: currencySymbol,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem({
    required this.label,
    required this.valueCents,
    required this.color,
    required this.icon,
    required this.hidden,
    required this.symbol,
  });
  final String label;
  final int valueCents;
  final Color color;
  final IconData icon;
  final bool hidden;
  final String symbol;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'Inter')),
                Text(
                  hidden ? '••••' : valueCents.toCurrencyFromCents(symbol: symbol),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontFamily: 'Inter',
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
