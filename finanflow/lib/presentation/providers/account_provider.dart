import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../domain/entities/account_entity.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../data/repositories/account_repository_impl.dart';
import '../../data/datasources/local/database_helper.dart';
import 'auth_provider.dart';

final accountRepositoryProvider = Provider((ref) {
  return AccountRepositoryImpl(DatabaseHelper.instance);
});

final accountsProvider =
    AsyncNotifierProvider<AccountsNotifier, List<AccountEntity>>(
  AccountsNotifier.new,
);

final totalBalanceProvider = Provider<int>((ref) {
  final accounts = ref.watch(accountsProvider).valueOrNull ?? [];
  return accounts
      .where((a) => a.includeInTotal)
      .fold(0, (sum, a) => sum + a.currentBalanceCents);
});

class AccountsNotifier extends AsyncNotifier<List<AccountEntity>> {
  @override
  Future<List<AccountEntity>> build() => _fetch();

  Future<List<AccountEntity>> _fetch() async {
    final auth = ref.watch(authProvider).valueOrNull;
    final userId = auth?.userId ?? 'default';
    final repo = ref.watch(accountRepositoryProvider);
    final result = await repo.getAll(userId);
    return result.fold(
      (f) => throw Exception(f.message),
      (list) => list,
    );
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }

  Future<Either<Failure, AccountEntity>> create({
    required String name,
    required AccountType type,
    required int initialBalanceCents,
    required Color color,
    required String iconName,
    String? bankName,
    bool includeInTotal = true,
  }) async {
    final auth = ref.read(authProvider).valueOrNull;
    final userId = auth?.userId ?? 'default';
    final repo = ref.read(accountRepositoryProvider);
    const currencyCode = 'BRL';

    final now = DateTime.now();
    final account = AccountEntity(
      id: const Uuid().v4(),
      userId: userId,
      name: name.trim(),
      type: type,
      initialBalanceCents: initialBalanceCents,
      currentBalanceCents: initialBalanceCents,
      color: color,
      iconName: iconName,
      currencyCode: currencyCode,
      includeInTotal: includeInTotal,
      isActive: true,
      sortOrder: 999,
      bankName: bankName,
      createdAt: now,
      updatedAt: now,
    );

    final result = await repo.create(account);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, AccountEntity>> save(AccountEntity account) async {
    final repo = ref.read(accountRepositoryProvider);
    final result = await repo.update(account);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, void>> delete(String id) async {
    final repo = ref.read(accountRepositoryProvider);
    final result = await repo.delete(id);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, void>> transfer({
    required String fromAccountId,
    required String toAccountId,
    required int amountCents,
    required String categoryId,
    DateTime? date,
    String? description,
  }) async {
    final auth = ref.read(authProvider).valueOrNull;
    final userId = auth?.userId ?? 'default';
    final repo = ref.read(accountRepositoryProvider);
    final result = await repo.transfer(
      fromAccountId: fromAccountId,
      toAccountId: toAccountId,
      amountCents: amountCents,
      categoryId: categoryId,
      userId: userId,
      date: date ?? DateTime.now(),
      description: description,
    );
    if (result.isRight) await refresh();
    return result;
  }
}
