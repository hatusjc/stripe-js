import '../../entities/transaction_entity.dart';
import '../../entities/goal_entity.dart';
import '../../entities/budget_entity.dart';

class HealthScoreResult {
  const HealthScoreResult({
    required this.total,
    required this.incomeExpenseScore,
    required this.emergencyReserveScore,
    required this.goalProgressScore,
    required this.budgetAdherenceScore,
    required this.savingsConsistencyScore,
    required this.insights,
  });

  final int total;
  final int incomeExpenseScore;
  final int emergencyReserveScore;
  final int goalProgressScore;
  final int budgetAdherenceScore;
  final int savingsConsistencyScore;
  final List<String> insights;

  String get grade {
    if (total >= 80) return 'A';
    if (total >= 60) return 'B';
    if (total >= 40) return 'C';
    if (total >= 20) return 'D';
    return 'F';
  }
}

class CalculateHealthScoreUseCase {
  Future<HealthScoreResult> call({
    required List<TransactionEntity> currentMonthTransactions,
    required List<TransactionEntity> last3MonthsTransactions,
    required List<GoalEntity> goals,
    required List<BudgetEntity> budgets,
    required int emergencyReserveTargetCents,
    required int emergencyReserveCurrentCents,
  }) async {
    final insights = <String>[];

    // 1. Income/expense ratio (30 pts)
    final income = currentMonthTransactions
        .where((t) => t.type == TransactionType.income)
        .fold(0, (s, t) => s + t.amountCents);
    final expense = currentMonthTransactions
        .where((t) => t.type == TransactionType.expense)
        .fold(0, (s, t) => s + t.amountCents);
    int incomeExpenseScore;
    if (income <= 0) {
      incomeExpenseScore = 0;
    } else {
      final ratio = expense / income;
      if (ratio <= 0.5) {
        incomeExpenseScore = 30;
      } else if (ratio <= 0.7) {
        incomeExpenseScore = 20;
      } else if (ratio <= 0.9) {
        incomeExpenseScore = 10;
      } else if (ratio <= 1.0) {
        incomeExpenseScore = 5;
      } else {
        incomeExpenseScore = 0;
        insights.add('Suas despesas superam sua renda este mês.');
      }
    }

    // 2. Emergency reserve (25 pts)
    int emergencyReserveScore;
    if (emergencyReserveTargetCents <= 0) {
      emergencyReserveScore = 12;
    } else {
      final pct = emergencyReserveCurrentCents / emergencyReserveTargetCents;
      emergencyReserveScore = (pct.clamp(0.0, 1.0) * 25).round();
      if (pct < 0.5) insights.add('Sua reserva de emergência está abaixo de 50% da meta.');
    }

    // 3. Goal progress (20 pts)
    int goalProgressScore;
    if (goals.isEmpty) {
      goalProgressScore = 10;
    } else {
      final avgProgress = goals
          .where((g) => g.status == GoalStatus.active)
          .fold(0.0, (s, g) => s + g.progressPercent) /
          goals.where((g) => g.status == GoalStatus.active).length.clamp(1, 999);
      goalProgressScore = (avgProgress * 20).round().clamp(0, 20);
    }

    // 4. Budget adherence (15 pts)
    int budgetAdherenceScore;
    if (budgets.isEmpty) {
      budgetAdherenceScore = 8;
    } else {
      final overBudget = budgets.where((b) {
        final spent = currentMonthTransactions
            .where((t) => b.categoryId == null || t.categoryId == b.categoryId)
            .fold(0, (s, t) => s + t.amountCents);
        return spent > b.amountCents;
      }).length;
      final ratio = 1.0 - (overBudget / budgets.length);
      budgetAdherenceScore = (ratio * 15).round().clamp(0, 15);
      if (overBudget > 0) insights.add('Você ultrapassou $overBudget orçamento(s) este mês.');
    }

    // 5. Savings consistency over last 3 months (10 pts)
    int savingsConsistencyScore = 0;
    final months = _groupByMonth(last3MonthsTransactions);
    int savingMonths = 0;
    for (final monthTxns in months.values) {
      final mIncome = monthTxns.where((t) => t.type == TransactionType.income).fold(0, (s, t) => s + t.amountCents);
      final mExpense = monthTxns.where((t) => t.type == TransactionType.expense).fold(0, (s, t) => s + t.amountCents);
      if (mIncome > mExpense) savingMonths++;
    }
    savingsConsistencyScore = ((savingMonths / 3) * 10).round().clamp(0, 10);
    if (savingMonths < 2) insights.add('Você poupou dinheiro em menos de 2 dos últimos 3 meses.');

    final total = (incomeExpenseScore + emergencyReserveScore + goalProgressScore + budgetAdherenceScore + savingsConsistencyScore).clamp(0, 100);

    return HealthScoreResult(
      total: total,
      incomeExpenseScore: incomeExpenseScore,
      emergencyReserveScore: emergencyReserveScore,
      goalProgressScore: goalProgressScore,
      budgetAdherenceScore: budgetAdherenceScore,
      savingsConsistencyScore: savingsConsistencyScore,
      insights: insights,
    );
  }

  Map<String, List<TransactionEntity>> _groupByMonth(List<TransactionEntity> txns) {
    final map = <String, List<TransactionEntity>>{};
    for (final t in txns) {
      final key = '${t.date.year}-${t.date.month}';
      map.putIfAbsent(key, () => []).add(t);
    }
    return map;
  }
}
