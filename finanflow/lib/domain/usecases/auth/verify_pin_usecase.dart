import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/services/encryption_service.dart';
import '../../../core/error/failures.dart';
import '../../../core/utils/either.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/db_constants.dart';

class VerifyPinUseCase {
  const VerifyPinUseCase(this._encryptionService, this._secureStorage);
  final EncryptionService _encryptionService;
  final FlutterSecureStorage _secureStorage;

  Future<Either<Failure, bool>> call(String pin) async {
    try {
      final lockoutStr = await _secureStorage.read(key: DbConstants.keyLockoutUntil);
      if (lockoutStr != null) {
        final lockoutUntil = DateTime.fromMillisecondsSinceEpoch(int.parse(lockoutStr));
        if (DateTime.now().isBefore(lockoutUntil)) {
          final remaining = lockoutUntil.difference(DateTime.now()).inSeconds;
          return Left(AuthFailure('Too many attempts. Try again in $remaining seconds.'));
        }
      }

      final isValid = await _encryptionService.verifyPin(pin);
      if (isValid) {
        await _secureStorage.delete(key: DbConstants.keyPinAttempts);
        await _secureStorage.delete(key: DbConstants.keyLockoutUntil);
        return const Right(true);
      }

      final attemptsStr = await _secureStorage.read(key: DbConstants.keyPinAttempts);
      final attempts = int.tryParse(attemptsStr ?? '0') ?? 0;
      final newAttempts = attempts + 1;
      await _secureStorage.write(key: DbConstants.keyPinAttempts, value: newAttempts.toString());

      if (newAttempts >= AppConstants.maxPinAttempts) {
        // Exponential lockout: 30s * 2^(attempts - maxAttempts)
        final extraAttempts = newAttempts - AppConstants.maxPinAttempts;
        final lockoutSeconds = AppConstants.lockoutBase.inSeconds * (1 << extraAttempts.clamp(0, 5));
        final lockoutUntil = DateTime.now().add(Duration(seconds: lockoutSeconds));
        await _secureStorage.write(
          key: DbConstants.keyLockoutUntil,
          value: lockoutUntil.millisecondsSinceEpoch.toString(),
        );
        return Left(AuthFailure('Too many attempts. Locked for $lockoutSeconds seconds.'));
      }

      return const Right(false);
    } catch (e) {
      return Left(AuthFailure('PIN verification error: $e'));
    }
  }
}
