import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import '../extensions/datetime_extension.dart';
import '../../data/datasources/local/database_helper.dart';
import 'encryption_service.dart';

class BackupResult {
  const BackupResult({required this.path, required this.sizeBytes, required this.checksum});
  final String path;
  final int sizeBytes;
  final String checksum;
}

class BackupService {
  BackupService(this._db, this._encryption);
  final DatabaseHelper _db;
  final EncryptionService _encryption;

  static const _tables = [
    'users', 'settings', 'categories', 'accounts', 'credit_cards',
    'installments', 'transactions', 'budgets', 'goals', 'bills',
    'notifications', 'reports', 'backups',
  ];

  Future<BackupResult> createBackup(String userId) async {
    final db = await _db.database;
    final payload = <String, dynamic>{};

    for (final table in _tables) {
      try {
        final rows = await db.query(table,
            where: table == 'logs' ? null : 'user_id = ? OR user_id = ?',
            whereArgs: table == 'logs' ? null : [userId, 'system']);
        payload[table] = rows;
      } catch (_) {
        payload[table] = [];
      }
    }

    payload['_meta'] = {
      'version': 1,
      'created_at': DateTime.now().millisecondsSinceEpochUtc,
      'user_id': userId,
    };

    final jsonBytes = utf8.encode(jsonEncode(payload));
    final encrypted = _encryption.encryptBytes(Uint8List.fromList(jsonBytes));

    final dir = await getApplicationDocumentsDirectory();
    final ts = DateTime.now().millisecondsSinceEpoch;
    final file = File('${dir.path}/finanflow_backup_$ts.ffbk');
    await file.writeAsBytes(encrypted);

    final checksum = sha256.convert(encrypted).toString();
    return BackupResult(
      path: file.path,
      sizeBytes: encrypted.length,
      checksum: checksum,
    );
  }

  Future<void> restoreBackup(String filePath, String userId) async {
    final file = File(filePath);
    final encrypted = await file.readAsBytes();
    final decrypted = _encryption.decryptBytes(Uint8List.fromList(encrypted));
    final payload = jsonDecode(utf8.decode(decrypted)) as Map<String, dynamic>;

    final db = await _db.database;
    await db.transaction((txn) async {
      for (final table in _tables) {
        final rows = payload[table] as List<dynamic>? ?? [];
        for (final row in rows) {
          await txn.insert(
            table,
            Map<String, dynamic>.from(row as Map),
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
      }
    });
  }

  Future<List<Map<String, dynamic>>> listBackups(String userId) async {
    final db = await _db.database;
    return db.query('backups',
        where: 'user_id = ?',
        whereArgs: [userId],
        orderBy: 'created_at DESC',
        limit: 20);
  }

  Future<void> saveBackupRecord({
    required String userId,
    required BackupResult result,
    required bool isAuto,
  }) async {
    final db = await _db.database;
    await db.insert('backups', {
      'id': '${userId}_${DateTime.now().millisecondsSinceEpoch}',
      'user_id': userId,
      'file_path': result.path,
      'file_size': result.sizeBytes,
      'checksum': result.checksum,
      'is_auto': isAuto ? 1 : 0,
      'created_at': DateTime.now().millisecondsSinceEpochUtc,
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }
}
