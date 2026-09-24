import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;
import 'package:http/http.dart' as http;
import '../models/encounter.dart';

class SyncService {
  // Allows testing on physical devices by setting your PC's LAN IP (e.g., 192.168.1.5)
  static String? customServerHost;

  static String get serverBaseUrl {
    // 1. If user set an override IP, use it:
    if (customServerHost != null && customServerHost!.trim().isNotEmpty) {
      return "http://${customServerHost!.trim()}:8000";
    }

    // 2. Web browser
    if (kIsWeb) {
      return "http://localhost:8000";
    }

    // 3. Android Emulator (uses 10.0.2.2 alias)
    if (Platform.isAndroid) {
      return "http://10.0.2.2:8000";
    }

    // 4. iOS Simulator (uses 127.0.0.1)
    if (Platform.isIOS) {
      return "http://127.0.0.1:8000";
    }

    // 5. Windows, macOS, Linux desktop
    return "http://localhost:8000";
  }

  static Future<Map<String, dynamic>> dispatchEncounter(PatientEncounterModel encounter) async {
    final endpoint = "$serverBaseUrl/api/encounters/submit";
    debugPrint("Attempting sync to: $endpoint");

    try {
      final response = await http.post(
        Uri.parse(endpoint),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: jsonEncode(encounter.toJson()),
      ).timeout(const Duration(seconds: 6));

      debugPrint("Server Response Code: ${response.statusCode}");
      debugPrint("Server Body: ${response.body}");

      if (response.statusCode == 200) {
        return {
          "success": true,
          "message": "Transmitted to Hospital Command Center!"
        };
      } else {
        return {
          "success": false,
          "message": "Server Error ${response.statusCode}: ${response.body}"
        };
      }
    } catch (e) {
      debugPrint("Sync Failed With Exception: $e");
      return {
        "success": false,
        "message": "Offline: Could not connect to $endpoint ($e)"
      };
    }
  }
}