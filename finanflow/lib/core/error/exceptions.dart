class DatabaseException implements Exception {
  const DatabaseException([this.message = 'Database error', this.cause]);
  final String message;
  final Object? cause;
  @override
  String toString() => 'DatabaseException: $message${cause != null ? ' ($cause)' : ''}';
}

class ValidationException implements Exception {
  const ValidationException(this.message);
  final String message;
  @override
  String toString() => 'ValidationException: $message';
}

class AuthException implements Exception {
  const AuthException([this.message = 'Authentication failed']);
  final String message;
  @override
  String toString() => 'AuthException: $message';
}

class EncryptionException implements Exception {
  const EncryptionException([this.message = 'Encryption error', this.cause]);
  final String message;
  final Object? cause;
  @override
  String toString() => 'EncryptionException: $message${cause != null ? ' ($cause)' : ''}';
}

class BackupException implements Exception {
  const BackupException([this.message = 'Backup error']);
  final String message;
  @override
  String toString() => 'BackupException: $message';
}
