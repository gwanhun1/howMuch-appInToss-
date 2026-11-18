import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:path/path.dart' as path;
import 'package:sqflite/sqflite.dart';
import 'package:howmuch/app.dart';
import 'package:howmuch/data/backup_files.dart';
import 'package:howmuch/data/record_repository.dart';
import 'package:howmuch/domain/record.dart';
import 'package:howmuch/domain/record_backup.dart';
import 'package:howmuch/state/records.dart';

// The OS picker/share sheet is replaced at its boundary; bytes use a real file.
class TestBackupFiles implements BackupFiles {
  TestBackupFiles(this.file);
  final File file;
  @override
  Future<Uint8List?> pick() => file.readAsBytes();
  @override
  Future<bool> share(Uint8List bytes, String name, Rect origin) async {
    await file.writeAsBytes(bytes);
    return true;
  }
}

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('파일 백업과 SQLite 복원·기존 보존·반복 복원', (tester) async {
    const dbName = 'howmuch-backup-test.db';
    final dbPath = path.join(await getDatabasesPath(), dbName);
    await deleteDatabase(dbPath);
    final repo = await SqliteRecordRepository.open(name: dbName);
    final directory = await Directory.systemTemp.createTemp(
      'howmuch-backup-test-',
    );
    final file = File(path.join(directory.path, 'backup.json'));
    addTearDown(() async {
      await repo.db.close();
      await deleteDatabase(dbPath);
      await directory.delete(recursive: true);
    });
    const original = [
      MoneyRecord(
        id: 'paid',
        name: '김친구',
        amount: 100000,
        date: '2026-11-18',
        relation: '친구',
        profileIcon: '🐲',
        isFavorite: true,
      ),
      MoneyRecord(
        id: 'received',
        name: '이동료',
        amount: 50000,
        date: '2026-11-18',
        mode: 'received',
        type: '용돈',
      ),
    ];
    await repo.saveAll(original);
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          repositoryProvider.overrideWithValue(repo),
          backupFilesProvider.overrideWithValue(TestBackupFiles(file)),
        ],
        child: const HowMuchApp(),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('설정'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('기록 백업·복원'));
    await tester.tap(find.text('기록 백업·복원'));
    await tester.pumpAndSettle();
    Future<void> tap(Key key) async {
      await tester.ensureVisible(find.byKey(key));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(key));
      await tester.pumpAndSettle();
    }

    Future<void> screenshot(String name) async {
      if (const bool.fromEnvironment('CAPTURE_SCREENSHOTS')) {
        await binding.takeScreenshot(name);
      }
    }

    await screenshot('backup');
    await tap(const Key('export-backup'));
    expect(decodeBackup(await file.readAsBytes()).records.length, 2);
    await repo.clear();
    await repo.saveAll([
      const MoneyRecord(
        id: 'paid',
        name: '수정한 친구',
        amount: 300000,
        date: '2026-11-18',
      ),
    ]);
    await tap(const Key('pick-backup'));
    await tester.ensureVisible(find.byKey(const Key('restore-backup')));
    await tester.pumpAndSettle();
    await screenshot('backup-preview');
    expect(find.text('전체 2건 · 추가 1건'), findsOneWidget);
    expect((await repo.readAll()).length, 1);
    await tap(const Key('restore-backup'));
    final restored = await repo.readAll();
    expect(restored.length, 2);
    expect(restored.firstWhere((r) => r.id == 'paid').amount, 300000);
    expect(
      restored.firstWhere((r) => r.id == 'received').toMap(),
      original.last.toMap(),
    );
    await tester.ensureVisible(find.byKey(const Key('backup-message')));
    await tester.pumpAndSettle();
    await screenshot('backup-complete');
    await tap(const Key('pick-backup'));
    await tester.ensureVisible(find.byKey(const Key('restore-backup')));
    await tester.pumpAndSettle();
    expect(
      tester
          .widget<FilledButton>(find.byKey(const Key('restore-backup')))
          .onPressed,
      isNull,
    );
    expect((await repo.readAll()).length, 2);
  });
}
