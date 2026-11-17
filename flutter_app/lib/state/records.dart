import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/record_repository.dart';
import '../domain/record.dart';

final repositoryProvider = Provider<RecordRepository>(
  (ref) => throw UnimplementedError(),
);
final recordsProvider =
    AsyncNotifierProvider<RecordsController, List<MoneyRecord>>(
      RecordsController.new,
    );

class RecordsController extends AsyncNotifier<List<MoneyRecord>> {
  @override
  Future<List<MoneyRecord>> build() => ref.read(repositoryProvider).readAll();
  Future<void> save(List<MoneyRecord> records) async {
    await ref.read(repositoryProvider).saveAll(records);
    state = AsyncData(await ref.read(repositoryProvider).readAll());
  }

  Future<void> remove(String id) async {
    await ref.read(repositoryProvider).delete(id);
    state = AsyncData(await ref.read(repositoryProvider).readAll());
  }

  Future<void> clear() async {
    await ref.read(repositoryProvider).clear();
    state = const AsyncData([]);
  }
}
