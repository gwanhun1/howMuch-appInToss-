import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';

Future<void> tapVisible(WidgetTester tester, Finder finder) async {
  await tester.ensureVisible(finder);
  await tester.pumpAndSettle();
  await tester.tap(finder);
  await tester.pumpAndSettle();
}

Future<void> enterAmount(WidgetTester tester, String amount) async {
  await tapVisible(tester, find.byKey(const Key('open-amount')));
  await tester.enterText(find.byKey(const Key('record-amount')), amount);
  await tapVisible(tester, find.byKey(const Key('confirm-amount')));
}
