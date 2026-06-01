// Flutter web plugin registrant file.
//
// Generated file. Do not edit.
//

// @dart = 2.13
// ignore_for_file: type=lint

import 'package:app_links_web/app_links_web.dart';
import 'package:camera_web/camera_web.dart';
import 'package:file_picker/_internal/file_picker_web.dart';
import 'package:flutter_native_splash/flutter_native_splash_web.dart';
import 'package:flutter_secure_storage_web/flutter_secure_storage_web.dart';
import 'package:google_sign_in_web/google_sign_in_web.dart';
import 'package:mobile_scanner/src/web/mobile_scanner_web.dart';
import 'package:permission_handler_html/permission_handler_html.dart';
import 'package:printing/printing_web.dart';
import 'package:sensors_plus/src/sensors_plus_web.dart';
import 'package:share_plus/src/share_plus_web.dart';
import 'package:url_launcher_web/url_launcher_web.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';

void registerPlugins([final Registrar? pluginRegistrar]) {
  final Registrar registrar = pluginRegistrar ?? webPluginRegistrar;
  AppLinksPluginWeb.registerWith(registrar);
  CameraPlugin.registerWith(registrar);
  FilePickerWeb.registerWith(registrar);
  FlutterNativeSplashWeb.registerWith(registrar);
  FlutterSecureStorageWeb.registerWith(registrar);
  GoogleSignInPlugin.registerWith(registrar);
  MobileScannerWeb.registerWith(registrar);
  WebPermissionHandler.registerWith(registrar);
  PrintingPlugin.registerWith(registrar);
  WebSensorsPlugin.registerWith(registrar);
  SharePlusWebPlugin.registerWith(registrar);
  UrlLauncherPlugin.registerWith(registrar);
  registrar.registerMessageHandler();
}
