import 'package:sqflite/sqflite.dart';
import '../../domain/entities/credit_card_entity.dart';
import '../../domain/repositories/i_credit_card_repository.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../core/extensions/datetime_extension.dart';
import '../datasources/local/database_helper.dart';
import '../models/credit_card_model.dart';

class CreditCardRepositoryImpl implements ICreditCardRepository {
  CreditCardRepositoryImpl(this._db);
  final DatabaseHelper _db;

  @override
  Future<Either<Failure, List<CreditCardEntity>>> getAll(String userId) async {
    try {
      final db = await _db.database;
      final rows = await db.query(
        'credit_cards',
        where: 'user_id = ? AND deleted_at IS NULL',
        whereArgs: [userId],
        orderBy: 'created_at DESC',
      );
      return Right(rows.map(CreditCardModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get credit cards: $e'));
    }
  }

  @override
  Future<Either<Failure, CreditCardEntity?>> getById(String id) async {
    try {
      final db = await _db.database;
      final rows = await db.query('credit_cards',
          where: 'id = ? AND deleted_at IS NULL', whereArgs: [id], limit: 1);
      if (rows.isEmpty) return const Right(null);
      return Right(CreditCardModel.fromMap(rows.first));
    } catch (e) {
      return Left(DatabaseFailure('Failed to get credit card: $e'));
    }
  }

  @override
  Future<Either<Failure, CreditCardEntity>> create(CreditCardEntity card) async {
    try {
      final db = await _db.database;
      await db.insert('credit_cards', CreditCardModel.fromEntity(card).toMap(),
          conflictAlgorithm: ConflictAlgorithm.fail);
      return Right(card);
    } catch (e) {
      return Left(DatabaseFailure('Failed to create credit card: $e'));
    }
  }

  @override
  Future<Either<Failure, CreditCardEntity>> update(CreditCardEntity card) async {
    try {
      final db = await _db.database;
      await db.update('credit_cards', CreditCardModel.fromEntity(card).toMap(),
          where: 'id = ?', whereArgs: [card.id]);
      return Right(card);
    } catch (e) {
      return Left(DatabaseFailure('Failed to update credit card: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      final db = await _db.database;
      await db.update(
        'credit_cards',
        {'deleted_at': DateTime.now().millisecondsSinceEpochUtc},
        where: 'id = ?',
        whereArgs: [id],
      );
      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure('Failed to delete credit card: $e'));
    }
  }

  Future<int> getUsedCents(String cardId) async {
    final db = await _db.database;
    final result = await db.rawQuery(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE credit_card_id = ? AND type = 'expense' AND deleted_at IS NULL AND date >= ?",
      [cardId, _currentCycleStart(cardId).millisecondsSinceEpochUtc],
    );
    return (result.first['total'] as int? ?? 0);
  }

  DateTime _currentCycleStart(String _) {
    final now = DateTime.now();
    return DateTime(now.year, now.month, 1);
  }
}
