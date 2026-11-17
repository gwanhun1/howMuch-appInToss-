import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as path;
import 'package:howmuch/data/record_repository.dart';
import 'package:howmuch/domain/record.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('기존 Flutter DB 업그레이드 보존과 일괄 저장 rollback', (tester) async {
    const name = 'howmuch-migration-test.db';
    final file = path.join(await getDatabasesPath(), name);
    await deleteDatabase(file);
    final old = await openDatabase(
      file,
      version: 1,
      onCreate: (db, _) => db.execute(
        '''CREATE TABLE records (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, amount INTEGER NOT NULL, date TEXT NOT NULL,
      mode TEXT NOT NULL, type TEXT NOT NULL, relation TEXT NOT NULL, profileIcon TEXT NOT NULL, isFavorite INTEGER NOT NULL)''',
      ),
    );
    await old.insert('records', {
      'id': 'existing',
      'name': '기존 기록',
      'amount': 100000,
      'date': '2026-11-17',
      'mode': 'paid',
      'type': '축의금',
      'relation': '친구',
      'profileIcon': '🙂',
      'isFavorite': 0,
    });
    await old.close();
    final repo = await SqliteRecordRepository.open(name: name);
    expect((await repo.readAll()).single.name, '기존 기록');
    expect((await repo.readAll()).single.createdAt, '');
    await repo.db.execute(
      "CREATE TEMP TRIGGER reject_record BEFORE INSERT ON records WHEN NEW.id = 'fail' BEGIN SELECT RAISE(ABORT, 'test failure'); END",
    );
    await expectLater(
      repo.saveAll([
        const MoneyRecord(
          id: 'valid',
          name: '정상',
          amount: 10000,
          date: '2026-11-17',
        ),
        const MoneyRecord(
          id: 'fail',
          name: '실패',
          amount: 10000,
          date: '2026-11-17',
        ),
      ]),
      throwsA(isA<DatabaseException>()),
    );
    expect((await repo.readAll()).map((r) => r.id), ['existing']);
    await repo.db.close();
    await deleteDatabase(file);
  });
}
