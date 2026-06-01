import 'dart:math';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class SimulatorScreen extends StatefulWidget {
  const SimulatorScreen({super.key});

  @override
  State<SimulatorScreen> createState() => _SimulatorScreenState();
}

class _SimulatorScreenState extends State<SimulatorScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Simulador Financeiro'),
        bottom: TabBar(
          controller: _tabs,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Juros Compostos'),
            Tab(text: 'Meta de Poupança'),
            Tab(text: 'Financiamento'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: const [
          _CompoundInterestTab(),
          _SavingsGoalTab(),
          _LoanTab(),
        ],
      ),
    );
  }
}

// ── Compound Interest ──────────────────────────────────────────────────────

class _CompoundInterestTab extends StatefulWidget {
  const _CompoundInterestTab();

  @override
  State<_CompoundInterestTab> createState() => _CompoundInterestTabState();
}

class _CompoundInterestTabState extends State<_CompoundInterestTab> {
  final _principalCtrl = TextEditingController(text: '1000');
  final _monthlyCtrl = TextEditingController(text: '500');
  final _rateCtrl = TextEditingController(text: '0.8');
  int _months = 24;
  List<FlSpot> _spots = [];
  double _finalAmount = 0;
  double _totalInvested = 0;

  @override
  void initState() {
    super.initState();
    _calculate();
  }

  void _calculate() {
    final principal = double.tryParse(_principalCtrl.text.replaceAll(',', '.')) ?? 0;
    final monthly = double.tryParse(_monthlyCtrl.text.replaceAll(',', '.')) ?? 0;
    final rate = (double.tryParse(_rateCtrl.text.replaceAll(',', '.')) ?? 0) / 100;
    final spots = <FlSpot>[];
    double balance = principal;
    for (var i = 0; i <= _months; i++) {
      spots.add(FlSpot(i.toDouble(), balance / 1));
      if (i < _months) {
        balance = balance * (1 + rate) + monthly;
      }
    }
    setState(() {
      _spots = spots;
      _finalAmount = balance;
      _totalInvested = principal + monthly * _months;
    });
  }

  @override
  void dispose() {
    _principalCtrl.dispose();
    _monthlyCtrl.dispose();
    _rateCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final interest = _finalAmount - _totalInvested;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _InputCard(children: [
            _MoneyField(ctrl: _principalCtrl, label: 'Capital inicial (R\$)', onChanged: (_) => _calculate()),
            _MoneyField(ctrl: _monthlyCtrl, label: 'Aporte mensal (R\$)', onChanged: (_) => _calculate()),
            _MoneyField(ctrl: _rateCtrl, label: 'Taxa mensal (%)', onChanged: (_) => _calculate()),
            _SliderRow(label: 'Período', value: _months.toDouble(), min: 1, max: 120, divisions: 119,
                format: (v) => '${v.round()} meses', onChanged: (v) { _months = v.round(); _calculate(); }),
          ]),
          const SizedBox(height: 16),
          _ResultCard(children: [
            _ResultRow('Valor final', _fmt(_finalAmount), color: Colors.green),
            _ResultRow('Total investido', _fmt(_totalInvested)),
            _ResultRow('Juros ganhos', _fmt(interest), color: Colors.blue),
            _ResultRow('Rendimento', '${(_totalInvested > 0 ? (interest / _totalInvested * 100) : 0).toStringAsFixed(1)}%', color: Colors.blue),
          ]),
          const SizedBox(height: 16),
          if (_spots.length > 1) _LineChartCard(spots: _spots, label: 'Evolução do patrimônio'),
        ],
      ),
    );
  }
}

// ── Savings Goal ───────────────────────────────────────────────────────────

class _SavingsGoalTab extends StatefulWidget {
  const _SavingsGoalTab();

  @override
  State<_SavingsGoalTab> createState() => _SavingsGoalTabState();
}

class _SavingsGoalTabState extends State<_SavingsGoalTab> {
  final _goalCtrl = TextEditingController(text: '10000');
  final _savedCtrl = TextEditingController(text: '0');
  final _rateCtrl = TextEditingController(text: '0.8');
  final _monthlyCtrl = TextEditingController(text: '500');
  int _monthsNeeded = 0;
  double _requiredMonthly = 0;
  List<FlSpot> _spots = [];

