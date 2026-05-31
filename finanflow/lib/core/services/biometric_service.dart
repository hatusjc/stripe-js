import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/db_constants.dart';

class BiometricService {
  BiometricService(this._localAuth, this._secureStorage);
  final LocalAuthentication _localAuth;
  final FlutterSecureStorage _secureStorage;

  Future<bool> isAvailable() async {
    try {
      return await _localAuth.canCheckBiometrics && await _localAuth.isDeviceSupported();
    } catch (_) {
      return false;
    }
  }

  Future<List<BiometricType>> availableTypes() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (_) {
      return [];
    }
  }

  Future<bool> authenticate({required String reason}) async {
    try {
      return await _localAuth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
        ),
      );
    } catch (_) {
      return false;
    }
  }

  Future<bool> isEnabled() async =>
      await _secureStorage.read(key: DbConstants.keyBiometricEnabled) == 'true';

  Future<void> setEnabled(bool enabled) async =>
      _secureStorage.write(key: DbConstants.keyBiometricEnabled, value: enabled.toString());
}
