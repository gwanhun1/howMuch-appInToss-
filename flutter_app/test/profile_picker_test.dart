import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:howmuch/ui/widgets/profile_picker.dart';

void main() {
  testWidgets('프로필 선택은 저장 시에만 적용, 취소 시 원래 값 유지', (tester) async {
    String current = '🙂';
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(
            body: TextButton(
              onPressed: () async {
                current = await pickProfile(context, current) ?? current;
              },
              child: const Text('열기'),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('열기'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('🐧'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('취소'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('취소'));
    await tester.pumpAndSettle();
    expect(current, '🙂');
    await tester.tap(find.text('열기'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('🐧'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('저장'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('저장'));
    await tester.pumpAndSettle();
    expect(current, '🐧');
  });
}
