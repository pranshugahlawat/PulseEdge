import 'package:flutter/material.dart';

class PriorityChip extends StatelessWidget {
  final String priority;
  final int score;

  const PriorityChip({
    super.key,
    required this.priority,
    required this.score,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg = Colors.white;

    switch (priority) {
      case "RED":
        bg = Colors.redAccent;
        break;
      case "YELLOW":
        bg = Colors.amberAccent;
        fg = Colors.black;
        break;
      default:
        bg = Colors.tealAccent.shade700;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            "$priority PRIORITY",
            style: TextStyle(color: fg, fontWeight: FontWeight.bold, fontSize: 11),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
            decoration: BoxDecoration(
              color: const Color(0x4D000000), // Safe alpha replacement for black with 0.3 opacity
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              "$score/100",
              style: TextStyle(color: fg, fontWeight: FontWeight.bold, fontSize: 10),
            ),
          )
        ],
      ),
    );
  }
}