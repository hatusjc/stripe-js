import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/services/backup_service.dart';
import '../../providers/auth_provider.dart';
import '../../providers/core_providers.dart';

class BackupScreen extends ConsumerStatefulWidget {
  const BackupScreen({super.key});

  @override
  ConsumerState<BackupScreen> createState() => _BackupScreenState();
}

class _BackupScreenState extends ConsumerState<BackupScreen> {
  bool _creating = false;
  bool _restoring = false;
  String? _statusMsg;
  Color _statusColor = Colors.green;
  List<Map<String, dynamic>> _backups = [];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  BackupService get _svc => BackupService(
        ref.read(databaseProvider).valueOrNull!,
        ref.read(encryptionServiceProvider),
      );

  String get _userId => ref.read(authProvider).valueOrNull?.userId ?? 'default';

  Future<void> _loadHistory() async {
    try {
      if (ref.read(databaseProvider).valueOrNull == null) return;
      final list = await _svc.listBackups(_userId);
      if (mounted) setState(() => _backups = list);
    } catch (_) {}
  }

  Future<void> _createBackup() async {
    setState(() { _creating = true; _statusMsg = null; });
    try {
      final result = await _svc.createBackup(_userId);
      await _svc.saveBackupRecord(userId: _userId, result: result, isAuto: false);
      await _loadHistory();
      if (!mounted) return;
      setState(() {
        _creating = false;
        _statusMsg = 'Backup criado: ${result.path.split('/').last}';
        _statusColor = Colors.green;
      });
      await Share.shareXFiles([XFile(result.path)], text: 'Backup FinanFlow');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _creating = false;
        _statusMsg = 'Erro ao criar backup: $e';
        _statusColor = Colors.red;
      });
    }
  }

  Future<void> _restoreBackup() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Restaurar backup'),
        content: const Text('Isso substituirá todos os seus dados atuais. Deseja continuar?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.orange),
            child: const Text('Restaurar'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    final result = await FilePicker.platform.pickFiles(
      type: FileType.any,
      dialogTitle: 'Selecionar arquivo .ffbk',
    );
    if (result == null || result.files.isEmpty) return;
    final path = result.files.first.path;
    if (path == null) return;

    setState(() { _restoring = true; _statusMsg = null; });
    try {
      await _svc.restoreBackup(path, _userId);
      if (!mounted) return;
      setState(() {
        _restoring = false;
        _statusMsg = 'Backup restaurado com sucesso!';
        _statusColor = Colors.green;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _restoring = false;
        _statusMsg = 'Erro ao restaurar: $e';
        _statusColor = Colors.red;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final dbReady = ref.watch(databaseProvider).valueOrNull != null;
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Backup e Restauração')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Backup local', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 4),
                  const Text('Exporta todos os seus dados em arquivo .ffbk criptografado (AES-256).', style: TextStyle(color: Colors.grey, fontSize: 13)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: (!dbReady || _creating) ? null : _createBackup,
                          icon: _creating
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Icon(Icons.backup),
                          label: const Text('Criar Backup'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: (!dbReady || _restoring) ? null : _restoreBackup,
                          icon: _restoring
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Icon(Icons.restore),
                          label: const Text('Restaurar'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          if (_statusMsg != null) ...[
            const SizedBox(height: 12),
            Card(
              color: _statusColor.withAlpha(30),
              child: ListTile(
                leading: Icon(
                  _statusColor == Colors.green ? Icons.check_circle : Icons.error_outline,
                  color: _statusColor,
                ),
                title: Text(_statusMsg!, style: TextStyle(color: _statusColor, fontSize: 13)),
              ),
            ),
          ],
          const SizedBox(height: 16),
          const Text('O que é incluído no backup?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          ..._items.map((item) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: Row(children: [
              const Icon(Icons.check, size: 16, color: Colors.green),
              const SizedBox(width: 6),
              Text(item, style: const TextStyle(fontSize: 13)),
            ]),
          )),
          const SizedBox(height: 16),
          const Text('Segurança', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          ..._securityInfo.map((s) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Icon(Icons.shield_outlined, size: 16, color: Colors.blue),
              const SizedBox(width: 6),
              Expanded(child: Text(s, style: const TextStyle(fontSize: 13))),
            ]),
          )),
          if (_backups.isNotEmpty) ...[
            const SizedBox(height: 24),
            const Text('Histórico de backups', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            ..._backups.map((b) {
              final path = b['file_path'] as String;
              final ts = b['created_at'] as int;
              final size = b['file_size'] as int;
              final date = DateTime.fromMillisecondsSinceEpoch(ts ~/ 1000);
              final fileExists = File(path).existsSync();
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: Icon(
                    fileExists ? Icons.folder : Icons.folder_off,
                    color: fileExists ? cs.primary : Colors.grey,
                  ),
                  title: Text(path.split('/').last, style: const TextStyle(fontSize: 13)),
                  subtitle: Text('${DateFormat('dd/MM/yyyy HH:mm').format(date)} • ${(size / 1024).toStringAsFixed(1)} KB'),
                  trailing: fileExists
                      ? IconButton(
                          icon: const Icon(Icons.share, size: 18),
                          onPressed: () => Share.shareXFiles([XFile(path)]),
                        )
                      : null,
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  static const _items = [
    'Transações e parcelamentos',
    'Contas bancárias e cartões',
    'Categorias personalizadas',
    'Orçamentos e metas',
    'Contas a pagar/receber',
    'Configurações e preferências',
  ];

  static const _securityInfo = [
    'Criptografia AES-256-GCM — padrão bancário',
    'Chave derivada do seu dispositivo — nenhum servidor externo',
    'Extensão .ffbk — apenas o FinanFlow consegue abrir',
    'Salve em nuvem (Google Drive, iCloud) para não perder',
  ];
}
