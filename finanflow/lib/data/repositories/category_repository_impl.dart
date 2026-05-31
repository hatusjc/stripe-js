import 'package:sqflite/sqflite.dart';
import '../../domain/entities/category_entity.dart';
import '../../domain/repositories/i_category_repository.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../core/extensions/datetime_extension.dart';
import '../datasources/local/database_helper.dart';
import '../models/category_model.dart';

class CategoryRepositoryImpl implements ICategoryRepository {
  CategoryRepositoryImpl(this._dbHelper);
  final DatabaseHelper _dbHelper;

  @override
  Future<Either<Failure, List<CategoryEntity>>> getAll(String userId) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query(
        'categories',
        where: "(user_id = ? OR user_id = 'system') AND deleted_at IS NULL AND is_active = 1",
        whereArgs: [userId],
        orderBy: 'sort_order ASC, name ASC',
      );
      return Right(rows.map(CategoryModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get categories: $e'));
    }
  }

  @override
  Future<Either<Failure, List<CategoryEntity>>> getByType(
      String userId, CategoryType type) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query(
        'categories',
        where:
            "(user_id = ? OR user_id = 'system') AND (type = ? OR type = 'both') AND deleted_at IS NULL AND is_active = 1",
        whereArgs: [userId, type.name],
        orderBy: 'sort_order ASC, name ASC',
      );
      return Right(rows.map(CategoryModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get categories by type: $e'));
    }
  }

  @override
  Future<Either<Failure, CategoryEntity>> create(CategoryEntity category) async {
    try {
      final db = await _dbHelper.database;
      await db.insert(
        'categories',
        CategoryModel.fromEntity(category).toMap(),
        conflictAlgorithm: ConflictAlgorithm.fail,
      );
      return Right(category);
    } catch (e) {
      return Left(DatabaseFailure('Failed to create category: $e'));
    }
  }

  @override
  Future<Either<Failure, CategoryEntity>> update(CategoryEntity category) async {
    try {
      final db = await _dbHelper.database;
      await db.update(
        'categories',
        CategoryModel.fromEntity(category).toMap(),
        where: 'id = ?',
        whereArgs: [category.id],
      );
      return Right(category);
    } catch (e) {
      return Left(DatabaseFailure('Failed to update category: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      final db = await _dbHelper.database;
      await db.update(
        'categories',
        {'deleted_at': DateTime.now().millisecondsSinceEpochUtc},
        where: 'id = ? AND is_system = 0',
        whereArgs: [id],
      );
      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure('Failed to delete category: $e'));
    }
  }
}
