import '../entities/budget_entity.dart';
import '../../core/utils/either.dart';
import '../../core/error/failures.dart';

abstract interface class IBudgetRepository {
  Future<Either<Failure, List<BudgetEntity>>> getActive(String userId);
  Future<Either<Failure, BudgetEntity?>> getById(String id);
  Future<Either<Failure, BudgetEntity>> create(BudgetEntity budget);
  Future<Either<Failure, BudgetEntity>> update(BudgetEntity budget);
  Future<Either<Failure, void>> delete(String id);
}
