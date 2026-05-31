import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';
import 'package:encrypt/encrypt.dart' as enc;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/db_constants.dart';
import '../error/exceptions.dart';

class EncryptionService {
  EncryptionService(this._secureStorage);
  final FlutterSecureStorage _secureStorage;

  enc.Encrypter? _encrypter;

  Future<void> initialize() async {
    String? keyBase64 = await _secureStorage.read(key: DbConstants.keyEncryptionKey);
    if (keyBase64 == null) {
      final key = enc.Key.fromSecureRandom(32);
      keyBase64 = base64Encode(key.bytes);
      await _secureStorage.write(key: DbConstants.keyEncryptionKey, value: keyBase64);
    }
    final key = enc.Key(Uint8List.fromList(base64Decode(keyBase64)));
    _encrypter = enc.Encrypter(enc.AES(key, mode: enc.AESMode.gcm));
  }

  String encryptText(String plaintext) {
    _assertInitialized();
    try {
      final iv = enc.IV.fromSecureRandom(12);
      final encrypted = _encrypter!.encrypt(plaintext, iv: iv);
      return '${base64Encode(iv.bytes)}:${encrypted.base64}';
    } catch (e) {
      throw EncryptionException('Failed to encrypt', e);
    }
  }

  String decryptText(String ciphertext) {
    _assertInitialized();
    try {
      final parts = ciphertext.split(':');
      if (parts.length != 2) throw const EncryptionException('Invalid ciphertext format');
      final iv = enc.IV(Uint8List.fromList(base64Decode(parts[0])));
      return _encrypter!.decrypt64(parts[1], iv: iv);
    } catch (e) {
      if (e is EncryptionException) rethrow;
      throw EncryptionException('Failed to decrypt', e);
    }
  }

  String? encryptNullable(String? value) => value != null ? encryptText(value) : null;
  String? decryptNullable(String? value) => value != null ? decryptText(value) : null;

  Uint8List encryptBytes(Uint8List data) {
    _assertInitialized();
    try {
      final iv = enc.IV.fromSecureRandom(12);
      final encrypted = _encrypter!.encryptBytes(data.toList(), iv: iv);
      final ivBytes = iv.bytes;
      final result = Uint8List(ivBytes.length + encrypted.bytes.length);
      result.setAll(0, ivBytes);
      result.setAll(ivBytes.length, encrypted.bytes);
      return result;
    } catch (e) {
      throw EncryptionException('Failed to encrypt bytes', e);
    }
  }

  Uint8List decryptBytes(Uint8List data) {
    _assertInitialized();
    try {
      final ivBytes = data.sublist(0, 12);
      final cipherBytes = data.sublist(12);
      final iv = enc.IV(Uint8List.fromList(ivBytes));
      final encrypted = enc.Encrypted(Uint8List.fromList(cipherBytes));
      return Uint8List.fromList(_encrypter!.decryptBytes(encrypted, iv: iv));
    } catch (e) {
      throw EncryptionException('Failed to decrypt bytes', e);
    }
  }

  // PIN helpers — SHA-256 with salt
  Future<String> hashPin(String pin) async {
    String? salt = await _secureStorage.read(key: DbConstants.keyPinSalt);
    if (salt == null) {
      salt = _generateSalt();
      await _secureStorage.write(key: DbConstants.keyPinSalt, value: salt);
    }
    return _sha256Hash('$pin$salt');
  }

  Future<bool> verifyPin(String pin) async {
    final stored = await _secureStorage.read(key: DbConstants.keyPinHash);
    if (stored == null) return false;
    final salt = await _secureStorage.read(key: DbConstants.keyPinSalt);
    if (salt == null) return false;
    return _constantTimeEquals(stored, _sha256Hash('$pin$salt'));
  }

  Future<void> storePin(String pin) async {
    final hash = await hashPin(pin);
    await _secureStorage.write(key: DbConstants.keyPinHash, value: hash);
  }

  Future<bool> hasPin() async =>
      await _secureStorage.read(key: DbConstants.keyPinHash) != null;

  String _sha256Hash(String input) {
    final bytes = utf8.encode(input);
    return sha256.convert(bytes).toString();
  }

  String _generateSalt() {
    final rng = Random.secure();
    return base64Encode(List.generate(16, (_) => rng.nextInt(256)));
  }

  bool _constantTimeEquals(String a, String b) {
    if (a.length != b.length) return false;
    var result = 0;
    for (var i = 0; i < a.length; i++) {
      result |= a.codeUnitAt(i) ^ b.codeUnitAt(i);
    }
    return result == 0;
  }

  void _assertInitialized() {
    if (_encrypter == null) {
      throw const EncryptionException('EncryptionService not initialized. Call initialize() first.');
    }
  }
}
