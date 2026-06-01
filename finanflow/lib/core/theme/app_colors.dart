import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Brand seed color
  static const Color seed = Color(0xFF1E6B4C);

  // Income / Expense
  static const Color income = Color(0xFF2ECC71);
  static const Color expense = Color(0xFFE74C3C);
  static const Color transfer = Color(0xFF3498DB);
  static const Color neutral = Color(0xFF95A5A6);

  // Health score
  static const Color scoreExcellent = Color(0xFF27AE60);
  static const Color scoreGood = Color(0xFF2ECC71);
  static const Color scoreWarning = Color(0xFFF39C12);
  static const Color scoreBad = Color(0xFFE74C3C);

  // Status
  static const Color confirmed = Color(0xFF27AE60);
  static const Color pending = Color(0xFFF39C12);
  static const Color overdue = Color(0xFFE74C3C);

  // Calendar
  static const Color calendarIncome = Color(0xFF27AE60);
  static const Color calendarExpense = Color(0xFFE74C3C);
  static const Color calendarBalance = Color(0xFF3498DB);

  // Charts palette (10 colors for categories)
  static const List<Color> chartPalette = [
    Color(0xFF1E6B4C),
    Color(0xFF3498DB),
    Color(0xFF9B59B6),
    Color(0xFFE67E22),
    Color(0xFFE74C3C),
    Color(0xFF1ABC9C),
    Color(0xFFF39C12),
    Color(0xFF2C3E50),
    Color(0xFF27AE60),
    Color(0xFF8E44AD),
  ];

  // AMOLED
  static const Color amoledBackground = Color(0xFF000000);
  static const Color amoledSurface = Color(0xFF0A0A0A);
  static const Color amoledCard = Color(0xFF111111);

  // Premium gradient
  static const LinearGradient premiumGradient = LinearGradient(
    colors: [Color(0xFF1E6B4C), Color(0xFF27AE60)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
