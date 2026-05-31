import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../domain/entities/budget_entity.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../data/repositories/budget_repository_impl.dart';
import '../../data/datasources/local/database_helper.dart';
import 'auth_provider.dart';

final budgetRepositoryProvider =
    Provider((_) => BudgetRepositoryImpl(DatabaseHelper.instance));

/// Budget with its current spend for the active period.
class BudgetSummary {
  const BudgetSummary({required this.budget, required this.spentCents});
  final BudgetEntity budget;
  final int spentCents;

  double get progressPercent => budget.spentPercent(spentCents);
  int get remainingCents =>
      (budget.amountCents - spentCents).clamp(0, budget.amountCents);
  bool get isOverBudget => spentCents > budget.amountCents;
  bool get isNearAlert => budget.isOverAlert(spentCents);
}

final budgetsProvider =
    AsyncNotifierProvider<BudgetsNotifier, List<BudgetSummary>>(
  BudgetsNotifier.new,
);

class BudgetsNotifier extends AsyncNotifier<List<BudgetSummary>> {
  @override
  Future<List<BudgetSummary>> build() => _fetch();

  Future<List<BudgetSummary>> _fetch() async {
    final userId =
        ref.watch(authProvider).valueOrNull?.userId ?? 'default';
    final repo = ref.watch(budgetRepositoryProvider);
    final result = await repo.getActive(userId);
    final budgets = result.fold((f) => throw Exception(f.message), (l) => l);

    final now = DateTime.now();
    return Future.wait(budgets.map((b) async {
      final (from, to) = _periodRange(b, now);
      final spent = await repo.getSpentCents(
        userId: userId,
        categoryId: b.categoryId,
        from: from,
        to: to,
      );
      return BudgetSummary(budget: b, spentCents: spent);
    }));
  }

  (DateTime, DateTime) _periodRange(BudgetEntity b, DateTime now) =>
      switch (b.period) {
        BudgetPeriod.weekly => (
            now.subtract(Duration(days: now.weekday - 1)),
            now.add(Duration(days: 7 - now.weekday)),
          ),
        BudgetPeriod.monthly => (
            DateTime(now.year, now.month, 1),
            DateTime(now.year, now.month + 1, 0),
          ),
        BudgetPeriod.yearly => (
            DateTime(now.year, 1, 1),
            DateTime(now.year, 12, 31),
          ),
        BudgetPeriod.custom => (b.startDate, b.endDate ?? now),
      };

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }

  Future<Either<Failure, BudgetEntity>> create({
    required String name,
    required int amountCents,
    required BudgetPeriod period,
    String? categoryId,
    int alertAt = 80,
  }) async {
    final userId =
        ref.read(authProvider).valueOrNull?.userId ?? 'default';
    final repo = ref.read(budgetRepositoryProvider);
    final now = DateTime.now();
    final budget = BudgetEntity(
      id: const Uuid().v4(),
      userId: userId,
      name: name.trim(),
      categoryId: categoryId,
      amountCents: amountCents,
      period: period,
      startDate: DateTime(now.year, now.month, 1),
      alertAt: alertAt,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    );
    final result = await repo.create(budget);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, BudgetEntity>> save(BudgetEntity budget) async {
    final repo = ref.read(budgetRepositoryProvider);
    final result = await repo.update(budget);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, void>> delete(String id) async {
    final repo = ref.read(budgetRepositoryProvider);
    final result = await repo.delete(id);
    if (result.isRight) await refresh();
    return result;
  }
}
