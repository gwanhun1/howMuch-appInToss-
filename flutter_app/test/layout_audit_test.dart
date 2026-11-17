import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:howmuch/app.dart';
import 'package:howmuch/domain/record.dart';
import 'package:howmuch/state/records.dart';
import 'package:howmuch/ui/amount_input_page.dart';
import 'package:howmuch/ui/tools_page.dart';
import 'package:howmuch/ui/wedding_page.dart';

import 'support.dart';

void main() {
  for (final entry in <String, Widget>{
    '메인': const SizedBox(),
    '금액': const AmountInputPage(
      value: '100000000',
      mode: 'received',
      type: '축의금',
      records: [],
    ),
    '가이드': const GuidePage(),
    '계산기': const BudgetPage(),
    '장부': const WeddingPage(),
  }.entries) {
    testWidgets('${entry.key} 320px / 큰 글자 / 키보드 레이아웃', (tester) async {
      tester.view.physicalSize = const Size(320, 640);
      tester.view.devicePixelRatio = 1;
      tester.platformDispatcher.textScaleFactorTestValue = 1.5;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
      final repo = MemoryRepository();
      await repo.saveAll([
        MoneyRecord(
          id: 'paid',
          name: '이름이 긴 친구의 결혼식',
          amount: 100000000,
          date: today(),
        ),
        MoneyRecord(
          id: 'received',
          name: '받은 마음 친구',
          amount: 100000000,
          date: today(),
          mode: 'received',
        ),
      ]);
      await tester.pumpWidget(
        ProviderScope(
          overrides: [repositoryProvider.overrideWithValue(repo)],
          child: HowMuchApp(home: entry.key == '메인' ? null : entry.value),
        ),
      );
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      await tester.drag(find.byType(ListView).first, const Offset(0, -350));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      for (var scroll = 0; scroll < 4; scroll++) {
        await tester.drag(find.byType(ListView).first, const Offset(0, -300));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
      }
      if (entry.key == '금액' || entry.key == '장부') {
        tester.view.viewInsets = const FakeViewPadding(bottom: 260);
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        tester.view.resetViewInsets();
      }
    });
  }
  testWidgets('긴 이름과 1억 원 기록의 카드·목록 레이아웃', (tester) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    tester.platformDispatcher.textScaleFactorTestValue = 1.8;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
    final repo = MemoryRepository();
    await repo.saveAll([
      const MoneyRecord(
        id: 'long',
        name: '이름이 아주 긴 친구입니다',
        relation: '직장 동료',
        amount: 100000000,
        date: '2026-11-17',
      ),
    ]);
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(repo)],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    await tester.tap(find.byKey(const Key('total-amount')));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.byTooltip('목록으로 보기'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('목록으로 보기'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });
  testWidgets('뽑기 선택 결과, 중복 선택 차단, 다시 뽑기', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(MemoryRepository())],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('금액 뽑기'));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('picker-card-0')));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('picker-result')), findsOneWidget);
    final value = tester
        .widget<Text>(find.byKey(const Key('picker-result')))
        .data;
    await tester.tap(find.byKey(const ValueKey('picker-card-1')));
    await tester.pumpAndSettle();
    expect(
      tester.widget<Text>(find.byKey(const Key('picker-result'))).data,
      value,
    );
    await tester.tap(find.byKey(const Key('reshuffle')));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('picker-result')), findsNothing);
  });
}
