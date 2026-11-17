import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:integration_test/integration_test.dart';
import 'package:howmuch/app.dart';
import 'package:howmuch/data/record_repository.dart';
import 'package:howmuch/state/records.dart';

import '../test/ui_helpers.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  Future<void> capture(String name) async {
    if (const bool.fromEnvironment('CAPTURE_SCREENSHOTS')) {
      await binding.takeScreenshot(name);
    }
  }

  testWidgets('iOS SQLite 저장·재연결·수정·삭제와 화면 흐름', (tester) async {
    final repo = await SqliteRecordRepository.open(
      name: 'howmuch-integration.db',
    );
    await repo.clear();
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(repo)],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await capture('home-empty');
    await tester.tap(find.byKey(const Key('add-record')));
    await tester.pumpAndSettle();
    await capture('record-editor');
    await tester.tap(find.byKey(const Key('profile-picker')));
    await tester.pumpAndSettle();
    await capture('profile-picker');
    await tapVisible(tester, find.text('취소'));
    await tester.enterText(find.byKey(const Key('record-name')), '통합 테스트');
    await tester.tap(find.text('축의금').last);
    await tester.pumpAndSettle();
    await tapVisible(tester, find.byKey(const Key('open-amount')));
    await tester.enterText(find.byKey(const Key('record-amount')), '100000');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pumpAndSettle();
    await capture('amount-input');
    await tapVisible(tester, find.byKey(const Key('confirm-amount')));

    await tester.tap(find.byKey(const Key('save-record')));
    await tester.pumpAndSettle();
    expect(find.text('통합 테스트'), findsOneWidget);
    await capture('home-record');
    for (final tool in {
      '금액 가이드': 'guide',
      '예정 비용': 'budget',
      '축의금 장부': 'wedding',
    }.entries) {
      await tester.tap(find.text(tool.key));
      await tester.pumpAndSettle();
      await capture(tool.value);
      if (tool.value == 'budget') {
        await tester.scrollUntilVisible(
          find.byKey(const ValueKey('plan-amount-0')),
          180,
          scrollable: find.byType(Scrollable).first,
        );
        await tester.pumpAndSettle();
        await capture('budget-input');
      }
      if (tool.value == 'guide') {
        await tester.scrollUntilVisible(
          find.byKey(const Key('guide-name')),
          220,
          scrollable: find.byType(Scrollable).first,
        );
        await tester.pumpAndSettle();
        await capture('guide-result');
      }
      if (tool.value == 'wedding') {
        await tester.scrollUntilVisible(
          find.byKey(const ValueKey('guest-name-0')),
          200,
          scrollable: find.byType(Scrollable).first,
        );
        await tester.pumpAndSettle();
        await tester.enterText(
          find.byKey(const ValueKey('guest-name-0')),
          '김하객',
        );
        await tester.scrollUntilVisible(
          find.byKey(const ValueKey('guest-amount-0')),
          150,
          scrollable: find.byType(Scrollable).first,
        );
        await tester.pumpAndSettle();
        await tester.enterText(
          find.byKey(const ValueKey('guest-amount-0')),
          '100000',
        );
        await tester.pumpAndSettle();
        await capture('wedding-input');
      }
      await tester.binding.handlePopRoute();
      await tester.pumpAndSettle();
    }
    await tester.tap(find.byTooltip('금액 뽑기'));
    await tester.pumpAndSettle();
    await capture('random-picker');
    await tester.tap(find.byKey(const ValueKey('picker-card-0')));
    await tester.pumpAndSettle();
    await capture('random-result');
    await tester.tap(find.text('닫기'));
    await tester.pumpAndSettle();
    final saved = (await repo.readAll()).single;
    await tester.pumpWidget(const SizedBox());
    await tester.pumpAndSettle();
    await repo.db.close();
    final reopened = await SqliteRecordRepository.open(
      name: 'howmuch-integration.db',
    );
    expect((await reopened.readAll()).single.amount, 100000);
    await reopened.saveAll([saved.copyWith(isFavorite: true)]);
    expect((await reopened.readAll()).single.isFavorite, isTrue);
    await reopened.delete(saved.id);
    expect(await reopened.readAll(), isEmpty);
    await reopened.db.close();
  });
}
