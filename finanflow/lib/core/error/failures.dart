sealed class Failure {
  const Failure(this.message);
  final String message;
}

final class DatabaseFailure extends Failure {
  const DatabaseFailure([String message = 'Database error']) : super(message);
}

final class ValidationFailure extends Failure {
  const ValidationFailure(String message) : super(message);
}

final class AuthFailure extends Failure {
  const AuthFailure([String message = 'Authentication failed']) : super(message);
}

final class EncryptionFailure extends Failure {
  const EncryptionFailure([String message = 'Encryption error']) : super(message);
}

final class BackupFailure extends Failure {
  const BackupFailure([String message = 'Backup error']) : super(message);
}

final class ExportFailure extends Failure {
  const ExportFailure([String message = 'Export error']) : super(message);
}

final class NetworkFailure extends Failure {
  const NetworkFailure([String message = 'Network error']) : super(message);
}

final class NotFoundFailure extends Failure {
  const NotFoundFailure([String message = 'Not found']) : super(message);
}

final class PermissionFailure extends Failure {
  const PermissionFailure([String message = 'Permission denied']) : super(message);
}
