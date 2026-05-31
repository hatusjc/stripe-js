import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'core/theme/app_theme.dart';
import 'presentation/navigation/app_router.dart';
import 'presentation/providers/settings_provider.dart';

class FinanFlowApp extends ConsumerWidget {
  const FinanFlowApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final settings = ref.watch(settingsProvider).valueOrNull;

    ThemeMode themeMode;
    ThemeData? lightTheme;
    ThemeData? darkTheme;

    switch (settings?.themeMode) {
      case AppThemeMode.light:
        themeMode = ThemeMode.light;
        lightTheme = AppTheme.lightTheme;
        darkTheme = AppTheme.darkTheme;
      case AppThemeMode.dark:
        themeMode = ThemeMode.dark;
        lightTheme = AppTheme.lightTheme;
        darkTheme = AppTheme.darkTheme;
      case AppThemeMode.amoled:
        themeMode = ThemeMode.dark;
        lightTheme = AppTheme.lightTheme;
        darkTheme = AppTheme.amoledTheme;
      case AppThemeMode.system:
      case null:
        themeMode = ThemeMode.system;
        lightTheme = AppTheme.lightTheme;
        darkTheme = AppTheme.darkTheme;
    }

    return MaterialApp.router(
      title: 'FinanFlow',
      debugShowCheckedModeBanner: false,
      themeMode: themeMode,
      theme: lightTheme,
      darkTheme: darkTheme,
      routerConfig: router,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('pt', 'BR'),
        Locale('en', 'US'),
        Locale('es', 'ES'),
      ],
      locale: Locale(settings?.language ?? 'pt'),
    );
  }
}
