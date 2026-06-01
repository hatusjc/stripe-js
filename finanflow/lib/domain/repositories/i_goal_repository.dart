import '../entities/goal_entity.dart';
import '../../core/utils/either.dart';
import '../../core/error/failures.dart';

abstract interface class IGoalRepository {
  Future<Either<Failure, List<GoalEntity>>> getAll(String userId);
  Future<Either<Failure, GoalEntity?>> getById(String id);
  Future<Either<Failure, GoalEntity>> create(GoalEntity goal);
  Future<Either<Failure, GoalEntity>> update(GoalEntity goal);
  Future<Either<Failure, void>> delete(String id);
  Future<Either<Failure, GoalEntity>> addContribution(String goalId, int amountCents);
}
