import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'intake_screen.dart';

class MobileLoginScreen extends StatefulWidget {
  const MobileLoginScreen({super.key});

  @override
  State<MobileLoginScreen> createState() => _MobileLoginScreenState();
}

class _MobileLoginScreenState extends State<MobileLoginScreen> {
  final _phoneController = TextEditingController(text: "9876543210");
  final _nameController = TextEditingController(text: "Sunita Devi (ASHA Worker)");
  final _otpController = TextEditingController();

  bool _isOtpSent = false;
  bool _isLoading = false;
  String _hintText = "";

  void _requestOtp() async {
    if (_phoneController.text.trim().length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Enter a valid 10-digit mobile number")),
      );
      return;
    }

    setState(() => _isLoading = true);
    final res = await MobileAuthService.requestOtp(_phoneController.text.trim());
    if (!mounted) return;

    setState(() {
      _isLoading = false;
      _isOtpSent = true;
      _hintText = "Demo Bypass Code: ${res['dev_hint_otp'] ?? '123456'}";
    });
  }

  void _verifyOtp() async {
    setState(() => _isLoading = true);
    final res = await MobileAuthService.verifyOtp(
      _phoneController.text.trim(),
      _otpController.text.trim(),
      _nameController.text.trim(),
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res["success"] == true) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => IntakeScreen(
            workerName: _nameController.text.trim(),
            workerPhone: _phoneController.text.trim(),
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res["message"] ?? "Invalid OTP code")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 420),
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.medical_services_outlined, size: 48, color: Color(0xFF38BDF8)),
                const SizedBox(height: 12),
                const Text(
                  "PulseEdge Field Scribe",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const Text(
                  "Community Health Worker Authentication",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Color(0x0094A3B8), fontSize: 12),
                ),
                const SizedBox(height: 24),

                if (!_isOtpSent) ...[
                  TextField(
                    controller: _nameController,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: "Your Full Name (CHW / Nurse)",
                      labelStyle: const TextStyle(color: Color(0xFF38BDF8), fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: "Registered Mobile Number",
                      labelStyle: const TextStyle(color: Color(0xFF38BDF8), fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                  const SizedBox(height: 18),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _requestOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF06B6D4),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: Text(
                      _isLoading ? "Requesting OTP..." : "Request Login OTP →",
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0x4DFFD740)), // Safe alpha replacement
                    ),
                    child: Text(
                      _hintText,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.amberAccent, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white, fontSize: 22, letterSpacing: 6, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      labelText: "Enter 6-Digit Code",
                      labelStyle: const TextStyle(color: Color(0xFF38BDF8), fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _verifyOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF06B6D4),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: Text(
                      _isLoading ? "Verifying..." : "Verify & Open Scribe ✓",
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                  TextButton(
                    onPressed: () => setState(() => _isOtpSent = false),
                    child: const Text("Edit Mobile Number", style: TextStyle(color: Color(0x0094A3B8), fontSize: 12)),
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