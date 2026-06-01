import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../presentation/providers/auth_provider.dart';

class SecurityScreen extends ConsumerStatefulWidget {
  const SecurityScreen({super.key});

  @override
  ConsumerState<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends ConsumerState<SecurityScreen> {
  bool _biometricAvailable = false;
  bool _biometricEnabled = false;
  bool _loadingBio = false;

  @override
  void initState() {
    super.initState();
    _loadBiometricState();
  }

  Future<void> _loadBiometricState() async {
    final bio = ref.read(biometricServiceProvider);
    final available = await bio.isAvailable();
    final enabled = await bio.isEnabled();
    if (mounted) {
      setState(() {
        _biometricAvailable = available;
        _biometricEnabled = enabled;
      });
    }
  }

  Future<void> _toggleBiometric(bool value) async {
    final bio = ref.read(biometricServiceProvider);
    if (value) {
      setState(() => _loadingBio = true);
      final ok = await bio.authenticate(reason: 'Confirme sua identidade para ativar o biométrico');
      if (!mounted) return;
      setState(() => _loadingBio = false);
      if (!ok) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Autenticação biométrica falhou')));
        return;
      }
    }
    await bio.setEnabled(value);
    if (mounted) setState(() => _biometricEnabled = value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Segurança')),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          _SectionTitle('PIN de acesso'),
          ListTile(
            leading: const Icon(Icons.lock_outline),
            title: const Text('Alterar PIN'),
            subtitle: const Text('Mude seu PIN de 4 dígitos'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showChangePinFlow(context),
          ),
          const Divider(height: 1),
          _SectionTitle('Biometria'),
          if (!_biometricAvailable)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                'Biometria não disponível neste dispositivo.',
                style: TextStyle(color: Colors.grey),
              ),
            )
          else
            SwitchListTile(
              secondary: _loadingBio
                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.fingerprint),
              title: const Text('Entrar com biometria'),
              subtitle: const Text('Use impressão digital ou Face ID'),
              value: _biometricEnabled,
              onChanged: _loadingBio ? null : _toggleBiometric,
            ),
          const Divider(height: 1),
          _SectionTitle('Dicas de segurança'),
          ..._tips.map((t) => ListTile(
            leading: const Icon(Icons.tips_and_updates_outlined, color: Colors.amber),
            title: Text(t, style: const TextStyle(fontSize: 13)),
          )),
        ],
      ),
    );
  }

  void _showChangePinFlow(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _ChangePinSheet(ref: ref),
    );
  }

  static const _tips = [
    'Use um PIN que não seja sua data de nascimento.',
    'Não compartilhe seu PIN com ninguém.',
    'Ative a biometria para acesso mais seguro.',
    'O app bloqueia automaticamente após 5 min em segundo plano.',
  ];
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: Theme.of(context).colorScheme.primary,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

enum _PinStep { current, newPin, confirm }

class _ChangePinSheet extends ConsumerStatefulWidget {
  const _ChangePinSheet({required this.ref});
  final WidgetRef ref;

  @override
  ConsumerState<_ChangePinSheet> createState() => _ChangePinSheetState();
}

class _ChangePinSheetState extends ConsumerState<_ChangePinSheet> {
  _PinStep _step = _PinStep.current;
  String _input = '';
  String _newPin = '';
  String? _errorMsg;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _checkHasPin();
  }

  Future<void> _checkHasPin() async {
    final enc = ref.read(encryptionServiceProvider);
    final hasPin = await enc.hasPin();
    if (mounted && !hasPin) setState(() => _step = _PinStep.newPin);
  }

  void _onDigit(String d) {
    if (_input.length >= 4) return;
    setState(() { _input += d; _errorMsg = null; });
    if (_input.length == 4) _onComplete();
  }

  void _onDelete() {
    if (_input.isEmpty) return;
    setState(() => _input = _input.substring(0, _input.length - 1));
  }

  Future<void> _onComplete() async {
    final enc = ref.read(encryptionServiceProvider);
    if (_step == _PinStep.current) {
      setState(() => _loading = true);
      final ok = await enc.verifyPin(_input);
      if (!mounted) return;
      setState(() => _loading = false);
      if (!ok) {
        setState(() { _input = ''; _errorMsg = 'PIN incorreto. Tente novamente.'; });
        return;
      }
      setState(() { _step = _PinStep.newPin; _input = ''; });
    } else if (_step == _PinStep.newPin) {
      setState(() { _newPin = _input; _step = _PinStep.confirm; _input = ''; });
    } else {
      if (_input != _newPin) {
        setState(() { _input = ''; _errorMsg = 'PINs não coincidem. Tente novamente.'; _step = _PinStep.newPin; _newPin = ''; });
        return;
      }
      setState(() => _loading = true);
      await enc.storePin(_input);
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PIN alterado com sucesso!')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final title = switch (_step) {
      _PinStep.current => 'Digite o PIN atual',
      _PinStep.newPin  => 'Digite o novo PIN',
      _PinStep.confirm => 'Confirme o novo PIN',
    };

    return Padding(
      padding: EdgeInsets.fromLTRB(24, 32, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(4, (i) {
              final filled = i < _input.length;
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 10),
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: filled ? cs.primary : cs.outline.withOpacity(0.3),
                ),
              );
            }),
          ),
          if (_errorMsg != null) ...[
            const SizedBox(height: 12),
            Text(_errorMsg!, style: const TextStyle(color: Colors.red, fontSize: 13)),
          ],
          if (_loading) ...[
            const SizedBox(height: 16),
            const CircularProgressIndicator(),
          ] else ...[
            const SizedBox(height: 32),
            _Numpad(onDigit: _onDigit, onDelete: _onDelete),
          ],
          const SizedBox(height: 16),
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
        ],
      ),
    );
  }
}

class _Numpad extends StatelessWidget {
  const _Numpad({required this.onDigit, required this.onDelete});
  final void Function(String) onDigit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final digits = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
    ];
    return Column(
      children: [
        ...digits.map((row) => Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: row.map((d) => _NumBtn(label: d, onTap: () => onDigit(d))).toList(),
        )),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(width: 80),
            _NumBtn(label: '0', onTap: () => onDigit('0')),
            SizedBox(
              width: 80,
              height: 64,
              child: IconButton(
                icon: const Icon(Icons.backspace_outlined),
                onPressed: onDelete,
                iconSize: 22,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _NumBtn extends StatelessWidget {
  const _NumBtn({required this.label, required this.onTap});
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 80,
      height: 64,
      child: TextButton(
        onPressed: onTap,
        child: Text(label, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w500)),
      ),
    );
  }
}
