import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:howmuch/data/api_record_repository.dart';
import 'package:howmuch/domain/record.dart';
import 'package:uuid/uuid.dart';

void main() {
  final env = Platform.environment;
  final url = env['HOWMUCH_ORACLE_TEST_URL'];
  final username = env['HOWMUCH_ORACLE_TEST_USER'];
  final password = env['HOWMUCH_ORACLE_TEST_PASSWORD'];

  test('실제 서버 로그인과 기록 생성, 조회, 수정, 삭제', () async {
    final repository = ApiRecordRepository(
      url!,
      origin: env['HOWMUCH_ORACLE_TEST_ORIGIN'],
    );
    addTearDown(repository.close);
    await repository.login(username!, password!);

    final record = MoneyRecord(
      id: const Uuid().v4(),
      name: 'Flutter 데모',
      amount: 50000,
      date: '2026-11-24',
    );
    final batch = List.generate(
      2,
      (index) => MoneyRecord(
        id: const Uuid().v4(),
        name: 'Flutter 장부 ${index + 1}',
        amount: 30000,
        date: '2026-11-24',
        mode: 'received',
      ),
    );
    try {
      await repository.saveAll([record]);
      await repository.saveAll([record]);
      final afterCreate = await repository.readAll();
      expect(afterCreate.where((item) => item.id == record.id), hasLength(1));
      expect(
        afterCreate.singleWhere((item) => item.id == record.id).amount,
        50000,
      );

      await repository.update(record.copyWith(isFavorite: true));
      final updated = (await repository.readAll()).singleWhere(
        (item) => item.id == record.id,
      );
      expect(updated.isFavorite, isTrue);
      expect(updated.profileIcon, record.profileIcon);

      await repository.saveAll(batch);
      final afterBatch = await repository.readAll();
      expect(
        afterBatch.where((item) => batch.any((row) => row.id == item.id)),
        hasLength(2),
      );
      await repository.delete(record.id);
      expect(
        (await repository.readAll()).any((item) => item.id == record.id),
        isFalse,
      );
    } finally {
      for (final item in [record, ...batch]) {
        await repository.delete(item.id);
      }
      await repository.logout();
    }
  }, skip: url == null || username == null || password == null);
}
