import '../../entities/transaction_entity.dart';
import '../../entities/category_entity.dart';

class SpendingInsight {
  const SpendingInsight({required this.message, required this.type});
  final String message;
  final InsightType type;
}

enum InsightType { warning, info, success, tip }

class GetSpendingInsightsUseCase {
  List<SpendingInsight> call({
    required List<TransactionEntity> currentPeriod,
    required List<TransactionEntity> previousPeriod,
    required List<CategoryEntity> categories,
  }) {
    final insights = <SpendingInsight>[];

    final currentExpense = _totalExpense(currentPeriod);
    final previousExpense = _totalExpense(previousPeriod);

    if (previousExpense > 0 && currentExpense > 0) {
      final changePct = ((currentExpense - previousExpense) / previousExpense * 100).round();
      if (changePct > 10) {
        insights.add(SpendingInsight(
          message: 'Suas despesas aumentaram ${changePct.abs()}% em relação ao período anterior.',
          type: InsightType.warning,
        ));
      } else if (changePct < -10) {
        insights.add(SpendingInsight(
          message: 'Ótimo! Você reduziu suas despesas em ${changePct.abs()}% comparado ao período anterior.',
          type: InsightType.success,
        ));
      }
    }

    // Top spending category
    final categorySpend = <String, int>{};
    for (final t in currentPeriod.where((t) => t.type == TransactionType.expense)) {
      categorySpend[t.categoryId] = (categorySpend[t.categoryId] ?? 0) + t.amountCents;
    }
    if (categorySpend.isNotEmpty) {
      final topCatId = categorySpend.entries.reduce((a, b) => a.value > b.value ? a : b).key;
      final topCat = categories.where((c) => c.id == topCatId).firstOrNull;
      final topAmount = categorySpend[topCatId]!;
      final topPct = currentExpense > 0 ? (topAmount / currentExpense * 100).round() : 0;
      if (topPct >= 30 && topCat != null) {
        insights.add(SpendingInsight(
          message: '${topCat.name} representa $topPct% dos seus gastos este período.',
          type: InsightType.info,
        ));
      }
    }

    // Category comparison
    final prevCategorySpend = <String, int>{};
    for (final t in previousPeriod.where((t) => t.type == TransactionType.expense)) {
      prevCategorySpend[t.categoryId] = (prevCategorySpend[t.categoryId] ?? 0) + t.amountCents;
    }
    for (final entry in categorySpend.entries) {
      final prev = prevCategorySpend[entry.key] ?? 0;
      if (prev > 0) {
        final pct = ((entry.value - prev) / prev * 100).round();
        if (pct > 20) {
          final cat = categories.where((c) => c.id == entry.key).firstOrNull;
          if (cat != null) {
            insights.add(SpendingInsight(
              message: 'Você gastou $pct% a mais com ${cat.name} em comparação ao período anterior.',
              type: InsightType.warning,
            ));
          }
        }
      }
    }

    // Savings tip
    final income = currentPeriod
        .where((t) => t.type == TransactionType.income)
        .fold(0, (s, t) => s + t.amountCents);
    final savings = income - currentExpense;
    if (income > 0) {
      final savingsRate = (savings / income * 100).round();
      if (savingsRate < 10) {
        insights.add(SpendingInsight(
          message: 'Sua taxa de poupança está em $savingsRate%. Recomenda-se pelo menos 20%.',
          type: InsightType.tip,
        ));
      } else if (savingsRate >= 20) {
        insights.add(SpendingInsight(
          message: 'Excelente! Você está poupando $savingsRate% da sua renda.',
          type: InsightType.success,
        ));
      }
    }

    return insights;
  }

  int _totalExpense(List<TransactionEntity> txns) =>
      txns.where((t) => t.type == TransactionType.expense).fold(0, (s, t) => s + t.amountCents);
}
