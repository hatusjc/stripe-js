import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../../core/constants/route_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/datasources/local/database_helper.dart';
import '../../../data/repositories/user_repository_impl.dart';
import '../../../domain/entities/user_entity.dart';
import '../../../domain/entities/settings_entity.dart';
import '../../../domain/usecases/auth/setup_pin_usecase.dart';
import '../../providers/auth_provider.dart';
import '../../providers/settings_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  // User data collected during onboarding
  String _name = '';
  String _currency = 'BRL';
  String _pin = '';
  bool _useBiometrics = false;

  static const _totalPages = 5;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _next() {
    if (_currentPage < _totalPages - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _complete();
    }
  }

  Future<void> _complete() async {
    const uuid = Uuid();
    final userId = uuid.v4();
    final now = DateTime.now();

    final user = UserEntity(
      id: userId,
      name: _name.isEmpty ? 'Usuário' : _name,
      currencyCode: _currency,
      locale: 'pt',
      createdAt: now,
      updatedAt: now,
    );

    final userRepo = UserRepositoryImpl(DatabaseHelper.instance);
    await userRepo.createUser(user);

    final settingsRepo = SettingsRepositoryImpl(DatabaseHelper.instance);
    final settings = SettingsEntity.defaultSettings(userId).copyWith(
      onboardingComplete: true,
      currencyCode: _currency,
      biometricEnabled: _useBiometrics,
    );
    await settingsRepo.createSettings(settings);

    if (_pin.isNotEmpty) {
      final setupPin = SetupPinUseCase(ref.read(encryptionServiceProvider));
      await setupPin.call(_pin);
    }

    if (_useBiometrics) {
      await ref.read(biometricServiceProvider).setEnabled(true);
    }

    ref.read(authProvider.notifier).markOnboardingComplete();
    ref.read(authProvider.notifier).markAuthenticated();
    ref.invalidate(settingsProvider);

    if (mounted) context.go(RouteConstants.dashboard);
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Progress indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: List.generate(_totalPages, (i) {
                  return Expanded(
                    child: Container(
                      height: 4,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: i <= _currentPage ? AppColors.seed : cs.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
            ),

            // Pages
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                onPageChanged: (p) => setState(() => _currentPage = p),
                children: [
                  _WelcomePage(onNext: _next),
                  _FeaturesPage(onNext: _next),
                  _ProfilePage(
                    onNext: _next,
                    onNameChanged: (v) => _name = v,
                    onCurrencyChanged: (v) => _currency = v,
                  ),
                  _SecurityPage(
                    onNext: _next,
                    onPinChanged: (v) => _pin = v,
                    onBiometricChanged: (v) => _useBiometrics = v,
                  ),
                  _ReadyPage(onComplete: _complete),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WelcomePage extends StatelessWidget {
  const _WelcomePage({required this.onNext});
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.account_balance_wallet, size: 80, color: AppColors.seed),
          const SizedBox(height: 32),
          Text('Bem-vindo ao FinanFlow',
              style: Theme.of(context).textTheme.headlineMedium,
              textAlign: TextAlign.center),
          const SizedBox(height: 16),
          Text(
            'O aplicativo de finanças pessoais mais completo e seguro. Funciona 100% offline.',
            style: Theme.of(context).textTheme.bodyLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 48),
          FilledButton(
            onPressed: onNext,
            child: const Text('Começar'),
          ),
        ],
      ),
    );
  }
}

class _FeaturesPage extends StatelessWidget {
  const _FeaturesPage({required this.onNext});
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final features = [
      (Icons.lock_outline, 'Segurança Total', '100% offline, criptografia AES-256'),
      (Icons.bar_chart, 'Relatórios Completos', 'PDF, Excel e CSV exportáveis'),
      (Icons.lightbulb_outline, 'Inteligência Financeira', 'Insights e score de saúde financeira'),
      (Icons.credit_card, 'Cartões e Contas', 'Controle completo de carteiras e bancos'),
    ];

    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 32),
          Text('Recursos Principais',
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 24),
          ...features.map((f) => Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.seed.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(f.$1, color: AppColors.seed),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(f.$2, style: Theme.of(context).textTheme.titleSmall),
                          Text(f.$3, style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
          const Spacer(),
          FilledButton(
            onPressed: onNext,
            child: const Text('Próximo'),
          ),
        ],
      ),
    );
  }
}

