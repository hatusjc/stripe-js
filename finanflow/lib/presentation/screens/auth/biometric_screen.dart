import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/route_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';

class BiometricScreen extends ConsumerStatefulWidget {
  const BiometricScreen({super.key});

  @override
  ConsumerState<BiometricScreen> createState() => _BiometricScreenState();
}

class _BiometricScreenState extends ConsumerState<BiometricScreen> {
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _authenticate());
  }

  Future<void> _authenticate() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final biometricService = ref.read(biometricServiceProvider);
    final success = await biometricService.authenticate(
      reason: 'Autentique-se para acessar o FinanFlow',
    );

    if (!mounted) return;

    if (success) {
      ref.read(authProvider.notifier).markAuthenticated();
      context.go(RouteConstants.dashboard);
    } else {
      setState(() {
        _isLoading = false;
        _error = 'Autenticação falhou. Use o PIN.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.fingerprint, size: 80, color: AppColors.seed),
                const SizedBox(height: 24),
                Text('Autenticação Biométrica',
                    style: Theme.of(context).textTheme.headlineSmall,
                    textAlign: TextAlign.center),
                const SizedBox(height: 8),
                Text(
                  'Use sua digital ou Face ID para acessar o FinanFlow',
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 40),
                if (_isLoading)
                  const CircularProgressIndicator()
                else ...[
                  if (_error != null)
                    Text(_error!,
                        style: TextStyle(color: Theme.of(context).colorScheme.error),
                        textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: _authenticate,
                    icon: const Icon(Icons.fingerprint),
                    label: const Text('Tentar novamente'),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: () => context.go(RouteConstants.pinAuth),
                    child: const Text('Usar PIN'),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
