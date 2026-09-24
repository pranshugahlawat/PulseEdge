import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class MobileAuthService {
  static String get _baseUrl {
    if (kIsWeb || defaultTargetPlatform == TargetPlatform.windows) {
      return "http://localhost:8000/api/auth";
    }
    return "http://10.0.2.2:8000/api/auth";
  }

  static Future<Map<String, dynamic>> requestOtp(String phone) async {
    try {
      final res = await http.post(
        Uri.parse("$_baseUrl/request-otp"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"phone": phone}),
      ).timeout(const Duration(seconds: 4));

      return jsonDecode(res.body);
    } catch (e) {
      // Local fallback for offline field mode
      return {
        "success": true,
        "dev_hint_otp": "123456",
        "message": "Offline Mode: Use master OTP 123456"
      };
    }
  }

  static Future<Map<String, dynamic>> verifyOtp(String phone, String otp, String name) async {
    try {
      final res = await http.post(
        Uri.parse("$_baseUrl/verify-otp"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "phone": phone,
          "otp": otp,
          "role": "FIELD_WORKER",
          "name": name,
        }),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        return {"success": true, "data": jsonDecode(res.body)};
      }
      return {"success": false, "message": "Invalid OTP"};
    } catch (e) {
      // Offline fallback authentication
      if (otp == "123456") {
        return {
          "success": true,
          "data": {"name": name, "phone": phone, "role": "FIELD_WORKER"}
        };
      }
      return {"success": false, "message": "Offline validation requires OTP 123456"};
    }
  }
}