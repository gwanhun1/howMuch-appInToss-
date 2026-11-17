import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:howmuch/app.dart';
import 'package:howmuch/domain/record.dart';
import 'package:howmuch/state/records.dart';

import 'support.dart';

import 'ui_helpers.dart';

void main() {
  testWidgets('빈 상태에서 기록 생성, 조회와 수정, 검색', (tester) async {
    final repo = MemoryRepository();
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(repo)],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('첫 번째 마음을 기록해보세요'), findsOneWidget);
    await tester.tap(find.byKey(const Key('add-record')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('record-name')), '김민수');
    await tester.tap(find.text('축의금').last);
    await tester.pumpAndSettle();
    await enterAmount(tester, '100000');

    await tester.tap(find.byKey(const Key('save-record')));
    await tester.pumpAndSettle();
    expect(repo.records.values.single.amount, 100000);
    expect(find.text('김민수'), findsOneWidget);
    await tester.ensureVisible(find.text('김민수'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('김민수'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('축의금').last);
    await tester.pumpAndSettle();
    await enterAmount(tester, '50000');

    await tester.tap(find.byKey(const Key('save-record')));
    await tester.pumpAndSettle();
    expect(repo.records.length, 1);
    expect(repo.records.values.single.amount, 50000);
    await tester.ensureVisible(find.byKey(const Key('search')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('search')), '없는이름');
    await tester.pumpAndSettle();
    expect(find.text('일치하는 이름이 없어요. 다른 이름으로 검색해보세요.'), findsOneWidget);
  });
  testWidgets('저장 실패 시 입력 유지, 재시도 가능', (tester) async {
    final repo = MemoryRepository()..failWrites = true;
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(repo)],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('add-record')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('record-name')), '실패 테스트');
    await tester.tap(find.text('축의금').last);
    await tester.pumpAndSettle();
    await enterAmount(tester, '10000');

    await tester.tap(find.byKey(const Key('save-record')));
    await tester.pumpAndSettle();
    expect(find.text('저장하지 못했어요. 입력을 유지했으니 다시 시도해주세요.'), findsOneWidget);
    expect(repo.records, isEmpty);
    repo.failWrites = false;

    await tester.tap(find.byKey(const Key('save-record')));
    await tester.pumpAndSettle();
    expect(repo.records.values.single.name, '실패 테스트');
  });
  testWidgets('기존 기록 중요 표시는 즉시 저장, 실패 시 복원, 삭제 확인 후 제거', (tester) async {
    final repo = MemoryRepository();
    await repo.saveAll([
      const MoneyRecord(
        id: 'existing',
        name: '중요한 친구',
        amount: 100000,
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
    await tapVisible(tester, find.text('중요한 친구'));
    repo.failWrites = true;
    await tester.tap(find.byKey(const Key('editor-favorite')));
    await tester.pumpAndSettle();
    expect(repo.records['existing']!.isFavorite, isFalse);
    expect(find.text('중요 표시 변경에 실패했어요.'), findsOneWidget);
    repo.failWrites = false;
    await tester.tap(find.byKey(const Key('editor-favorite')));
    await tester.pumpAndSettle();
    expect(repo.records['existing']!.isFavorite, isTrue);
    await tester.tap(find.text('삭제'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('취소'));
    await tester.pumpAndSettle();
    expect(repo.records.length, 1);
    await tester.tap(find.text('삭제'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('삭제').last);
    await tester.pumpAndSettle();
    expect(repo.records, isEmpty);
  });
  testWidgets('저장 후 조회만 실패해 재시도해도 동일 초안은 한 기록만 저장', (tester) async {
    final repo = MemoryRepository();
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(repo)],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('add-record')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('record-name')), '재시도 친구');
    await tester.tap(find.text('축의금').last);
    await tester.pumpAndSettle();
    await enterAmount(tester, '100000');
    repo.failNextReadAfterWrite = true;
    await tester.tap(find.byKey(const Key('save-record')));
    await tester.pumpAndSettle();
    expect(repo.records.length, 1);
    await tester.tap(find.byKey(const Key('save-record')));
    await tester.pumpAndSettle();
    expect(repo.records.length, 1);
    expect(find.text('재시도 친구'), findsOneWidget);
  });
}