  @override
  void initState() {
    super.initState();
    _calculate();
  }

  void _calculate() {
    final goal = double.tryParse(_goalCtrl.text.replaceAll(',', '.')) ?? 0;
    final saved = double.tryParse(_savedCtrl.text.replaceAll(',', '.')) ?? 0;
    final rate = (double.tryParse(_rateCtrl.text.replaceAll(',', '.')) ?? 0) / 100;
    final monthly = double.tryParse(_monthlyCtrl.text.replaceAll(',', '.')) ?? 0;

    // How many months to reach goal with given monthly
    final spots = <FlSpot>[];
    double balance = saved;
    int months = 0;
    spots.add(FlSpot(0, balance));
    while (balance < goal && months < 600) {
      balance = balance * (1 + rate) + monthly;
      months++;
      spots.add(FlSpot(months.toDouble(), balance));
      if (balance >= goal) break;
    }

    // Required monthly to reach in X months (user can also see required monthly in 12/24/36 months)
    final needed = goal - saved;
    double req = 0;
    if (rate > 0 && needed > 0) {
      req = needed * rate / (pow(1 + rate, 24) - 1);
    } else if (needed > 0) {
      req = needed / 24;
    }

    setState(() {
      _monthsNeeded = months >= 600 ? -1 : months;
      _requiredMonthly = req;
      _spots = spots.take(min(spots.length, 200)).toList();
    });
  }

  @override
  void dispose() {
    _goalCtrl.dispose();
    _savedCtrl.dispose();
    _rateCtrl.dispose();
    _monthlyCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _InputCard(children: [
            _MoneyField(ctrl: _goalCtrl, label: 'Valor da meta (R\$)', onChanged: (_) => _calculate()),
            _MoneyField(ctrl: _savedCtrl, label: 'Já tenho (R\$)', onChanged: (_) => _calculate()),
            _MoneyField(ctrl: _monthlyCtrl, label: 'Aporte mensal (R\$)', onChanged: (_) => _calculate()),
            _MoneyField(ctrl: _rateCtrl, label: 'Taxa mensal (%)', onChanged: (_) => _calculate()),
          ]),
          const SizedBox(height: 16),
          _ResultCard(children: [
            _ResultRow('Prazo necessário',
                _monthsNeeded < 0 ? 'Mais de 50 anos' : '$_monthsNeeded meses (${(_monthsNeeded / 12).toStringAsFixed(1)} anos)',
                color: Colors.green),
            _ResultRow('Aporte necessário em 24 meses', _fmt(_requiredMonthly), color: Colors.blue),
          ]),
          const SizedBox(height: 16),
          if (_spots.length > 1) _LineChartCard(spots: _spots, label: 'Evolução da poupança'),
        ],
      ),
    );
  }
}

// ── Loan ───────────────────────────────────────────────────────────────────

class _LoanTab extends StatefulWidget {
  const _LoanTab();

  @override
  State<_LoanTab> createState() => _LoanTabState();
}

class _LoanTabState extends State<_LoanTab> {
  final _amountCtrl = TextEditingController(text: '20000');
  final _rateCtrl = TextEditingController(text: '1.5');
  int _months = 36;
  double _monthlyPayment = 0;
  double _totalPaid = 0;
  double _totalInterest = 0;

  @override
  void initState() {
    super.initState();
    _calculate();
  }

