import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:howmuch/app.dart';
import 'package:howmuch/data/backup_files.dart';
import 'package:howmuch/domain/record_backup.dart';
import 'package:howmuch/state/records.dart';
import 'package:howmuch/ui/backup_page.dart';

import 'record_backup_test.dart' show sample;
import 'support.dart';
import 'ui_helpers.dart';

class FakeBackupFiles implements BackupFiles {
  Uint8List? selected, exported;
  @override
  Future<Uint8List?> pick() async => selected;
  @override
  Future<bool> share(Uint8List bytes, String name, Rect origin) async {
    exported = bytes;
    return true;
  }
}

void main() {
  testWidgets('설정 진입, 전체 백업, 복원 미리보기·실패 재시도·기존 보존·반복 방지', (tester) async {
    final repo = MemoryRepository();
    await repo.saveAll([sample('existing', amount: 999)]);
    final files = FakeBackupFiles()
      ..selected = encodeBackup([sample('existing'), sample('new')]);
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          repositoryProvider.overrideWithValue(repo),
          backupFilesProvider.overrideWithValue(files),
        ],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('설정'));
    await tester.pumpAndSettle();
    await tapVisible(tester, find.text('기록 백업·복원'));
    expect(find.byType(BackupPage), findsOneWidget);
    await tapVisible(tester, find.byKey(const Key('export-backup')));
    expect(decodeBackup(files.exported!).records.single.amount, 999);
    await tapVisible(tester, find.byKey(const Key('pick-backup')));
    await tester.ensureVisible(find.text('복원 전 확인'));
    await tester.pumpAndSettle();
    expect(find.text('전체 2건 · 추가 1건'), findsOneWidget);
    expect(repo.records.length, 1);
    repo.failWrites = true;
    await tapVisible(tester, find.byKey(const Key('restore-backup')));
    expect(repo.records.length, 1);
    expect(find.byKey(const Key('restore-backup')), findsOneWidget);
    repo.failWrites = false;
    await tapVisible(tester, find.byKey(const Key('restore-backup')));
    expect(repo.records.length, 2);
    expect(repo.records['existing']!.amount, 999);
    await tapVisible(tester, find.byKey(const Key('pick-backup')));
    await tester.ensureVisible(find.byKey(const Key('restore-backup')));
    await tester.pumpAndSettle();
    final button = tester.widget<FilledButton>(
      find.byKey(const Key('restore-backup')),
    );
    expect(button.onPressed, isNull);
    expect(repo.records.length, 2);
    await tapVisible(tester, find.text('복원 취소'));
    expect(find.byKey(const Key('restore-backup')), findsNothing);
  });
  testWidgets('잘못된 파일·파일 선택 취소는 기록을 변경하지 않음, 큰 글자 화면', (tester) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final repo = MemoryRepository();
    final files = FakeBackupFiles()..selected = Uint8List.fromList([1, 2, 3]);
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          repositoryProvider.overrideWithValue(repo),
          backupFilesProvider.overrideWithValue(files),
        ],
        child: MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(
              size: Size(320, 640),
              textScaler: TextScaler.linear(1.8),
            ),
            child: const BackupPage(),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.byKey(const Key('pick-backup')), 250);
    await tapVisible(tester, find.byKey(const Key('pick-backup')));
    expect(find.byKey(const Key('backup-message')), findsOneWidget);
    expect(repo.records, isEmpty);
    files.selected = null;
    await tapVisible(tester, find.byKey(const Key('pick-backup')));
    expect(find.byKey(const Key('backup-message')), findsNothing);
    expect(tester.takeException(), isNull);
  });
  test('저장 후 조회 실패는 복원 성공 건수를 유지하며 재시도도 중복 없음', () async {
    final repo = MemoryRepository()..failNextReadAfterWrite = true;
    final container = ProviderContainer(
      overrides: [repositoryProvider.overrideWithValue(repo)],
    );
    addTearDown(container.dispose);
    await container.read(recordsProvider.future);
    expect(
      await container.read(recordsProvider.notifier).restore([sample('new')]),
      1,
    );
    expect(container.read(recordsProvider).hasError, isTrue);
    expect(
      await container.read(recordsProvider.notifier).restore([sample('new')]),
      0,
    );
    expect(repo.records.length, 1);
  });
}
