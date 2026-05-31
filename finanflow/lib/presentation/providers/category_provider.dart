import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../domain/entities/category_entity.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../data/repositories/category_repository_impl.dart';
import '../../data/datasources/local/database_helper.dart';
import 'auth_provider.dart';

final categoryRepositoryProvider = Provider((ref) {
  return CategoryRepositoryImpl(DatabaseHelper.instance);
});

final categoriesProvider =
    AsyncNotifierProvider<CategoriesNotifier, List<CategoryEntity>>(
  CategoriesNotifier.new,
);

final categoriesByTypeProvider =
    FutureProvider.family<List<CategoryEntity>, CategoryType>((ref, type) async {
  final auth = ref.watch(authProvider).valueOrNull;
  final userId = auth?.userId ?? 'default';
  final repo = ref.watch(categoryRepositoryProvider);
  final result = await repo.getByType(userId, type);
  return result.fold((_) => [], (list) => list);
});

class CategoriesNotifier extends AsyncNotifier<List<CategoryEntity>> {
  @override
  Future<List<CategoryEntity>> build() => _fetch();

  Future<List<CategoryEntity>> _fetch() async {
    final auth = ref.watch(authProvider).valueOrNull;
    final userId = auth?.userId ?? 'default';
    final repo = ref.watch(categoryRepositoryProvider);
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

  Future<Either<Failure, CategoryEntity>> create({
    required String name,
    required CategoryType type,
    required String iconName,
    required Color color,
  }) async {
    final auth = ref.read(authProvider).valueOrNull;
    final userId = auth?.userId ?? 'default';
    final repo = ref.read(categoryRepositoryProvider);

    final now = DateTime.now();
    final category = CategoryEntity(
      id: const Uuid().v4(),
      userId: userId,
      name: name.trim(),
      type: type,
      iconName: iconName,
      color: color,
      isSystem: false,
      isActive: true,
      sortOrder: 999,
      createdAt: now,
    );

    final result = await repo.create(category);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, CategoryEntity>> save(CategoryEntity category) async {
    final repo = ref.read(categoryRepositoryProvider);
    final result = await repo.update(category);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, void>> delete(String id) async {
    final repo = ref.read(categoryRepositoryProvider);
    final result = await repo.delete(id);
    if (result.isRight) await refresh();
    return result;
  }
}
