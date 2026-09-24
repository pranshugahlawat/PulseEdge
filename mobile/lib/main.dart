import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const PulseEdgeMobileApp());
}

class PulseEdgeMobileApp extends StatelessWidget {
  const PulseEdgeMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PulseEdge Edge Scribe',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        colorScheme: const ColorScheme.dark(primary: Color(0xFF06B6D4)),
      ),
      home: const MobileLoginScreen(),
    );
  }
}