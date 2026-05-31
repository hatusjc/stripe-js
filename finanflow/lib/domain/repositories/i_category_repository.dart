import '../entities/category_entity.dart';
import '../../core/utils/either.dart';
import '../../core/error/failures.dart';

abstract interface class ICategoryRepository {
  Future<Either<Failure, List<CategoryEntity>>> getAll(String userId);
  Future<Either<Failure, List<CategoryEntity>>> getByType(String userId, CategoryType type);
  Future<Either<Failure, CategoryEntity>> create(CategoryEntity category);
  Future<Either<Failure, CategoryEntity>> update(CategoryEntity category);
  Future<Either<Failure, void>> delete(String id);
}
