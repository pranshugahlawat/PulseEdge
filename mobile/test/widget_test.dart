import 'package:flutter_test/flutter_test.dart';
import 'package:pulse_edge/main.dart';

void main() {
  testWidgets('PulseEdge UI smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const PulseEdgeMobileApp());
    expect(find.text('PulseEdge Mobile Scribe'), findsOneWidget);
  });
}