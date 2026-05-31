# Flutter
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-dontwarn io.flutter.**

# SQLite / sqflite
-keep class com.tekartik.sqflite.** { *; }

# local_auth / biometrics
-keep class androidx.biometric.** { *; }

# flutter_local_notifications
-keep class com.dexterous.flutterlocalnotifications.** { *; }

# flutter_secure_storage
-keep class com.it_nomads.fluttersecurestorage.** { *; }

# encrypt / Bouncy Castle
-keep class org.bouncycastle.** { *; }
-dontwarn org.bouncycastle.**

# Google MLKit (v1.1)
-keep class com.google.mlkit.** { *; }
-dontwarn com.google.mlkit.**

# in_app_purchase / Play Billing
-keep class com.android.billingclient.** { *; }

# Prevent stripping of Kotlin metadata
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature
-keepattributes Exceptions

# Dart/Flutter reflection
-keep class **.R
-keep class **.R$* { *; }