class _ProfilePage extends StatefulWidget {
  const _ProfilePage({
    required this.onNext,
    required this.onNameChanged,
    required this.onCurrencyChanged,
  });
  final VoidCallback onNext;
  final ValueChanged<String> onNameChanged;
  final ValueChanged<String> onCurrencyChanged;

  @override
  State<_ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<_ProfilePage> {
  final _nameCtrl = TextEditingController();
  String _currency = 'BRL';

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 32),
          Text('Seu Perfil', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text('Configure suas preferências básicas.',
              style: Theme.of(context).textTheme.bodyLarge),
          const SizedBox(height: 32),
          TextField(
            controller: _nameCtrl,
            decoration: const InputDecoration(labelText: 'Seu nome', prefixIcon: Icon(Icons.person_outline)),
            textCapitalization: TextCapitalization.words,
            onChanged: widget.onNameChanged,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _currency,
            decoration: const InputDecoration(labelText: 'Moeda principal', prefixIcon: Icon(Icons.attach_money)),
            items: const [
              DropdownMenuItem(value: 'BRL', child: Text('Real Brasileiro (BRL)')),
              DropdownMenuItem(value: 'USD', child: Text('Dólar Americano (USD)')),
              DropdownMenuItem(value: 'EUR', child: Text('Euro (EUR)')),
            ],
            onChanged: (v) {
              if (v != null) {
                setState(() => _currency = v);
                widget.onCurrencyChanged(v);
              }
            },
          ),
          const Spacer(),
          FilledButton(
            onPressed: widget.onNext,
            child: const Text('Próximo'),
          ),
        ],
      ),
    );
  }
}

class _SecurityPage extends StatefulWidget {
  const _SecurityPage({
    required this.onNext,
    required this.onPinChanged,
    required this.onBiometricChanged,
  });
  final VoidCallback onNext;
  final ValueChanged<String> onPinChanged;
  final ValueChanged<bool> onBiometricChanged;

  @override
  State<_SecurityPage> createState() => _SecurityPageState();
}

class _SecurityPageState extends State<_SecurityPage> {
  final _pinCtrl = TextEditingController();
  bool _useBiometric = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 32),
          Text('Segurança', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text('Proteja seus dados financeiros.',
              style: Theme.of(context).textTheme.bodyLarge),
          const SizedBox(height: 32),
          TextField(
            controller: _pinCtrl,
            decoration: const InputDecoration(
              labelText: 'Criar PIN de 6 dígitos',
              prefixIcon: Icon(Icons.lock_outline),
            ),
            keyboardType: TextInputType.number,
            obscureText: true,
            maxLength: 6,
            onChanged: widget.onPinChanged,
          ),
          const SizedBox(height: 8),
          SwitchListTile(
            value: _useBiometric,
            onChanged: (v) {
              setState(() => _useBiometric = v);
              widget.onBiometricChanged(v);
            },
            title: const Text('Usar biometria'),
            subtitle: const Text('Digital ou Face ID'),
            secondary: const Icon(Icons.fingerprint),
          ),
          const Spacer(),
          FilledButton(
            onPressed: widget.onNext,
            child: const Text('Próximo'),
          ),
          const SizedBox(height: 8),
          Center(
            child: TextButton(
              onPressed: widget.onNext,
              child: const Text('Pular por agora'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReadyPage extends StatelessWidget {
  const _ReadyPage({required this.onComplete});
  final VoidCallback onComplete;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.check_circle, size: 80, color: AppColors.income),
          const SizedBox(height: 32),
          Text('Tudo pronto!',
              style: Theme.of(context).textTheme.headlineMedium,
              textAlign: TextAlign.center),
          const SizedBox(height: 16),
          Text(
            'Seu FinanFlow está configurado. Comece a controlar suas finanças agora.',
            style: Theme.of(context).textTheme.bodyLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 48),
          FilledButton(
            onPressed: onComplete,
            child: const Text('Começar a usar'),
          ),
        ],
      ),
    );
  }
}
