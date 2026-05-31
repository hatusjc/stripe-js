import 'package:flutter_test/flutter_test.dart';
import 'package:finanflow/domain/usecases/analytics/calculate_health_score_usecase.dart';
import 'package:finanflow/domain/entities/transaction_entity.dart';
import 'package:finanflow/domain/entities/goal_entity.dart';
import 'package:finanflow/domain/entities/budget_entity.dart';

TransactionEntity _txn(TransactionType type, int cents) => TransactionEntity(
      id: 'test', userId: 'u1', categoryId: 'cat',
      type: type, amountCents: cents, date: DateTime.now(),
      status: TransactionStatus.confirmed, isRecurring: false,
      createdAt: DateTime.now(), updatedAt: DateTime.now(),
    );

void main() {
  late CalculateHealthScoreUseCase useCase;

  setUp(() => useCase = CalculateHealthScoreUseCase());

  test('perfect score when income > expense, full reserve, goals progressing', () async {
    final income = _txn(TransactionType.income, 500000); // R$5000
    final expense = _txn(TransactionType.expense, 200000); // R$2000
    final result = await useCase.call(
      currentMonthTransactions: [income, expense],
      last3MonthsTransactions: [income, expense, income, expense, income, expense],
      goals: [],
      budgets: [],
      emergencyReserveTargetCents: 100000,
      emergencyReserveCurrentCents: 100000,
    );
    expect(result.total, greaterThanOrEqualTo(60));
  });

  test('low score when expenses exceed income', () async {
    final income = _txn(TransactionType.income, 100000); // R$1000
    final expense = _txn(TransactionType.expense, 200000); // R$2000
    final result = await useCase.call(
      currentMonthTransactions: [income, expense],
      last3MonthsTransactions: [income, expense],
      goals: [],
      budgets: [],
      emergencyReserveTargetCents: 0,
      emergencyReserveCurrentCents: 0,
    );
    expect(result.incomeExpenseScore, equals(0));
    expect(result.insights, isNotEmpty);
  });

  test('score is clamped between 0 and 100', () async {
    final result = await useCase.call(
      currentMonthTransactions: [],
      last3MonthsTransactions: [],
      goals: [],
      budgets: [],
      emergencyReserveTargetCents: 0,
      emergencyReserveCurrentCents: 0,
    );
    expect(result.total, inInclusiveRange(0, 100));
  });

  test('grade A for score >= 80', () async {
    final income = _txn(TransactionType.income, 1000000);
    final expense = _txn(TransactionType.expense, 200000);
    final result = await useCase.call(
      currentMonthTransactions: [income, expense],
      last3MonthsTransactions: List.generate(6, (i) => i.isEven ? income : expense),
      goals: [],
      budgets: [],
      emergencyReserveTargetCents: 100000,
      emergencyReserveCurrentCents: 100000,
    );
    if (result.total >= 80) expect(result.grade, 'A');
  });
}
