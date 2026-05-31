import '../entities/credit_card_entity.dart';
import '../../core/utils/either.dart';
import '../../core/error/failures.dart';

abstract interface class ICreditCardRepository {
  Future<Either<Failure, List<CreditCardEntity>>> getAll(String userId);
  Future<Either<Failure, CreditCardEntity?>> getById(String id);
  Future<Either<Failure, CreditCardEntity>> create(CreditCardEntity card);
  Future<Either<Failure, CreditCardEntity>> update(CreditCardEntity card);
  Future<Either<Failure, void>> delete(String id);
}
