import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:howmuch/app.dart';
import 'package:howmuch/state/records.dart';
import 'package:howmuch/state/tool_sessions.dart';

import 'support.dart';
import 'ui_helpers.dart';

void main() {
  testWidgets('예산에서 가이드 금액 적용, 뒤로 가도 계획 유지, 실제 기록과 분리', (tester) async {
    final repo = MemoryRepository();
    final container = ProviderContainer(
      overrides: [repositoryProvider.overrideWithValue(repo)],
    );
    addTearDown(container.dispose);
    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('예정 비용'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.text('금액 가이드 보기'),
      250,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tapVisible(tester, find.text('금액 가이드 보기'));
    await tester.scrollUntilVisible(
      find.byKey(const Key('apply-guide')),
      250,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tapVisible(tester, find.byKey(const Key('apply-guide')));
    expect(
      container.read(budgetSessionProvider).rows.single.amount.text,
      '100000',
    );
    expect(repo.records, isEmpty);
    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    await tester.tap(find.text('예정 비용'));
    await tester.pumpAndSettle();
    expect(find.text('100,000원'), findsOneWidget);
  });
  testWidgets('장부 직접 입력과 중복 확인 후 저장, 저장 전에는 DB 미변경', (tester) async {
    final repo = MemoryRepository();
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(repo)],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('축의금 장부'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('guest-name-0')),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('guest-name-0')), '김하객');
    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('guest-amount-0')),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const ValueKey('guest-amount-0')),
      '50000',
    );
    await tester.pumpAndSettle();
    expect(repo.records, isEmpty);
    await tester.tap(find.byKey(const Key('save-guests')));
    await tester.pumpAndSettle();
    expect(repo.records.values.single.amount, 50000);
    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('guest-name-0')),
      -200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('guest-name-0')), '김하객');
    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('guest-amount-0')),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const ValueKey('guest-amount-0')),
      '50000',
    );
    await tester.pumpAndSettle();
    expect(
      tester
          .widget<FilledButton>(find.byKey(const Key('save-guests')))
          .onPressed,
      isNull,
    );
    await tester.scrollUntilVisible(
      find.byType(CheckboxListTile),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tapVisible(tester, find.byType(CheckboxListTile));
    await tester.tap(find.byKey(const Key('save-guests')));
    await tester.pumpAndSettle();
    expect(repo.records.length, 2);
  });
}
