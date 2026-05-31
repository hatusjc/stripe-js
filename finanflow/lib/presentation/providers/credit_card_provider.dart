import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'package:flutter/material.dart';
import '../../domain/entities/credit_card_entity.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../data/repositories/credit_card_repository_impl.dart';
import '../../data/datasources/local/database_helper.dart';
import 'auth_provider.dart';

final creditCardRepositoryProvider =
    Provider((_) => CreditCardRepositoryImpl(DatabaseHelper.instance));

final creditCardsProvider =
    AsyncNotifierProvider<CreditCardsNotifier, List<CreditCardEntity>>(
  CreditCardsNotifier.new,
);

class CreditCardsNotifier extends AsyncNotifier<List<CreditCardEntity>> {
  @override
  Future<List<CreditCardEntity>> build() => _fetch();

  Future<List<CreditCardEntity>> _fetch() async {
    final userId =
        ref.watch(authProvider).valueOrNull?.userId ?? 'default';
    final repo = ref.watch(creditCardRepositoryProvider);
    final result = await repo.getAll(userId);
    return result.fold((f) => throw Exception(f.message), (l) => l);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }

  Future<Either<Failure, CreditCardEntity>> create({
    required String name,
    required int creditLimitCents,
    required int closingDay,
    required int dueDay,
    required Color color,
    String? lastFour,
    CardBrand? brand,
  }) async {
    final userId =
        ref.read(authProvider).valueOrNull?.userId ?? 'default';
    final repo = ref.read(creditCardRepositoryProvider);
    final now = DateTime.now();
    final card = CreditCardEntity(
      id: const Uuid().v4(),
      userId: userId,
      name: name.trim(),
      creditLimitCents: creditLimitCents,
      closingDay: closingDay,
      dueDay: dueDay,
      color: color,
      lastFour: lastFour,
      brand: brand,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    );
    final result = await repo.create(card);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, CreditCardEntity>> save(CreditCardEntity card) async {
    final repo = ref.read(creditCardRepositoryProvider);
    final result = await repo.update(card);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, void>> delete(String id) async {
    final repo = ref.read(creditCardRepositoryProvider);
    final result = await repo.delete(id);
    if (result.isRight) await refresh();
    return result;
  }
}
