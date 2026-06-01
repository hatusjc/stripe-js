import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:finanflow/core/services/encryption_service.dart';
import 'package:finanflow/core/error/exceptions.dart';

class MockSecureStorage extends Mock implements FlutterSecureStorage {}

void main() {
  late EncryptionService service;
  late MockSecureStorage mockStorage;

  setUp(() {
    mockStorage = MockSecureStorage();
    service = EncryptionService(mockStorage);
  });

  group('EncryptionService', () {
    test('initialize creates and stores a key when none exists', () async {
      when(() => mockStorage.read(key: any(named: 'key'))).thenAnswer((_) async => null);
      when(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value')))
          .thenAnswer((_) async {});

      await service.initialize();

      verify(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value'))).called(1);
    });

    test('encrypt then decrypt returns original text', () async {
      when(() => mockStorage.read(key: any(named: 'key'))).thenAnswer((_) async => null);
      when(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value')))
          .thenAnswer((_) async {});

      await service.initialize();

      const original = 'Hello, FinanFlow!';
      final encrypted = service.encryptText(original);
      final decrypted = service.decryptText(encrypted);

      expect(decrypted, original);
    });

    test('same plaintext produces different ciphertexts (IV randomness)', () async {
      when(() => mockStorage.read(key: any(named: 'key'))).thenAnswer((_) async => null);
      when(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value')))
          .thenAnswer((_) async {});

      await service.initialize();

      const text = 'sensitive data';
      final enc1 = service.encryptText(text);
      final enc2 = service.encryptText(text);

      expect(enc1, isNot(equals(enc2)));
    });

    test('throws EncryptionException on invalid ciphertext', () async {
      when(() => mockStorage.read(key: any(named: 'key'))).thenAnswer((_) async => null);
      when(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value')))
          .thenAnswer((_) async {});

      await service.initialize();

      expect(() => service.decryptText('invalid'), throwsA(isA<EncryptionException>()));
    });

    test('encryptNullable returns null for null input', () async {
      when(() => mockStorage.read(key: any(named: 'key'))).thenAnswer((_) async => null);
      when(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value')))
          .thenAnswer((_) async {});
      await service.initialize();
      expect(service.encryptNullable(null), isNull);
    });

    test('throws if not initialized', () {
      expect(() => service.encryptText('test'), throwsA(isA<EncryptionException>()));
    });
  });

  group('PIN hashing', () {
    test('hashPin produces consistent results with same salt', () async {
      const pin = '123456';
      const salt = 'abc123salt==';
      when(() => mockStorage.read(key: any(named: 'key')))
          .thenAnswer((_) async => salt);
      when(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value')))
          .thenAnswer((_) async {});

      final hash1 = await service.hashPin(pin);
      final hash2 = await service.hashPin(pin);
      expect(hash1, equals(hash2));
    });

    test('different PINs produce different hashes', () async {
      const salt = 'abc123salt==';
      when(() => mockStorage.read(key: any(named: 'key')))
          .thenAnswer((_) async => salt);
      when(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value')))
          .thenAnswer((_) async {});

      final hash1 = await service.hashPin('123456');
      final hash2 = await service.hashPin('654321');
      expect(hash1, isNot(equals(hash2)));
    });
  });
}
