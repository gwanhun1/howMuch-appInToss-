import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:howmuch/app.dart';
import 'package:howmuch/state/records.dart';

import 'support.dart';
import 'ui_helpers.dart';

void main() {
  testWidgets('CSV는 기존 입력 목록에 추가되고 확인 후 저장', (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
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
      find.text('CSV로 여러 명 불러오기'),
      250,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tapVisible(tester, find.text('CSV로 여러 명 불러오기'));
    await tester.scrollUntilVisible(
      find.byKey(const Key('csv-input')),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const Key('csv-input')),
      '이름,금액,관계\n김하객,100000,친구',
    );
    await tester.scrollUntilVisible(
      find.text('CSV 내용을 입력 목록에 추가하기'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tapVisible(tester, find.text('CSV 내용을 입력 목록에 추가하기'));
    expect(repo.records, isEmpty);
    await tester.tap(find.byKey(const Key('save-guests')));
    await tester.pumpAndSettle();
    expect(repo.records.values.single.name, '김하객');
    expect(repo.records.values.single.mode, 'received');
    expect(tester.takeException(), isNull);
  });
  testWidgets('금액 가이드에서 이름 관계 금액 전달, 저장 전에는 기록 없음', (tester) async {
    final repo = MemoryRepository();
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(repo)],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('금액 가이드'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.byKey(const Key('guide-name')),
      250,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('guide-name')), '가이드 친구');
    await tester.scrollUntilVisible(
      find.byKey(const Key('apply-guide')),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tapVisible(tester, find.byKey(const Key('apply-guide')));
    expect(
      tester
          .widget<TextFormField>(find.byKey(const Key('record-name')))
          .controller!
          .text,
      '가이드 친구',
    );
    expect(find.text('100,000원'), findsOneWidget);
    expect(repo.records, isEmpty);
    await tester.tap(find.byKey(const Key('save-record')));
    await tester.pumpAndSettle();
    expect(repo.records.values.single.relation, '친구');
    expect(repo.records.values.single.amount, 100000);
  });
}
