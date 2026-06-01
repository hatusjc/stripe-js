import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../domain/entities/goal_entity.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../data/repositories/goal_repository_impl.dart';
import '../../data/datasources/local/database_helper.dart';
import 'auth_provider.dart';

final goalRepositoryProvider =
    Provider((_) => GoalRepositoryImpl(DatabaseHelper.instance));

final goalsProvider =
    AsyncNotifierProvider<GoalsNotifier, List<GoalEntity>>(GoalsNotifier.new);

class GoalsNotifier extends AsyncNotifier<List<GoalEntity>> {
  @override
  Future<List<GoalEntity>> build() => _fetch();

  Future<List<GoalEntity>> _fetch() async {
    final userId =
        ref.watch(authProvider).valueOrNull?.userId ?? 'default';
    final repo = ref.watch(goalRepositoryProvider);
    final result = await repo.getAll(userId);
    return result.fold((f) => throw Exception(f.message), (l) => l);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }

  Future<Either<Failure, GoalEntity>> create({
    required String name,
    required GoalType type,
    required int targetAmountCents,
    required Color color,
    String? description,
    DateTime? targetDate,
    String? iconName,
    int? monthlyContributionCents,
  }) async {
    final userId =
        ref.read(authProvider).valueOrNull?.userId ?? 'default';
    final repo = ref.read(goalRepositoryProvider);
    final now = DateTime.now();
    final goal = GoalEntity(
      id: const Uuid().v4(),
      userId: userId,
      name: name.trim(),
      description: description?.trim(),
      type: type,
      targetAmountCents: targetAmountCents,
      currentAmountCents: 0,
      targetDate: targetDate,
      iconName: iconName,
      color: color,
      status: GoalStatus.active,
      priority: 1,
      monthlyContributionCents: monthlyContributionCents,
      createdAt: now,
      updatedAt: now,
    );
    final result = await repo.create(goal);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, GoalEntity>> save(GoalEntity goal) async {
    final repo = ref.read(goalRepositoryProvider);
    final result = await repo.update(goal);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, GoalEntity>> contribute(
      String goalId, int amountCents) async {
    final repo = ref.read(goalRepositoryProvider);
    final result = await repo.addContribution(goalId, amountCents);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, void>> delete(String id) async {
    final repo = ref.read(goalRepositoryProvider);
    final result = await repo.delete(id);
    if (result.isRight) await refresh();
    return result;
  }
}
