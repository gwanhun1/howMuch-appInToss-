import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:howmuch/domain/record.dart';
import 'package:howmuch/domain/record_backup.dart';

MoneyRecord sample(String id, {int amount = 12345}) => MoneyRecord(
  id: id,
  name: '김친구',
  amount: amount,
  date: '2026-11-18',
  mode: 'received',
  type: '돌잔치',
  relation: '친구',
  profileIcon: '🐲',
  isFavorite: true,
  createdAt: '2026-11-17T12:30:00.000Z',
);

void main() {
  test('전체 기록 모든 필드와 빈 백업 round trip', () {
    final records = [
      sample('one'),
      const MoneyRecord(
        id: 'old',
        name: '이전 기록',
        amount: 1,
        date: '2026-01-01',
      ),
    ];
    final now = DateTime.utc(2026, 11, 18);
    final backup = decodeBackup(encodeBackup(records, now: now));
    expect(backup.createdAt, now);
    expect(backup.records.map((r) => r.toMap()), records.map((r) => r.toMap()));
    expect(decodeBackup(encodeBackup([])).records, isEmpty);
  });
  test('UTF-8 BOM 지원, 깨진 파일·형식·버전·필드·범위·중복 ID 거부', () {
    final bytes = encodeBackup([sample('one')]);
    expect(
      decodeBackup(Uint8List.fromList([239, 187, 191, ...bytes]))
          .records
          .length,
      1,
    );
    final base = jsonDecode(utf8.decode(bytes)) as Map<String, dynamic>;
    for (final mutation in <void Function(Map<String, dynamic>)>[
      (m) => m['format'] = 'toss',
      (m) => m['version'] = 2,
      (m) => m['createdAt'] = 'invalid',
      (m) => m['records'][0]['amount'] = '12345',
      (m) => m['records'][0]['amount'] = 100000001,
      (m) => m['records'][0]['date'] = '2026-02-30',
      (m) => m['records'][0]['isFavorite'] = true,
      (m) => m['records'][0]['id'] = '',
      (m) => m['records'][0]['createdAt'] = 'invalid',
      (m) => m['records'][0].remove('profileIcon'),
      (m) => m['records'].add(m['records'][0]),
    ]) {
      final modified = jsonDecode(jsonEncode(base)) as Map<String, dynamic>;
      mutation(modified);
      expect(
        () =>
            decodeBackup(Uint8List.fromList(utf8.encode(jsonEncode(modified)))),
        throwsFormatException,
      );
    }
    expect(
      () => decodeBackup(Uint8List.fromList([255])),
      throwsFormatException,
    );
    expect(
      () => decodeBackup(Uint8List.fromList(utf8.encode('{broken'))),
      throwsFormatException,
    );
    expect(
      () => decodeBackup(Uint8List(maxBackupBytes + 1)),
      throwsFormatException,
    );
    expect(
      () => encodeBackup(
        List.generate(maxBackupRecords + 1, (i) => sample('$i')),
      ),
      throwsFormatException,
    );
  });
  test('ID별 동일·충돌·추가 구분, 기존 수정값 유지', () {
    final backup = RecordBackup(
      createdAt: DateTime.utc(2026),
      records: [sample('same'), sample('conflict'), sample('new')],
    );
    final preview = RestorePreview(backup, [
      sample('same'),
      sample('conflict', amount: 999),
    ]);
    expect(preview.identical, 1);
    expect(preview.conflicts, 1);
    expect(preview.additions.single.id, 'new');
  });
}
