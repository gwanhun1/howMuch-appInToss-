import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/api_record_repository.dart';
import '../data/record_repository.dart';
import '../domain/record.dart';

final repositoryProvider = Provider<RecordRepository>(
  (ref) => throw UnimplementedError(),
);
final apiOpenProvider = Provider<void Function()?>((ref) => null);
final apiReturnToLocalProvider = Provider<void Function()?>((ref) => null);
final apiLogoutProvider = Provider<Future<void> Function()?>((ref) => null);

final apiDeleteAccountProvider = Provider<Future<void> Function(String)?>(
  (ref) => null,
);
const apiPrivacyUrl = String.fromEnvironment('HOWMUCH_PRIVACY_URL');

final recordsProvider =
    AsyncNotifierProvider<RecordsController, List<MoneyRecord>>(
      RecordsController.new,
    );

class RecordsController extends AsyncNotifier<List<MoneyRecord>> {
  @override
  Future<List<MoneyRecord>> build() => ref.read(repositoryProvider).readAll();
  Future<void> save(List<MoneyRecord> records) async {
    final repository = ref.read(repositoryProvider);
    // DB에서 읽어 온 항목만 PATCH한다. 새 기록의 재시도는 같은 ID로 POST한다.
    if (repository is ApiRecordRepository &&
        records.length == 1 &&
        (state.value?.any((record) => record.id == records.single.id) ??
            false)) {
      await repository.update(records.single);
    } else {
      await repository.saveAll(records);
    }
    state = AsyncData(await repository.readAll());
  }

  Future<int> restore(List<MoneyRecord> records) async {
    final repository = ref.read(repositoryProvider);
    final count = await repository.restoreMissing(records);
    try {
      state = AsyncData(await repository.readAll());
    } catch (error, stack) {
      // The transaction succeeded; a refresh error must not report restore failure.
      state = AsyncError(error, stack);
    }
    return count;
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
