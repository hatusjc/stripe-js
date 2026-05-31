import '../../../core/services/encryption_service.dart';
import '../../../core/error/failures.dart';
import '../../../core/utils/either.dart';
import '../../../core/constants/app_constants.dart';

class SetupPinUseCase {
  const SetupPinUseCase(this._encryptionService);
  final EncryptionService _encryptionService;

  Future<Either<Failure, void>> call(String pin) async {
    if (pin.length != AppConstants.pinLength) {
      return Left(ValidationFailure('PIN must be ${AppConstants.pinLength} digits'));
    }
    if (!RegExp(r'^\d+$').hasMatch(pin)) {
      return Left(const ValidationFailure('PIN must contain only digits'));
    }
    try {
      await _encryptionService.storePin(pin);
      return const Right(null);
    } catch (e) {
      return Left(AuthFailure('Failed to set PIN: $e'));
    }
  }
}