  void _calculate() {
    final amount = double.tryParse(_amountCtrl.text.replaceAll(',', '.')) ?? 0;
    final rate = (double.tryParse(_rateCtrl.text.replaceAll(',', '.')) ?? 0) / 100;
    if (amount <= 0 || rate <= 0 || _months <= 0) {
      setState(() { _monthlyPayment = 0; _totalPaid = 0; _totalInterest = 0; });
      return;
    }
    // Price (French) amortization: PMT = PV * r / (1 - (1+r)^-n)
    final pmt = amount * rate / (1 - pow(1 + rate, -_months));
    setState(() {
      _monthlyPayment = pmt;
      _totalPaid = pmt * _months;
      _totalInterest = pmt * _months - amount;
    });
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    _rateCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _InputCard(children: [
            _MoneyField(ctrl: _amountCtrl, label: 'Valor do empréstimo (R\$)', onChanged: (_) => _calculate()),
            _MoneyField(ctrl: _rateCtrl, label: 'Taxa de juros mensal (%)', onChanged: (_) => _calculate()),
            _SliderRow(label: 'Prazo', value: _months.toDouble(), min: 1, max: 360, divisions: 359,
                format: (v) => '${v.round()} meses', onChanged: (v) { _months = v.round(); _calculate(); }),
          ]),
          const SizedBox(height: 16),
          _ResultCard(children: [
            _ResultRow('Parcela mensal', _fmt(_monthlyPayment), color: Colors.orange),
            _ResultRow('Total a pagar', _fmt(_totalPaid)),
            _ResultRow('Total de juros', _fmt(_totalInterest), color: Colors.red),
            _ResultRow('Custo efetivo', '${_totalPaid > 0 && _monthlyPayment > 0 ? ((_totalInterest / (double.tryParse(_amountCtrl.text.replaceAll(',', '.')) ?? 1)) * 100).toStringAsFixed(1) : 0}%', color: Colors.red),
          ]),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Text('Composição do custo', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 150,
                    child: PieChart(PieChartData(
                      sections: [
                        PieChartSectionData(
                          value: (double.tryParse(_amountCtrl.text.replaceAll(',', '.')) ?? 0),
                          color: Colors.blue,
                          title: 'Principal',
                          radius: 50,
                          titleStyle: const TextStyle(fontSize: 11, color: Colors.white),
                        ),
                        PieChartSectionData(
                          value: _totalInterest,
                          color: Colors.red,
                          title: 'Juros',
                          radius: 50,
                          titleStyle: const TextStyle(fontSize: 11, color: Colors.white),
                        ),
                      ],
                      centerSpaceRadius: 30,
                      sectionsSpace: 2,
                    )),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Shared widgets ─────────────────────────────────────────────────────────

class _InputCard extends StatelessWidget {
  const _InputCard({required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Parâmetros', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            ...children.expand((w) => [w, const SizedBox(height: 10)]).take(children.length * 2 - 1),
          ],
        ),
      ),
    );
  }
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.primaryContainer,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Resultado', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const Divider(),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _ResultRow extends StatelessWidget {
  const _ResultRow(this.label, this.value, {this.color});
  final String label;
  final String value;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13)),
          Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}

class _MoneyField extends StatelessWidget {
  const _MoneyField({required this.ctrl, required this.label, required this.onChanged});
  final TextEditingController ctrl;
  final String label;
  final void Function(String) onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: ctrl,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      decoration: InputDecoration(labelText: label, border: const OutlineInputBorder(), isDense: true),
      onChanged: onChanged,
    );
  }
}

class _SliderRow extends StatelessWidget {
  const _SliderRow({required this.label, required this.value, required this.min, required this.max, required this.divisions, required this.format, required this.onChanged});
  final String label;
  final double value;
  final double min;
  final double max;
  final int divisions;
  final String Function(double) format;
  final void Function(double) onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label, style: const TextStyle(fontSize: 13)),
          Text(format(value), style: const TextStyle(fontWeight: FontWeight.bold)),
        ]),
        Slider(value: value, min: min, max: max, divisions: divisions, onChanged: onChanged),
      ],
    );
  }
}

class _LineChartCard extends StatelessWidget {
  const _LineChartCard({required this.spots, required this.label});
  final List<FlSpot> spots;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            SizedBox(
              height: 180,
              child: LineChart(LineChartData(
                lineBarsData: [LineChartBarData(
                  spots: spots,
                  isCurved: true,
                  color: Theme.of(context).colorScheme.primary,
                  barWidth: 2,
                  dotData: const FlDotData(show: false),
                  belowBarData: BarAreaData(
                    show: true,
                    color: Theme.of(context).colorScheme.primary.withAlpha(40),
                  ),
                )],
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                titlesData: FlTitlesData(
                  bottomTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
              )),
            ),
            const SizedBox(height: 4),
            Text('Mês 0 → R\$ ${spots.first.y.toStringAsFixed(0)}   •   Mês ${spots.last.x.toInt()} → R\$ ${spots.last.y.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 11, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}

String _fmt(double v) => 'R\$ ${v.toStringAsFixed(2).replaceAll('.', ',')}';
