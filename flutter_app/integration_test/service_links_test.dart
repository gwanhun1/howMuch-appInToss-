import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:path/path.dart' as path;
import 'package:sqflite/sqflite.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:howmuch/app.dart';
import 'package:howmuch/data/record_repository.dart';
import 'package:howmuch/data/service_links.dart';
import 'package:howmuch/state/records.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('설정 링크 표시와 실제 OS 브라우저 실행', (tester) async {
    const name = 'howmuch-service-links-test.db';
    final file = path.join(await getDatabasesPath(), name);
    await deleteDatabase(file);
    final repo = await SqliteRecordRepository.open(name: name);
    addTearDown(() async {
      await repo.db.close();
      await deleteDatabase(file);
    });
    await tester.pumpWidget(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(repo)],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('설정'));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('privacy-policy-link')), findsOneWidget);
    expect(find.byKey(const Key('customer-support-link')), findsOneWidget);
    if (const bool.fromEnvironment('CAPTURE_SCREENSHOTS')) {
      await binding.takeScreenshot('settings-service-links');
    }
    // Opening Safari backgrounds the app. Test one URL per foreground launch.
    const target = String.fromEnvironment(
      'SERVICE_LINK',
      defaultValue: 'privacy',
    );
    expect(
      await launchUrl(
        Uri.parse(target == 'support' ? customerSupportUrl : privacyPolicyUrl),
        mode: LaunchMode.externalApplication,
      ),
      isTrue,
    );
  });
}
