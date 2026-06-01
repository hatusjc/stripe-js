import 'package:intl/intl.dart';

extension DoubleExtension on double {
  String toCurrency({
    String symbol = 'R\$',
    String decimalSep = ',',
    String thousandsSep = '.',
  }) {
    final formatter = NumberFormat.currency(
      symbol: '$symbol ',
      decimalDigits: 2,
      customPattern: '#,##0.00',
    );
    return formatter.format(this).replaceAll(',', '|').replaceAll('.', thousandsSep).replaceAll('|', decimalSep);
  }

  String toCompact({String symbol = 'R\$'}) {
    if (abs() >= 1000000) {
      return '$symbol ${(this / 1000000).toStringAsFixed(1)}M';
    }
    if (abs() >= 1000) {
      return '$symbol ${(this / 1000).toStringAsFixed(1)}K';
    }
    return toCurrency(symbol: symbol);
  }
}

extension IntCentsExtension on int {
  double get toReais => this / 100.0;
  String toCurrencyFromCents({String symbol = 'R\$'}) => toReais.toCurrency(symbol: symbol);
}
