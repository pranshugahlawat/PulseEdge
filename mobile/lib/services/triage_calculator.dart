class TriageResult {
  final String priority;
  final int score;

  TriageResult({required this.priority, required this.score});
}

class TriageCalculator {
  static TriageResult calculate({
    int? heartRate,
    int? systolicBp,
    int? spo2,
    required List<String> symptoms,
    required String transcript,
  }) {
    final text = transcript.toLowerCase();
    int score = 10;

    // 1. SpO2 evaluation
    if (spo2 != null) {
      if (spo2 < 90) {
        score += 40;
      } else if (spo2 < 94) {
        score += 20;
      }
    }

    // 2. Blood Pressure
    if (systolicBp != null) {
      if (systolicBp < 90) {
        score += 35;
      } else if (systolicBp > 180) {
        score += 25;
      }
    }

    // 3. Heart Rate
    if (heartRate != null) {
      if (heartRate > 130 || heartRate < 40) {
        score += 30;
      } else if (heartRate > 105) {
        score += 15;
      }
    }

    // 4. Critical Selected Symptoms
    for (final s in symptoms) {
      final item = s.toLowerCase();
      if (item.contains("chest pain") ||
          item.contains("unconscious") ||
          item.contains("breathlessness") ||
          item.contains("severe bleeding")) {
        score += 35;
        break;
      }
    }

    // 5. Urgent Selected Symptoms
    for (final s in symptoms) {
      final item = s.toLowerCase();
      if (item.contains("high fever") ||
          item.contains("vomiting") ||
          item.contains("deep wound") ||
          item.contains("severe pain")) {
        score += 15;
        break;
      }
    }

    // 6. Keywords in dialogue text
    if (text.contains("cannot breathe") || text.contains("choking") || text.contains("convulsing")) {
      score += 25;
    }

    final finalScore = score.clamp(5, 100);

    String badge = "GREEN";
    if (finalScore >= 75) {
      badge = "RED";
    } else if (finalScore >= 40) {
      badge = "YELLOW";
    }

    return TriageResult(priority: badge, score: finalScore);
  }
}