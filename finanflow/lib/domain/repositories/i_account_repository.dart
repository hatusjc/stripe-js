import '../entities/account_entity.dart';
import '../../core/utils/either.dart';
import '../../core/error/failures.dart';

abstract interface class IAccountRepository {
  Future<Either<Failure, List<AccountEntity>>> getAll(String userId);
  Future<Either<Failure, AccountEntity?>> getById(String id);
  Future<Either<Failure, AccountEntity>> create(AccountEntity account);
  Future<Either<Failure, AccountEntity>> update(AccountEntity account);
  Future<Either<Failure, void>> delete(String id);
  Future<Either<Failure, void>> transfer({
    required String fromAccountId,
    required String toAccountId,
    required int amountCents,
    required String categoryId,
    required String userId,
    required DateTime date,
    String? description,
  });
  Stream<List<AccountEntity>> watchAll(String userId);
}
