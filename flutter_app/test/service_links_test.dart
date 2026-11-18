import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:howmuch/app.dart';
import 'package:howmuch/data/service_links.dart';
import 'package:howmuch/state/records.dart';

import 'support.dart';
import 'ui_helpers.dart';

void main() {
  testWidgets('설정에서 개인정보·고객지원 공개 주소를 외부 브라우저로 전달', (tester) async {
    final opened = <Uri>[];
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          repositoryProvider.overrideWithValue(MemoryRepository()),
          externalLinkOpenerProvider.overrideWithValue((url) async {
            opened.add(url);
            return true;
          }),
        ],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('설정'));
    await tester.pumpAndSettle();
    await tapVisible(tester, find.byKey(const Key('privacy-policy-link')));
    await tapVisible(tester, find.byKey(const Key('customer-support-link')));
    expect(opened.map((u) => u.toString()), [
      privacyPolicyUrl,
      customerSupportUrl,
    ]);
    expect(
      opened.every(
        (u) => u.scheme == 'https' && u.host.endsWith('.notion.site'),
      ),
      isTrue,
    );
    expect(find.byType(AlertDialog), findsNothing);
    expect(tester.takeException(), isNull);
  });
  for (final throwsError in [false, true]) {
    testWidgets('브라우저 실행 ${throwsError ? '예외' : '실패'} 시 주소 복사 대안 표시', (
      tester,
    ) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            repositoryProvider.overrideWithValue(MemoryRepository()),
            externalLinkOpenerProvider.overrideWithValue((url) async {
              if (throwsError) throw StateError('No browser');
              return false;
            }),
          ],
          child: const HowMuchApp(),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('설정'));
      await tester.pumpAndSettle();
      await tapVisible(tester, find.byKey(const Key('privacy-policy-link')));
      expect(find.byType(AlertDialog), findsOneWidget);
      expect(find.text(privacyPolicyUrl), findsOneWidget);
      expect(find.text('주소 복사'), findsOneWidget);
      await tester.tap(find.text('닫기'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
    });
  }
}
