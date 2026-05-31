import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../domain/entities/transaction_entity.dart';

class SpendingChart extends StatelessWidget {
  const SpendingChart({super.key, required this.transactions});
  final List<TransactionEntity> transactions;

  @override
  Widget build(BuildContext context) {

    final barGroups = _buildBarGroups();

    if (barGroups.isEmpty) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Resumo Semanal',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 16),
            RepaintBoundary(
              child: SizedBox(
                height: 160,
                child: BarChart(
                  BarChartData(
                    alignment: BarChartAlignment.spaceAround,
                    maxY: _maxY(),
                    barTouchData: BarTouchData(enabled: true),
                    titlesData: FlTitlesData(
                      leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
                            return Text(
                              value.toInt() < days.length ? days[value.toInt()] : '',
                              style: Theme.of(context).textTheme.labelSmall,
                            );
                          },
                        ),
                      ),
                    ),
                    gridData: const FlGridData(show: false),
                    borderData: FlBorderData(show: false),
                    barGroups: barGroups,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<BarChartGroupData> _buildBarGroups() {
    final now = DateTime.now();
    final weeklyData = List.generate(7, (_) => [0, 0]); // [income, expense]

    for (final t in transactions) {
      final diff = now.difference(t.date).inDays;
      if (diff >= 0 && diff < 7) {
        final dayIndex = 6 - diff;
        if (t.type == TransactionType.income) {
          weeklyData[dayIndex][0] += t.amountCents;
        } else if (t.type == TransactionType.expense) {
          weeklyData[dayIndex][1] += t.amountCents;
        }
      }
    }

    return List.generate(7, (i) {
      final income = weeklyData[i][0] / 100.0;
      final expense = weeklyData[i][1] / 100.0;
      return BarChartGroupData(
        x: i,
        barRods: [
          if (income > 0)
            BarChartRodData(
              toY: income,
              color: AppColors.income,
              width: 8,
              borderRadius: BorderRadius.circular(4),
            ),
          if (expense > 0)
            BarChartRodData(
              toY: expense,
              color: AppColors.expense,
              width: 8,
              borderRadius: BorderRadius.circular(4),
            ),
        ],
      );
    });
  }

  double _maxY() {
    double max = 0;
    for (final t in transactions) {
      final v = t.amountCents / 100.0;
      if (v > max) max = v;
    }
    return (max * 1.2).ceilToDouble().clamp(100, double.infinity);
  }
}
