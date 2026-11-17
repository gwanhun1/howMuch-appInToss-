import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:howmuch/app.dart';
import 'package:howmuch/state/records.dart';
import 'package:howmuch/ui/tools_page.dart';
import 'package:howmuch/ui/widgets/product_widgets.dart';
import 'package:howmuch/ui/widgets/tool_layout.dart';

import 'support.dart';

void main() {
  testWidgets('메인 모드·도구·검색·필터 사이 20px 간격', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(MemoryRepository())],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    final mode = tester.getRect(find.widgetWithText(Pill, '보낸 마음'));
    final tools = tester.getRect(find.widgetWithText(Pill, '금액 가이드'));
    final search = tester.getRect(find.byKey(const Key('search')));
    final filter = tester.getRect(find.byTooltip('카테고리 선택'));
    expect(tools.top - mode.bottom, closeTo(20, .1));
    expect(search.top - tools.bottom, closeTo(20, .1));
    // The filter is centered against a 48px view-toggle touch target.
    expect(filter.top - search.bottom, closeTo(20, 1.1));
  });
  testWidgets('계산기의 라벨·입력 간 8px, 필드 간 20px', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(MemoryRepository())],
        child: const HowMuchApp(home: BudgetPage()),
      ),
    );
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.text('이름·행사 (선택)'),
      250,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    final field = find.ancestor(
      of: find.text('이름·행사 (선택)'),
      matching: find.byType(ToolField),
    );
    final input = find.descendant(
      of: field,
      matching: find.byType(ToolTextInput),
    );
    expect(
      tester.getRect(input).top -
          tester.getRect(find.text('이름·행사 (선택)')).bottom,
      closeTo(8, .1),
    );
    expect(
      tester.getRect(find.text('종류')).top - tester.getRect(input).bottom,
      closeTo(20, .1),
    );
    expect(
      tester
          .widget<TextField>(
            find.descendant(of: input, matching: find.byType(TextField)),
          )
          .decoration!
          .labelText,
      isNull,
    );
  });
}
