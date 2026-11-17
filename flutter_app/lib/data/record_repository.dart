import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import '../domain/record.dart';

abstract interface class RecordRepository {
  Future<List<MoneyRecord>> readAll();
  Future<void> saveAll(List<MoneyRecord> records);
  Future<void> delete(String id);
  Future<void> clear();
}

class SqliteRecordRepository implements RecordRepository {
  SqliteRecordRepository(this.db);
  final Database db;
  static Future<SqliteRecordRepository> open({
    String name = 'howmuch.db',
  }) async {
    final db = await openDatabase(
      p.join(await getDatabasesPath(), name),
      version: 2,
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          await db.execute(
            "ALTER TABLE records ADD COLUMN createdAt TEXT NOT NULL DEFAULT ''",
          );
        }
      },
      onCreate: (db, version) => db.execute('''CREATE TABLE records (
        createdAt TEXT NOT NULL DEFAULT '', id TEXT PRIMARY KEY, name TEXT NOT NULL, amount INTEGER NOT NULL,
        date TEXT NOT NULL, mode TEXT NOT NULL, type TEXT NOT NULL,
        relation TEXT NOT NULL, profileIcon TEXT NOT NULL, isFavorite INTEGER NOT NULL
      )'''),
    );
    return SqliteRecordRepository(db);
  }

  @override
  Future<List<MoneyRecord>> readAll() async => (await db.query(
    'records',
    orderBy: 'isFavorite DESC, date DESC, createdAt DESC, id DESC',
  )).map(MoneyRecord.fromMap).toList();
  @override
  Future<void> saveAll(List<MoneyRecord> records) async {
    for (final record in records) {
      record.validate();
    }
    await db.transaction((txn) async {
      final batch = txn.batch();
      for (final r in records) {
        batch.insert(
          'records',
          r.toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
      await batch.commit(noResult: true);
    });
  }

  @override
  Future<void> delete(String id) =>
      db.delete('records', where: 'id = ?', whereArgs: [id]);
  @override
  Future<void> clear() => db.delete('records');
}
