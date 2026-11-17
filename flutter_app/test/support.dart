import 'package:howmuch/data/record_repository.dart';
import 'package:howmuch/domain/record.dart';

class MemoryRepository implements RecordRepository {
  final records = <String, MoneyRecord>{};
  bool failWrites = false;
  bool failNextReadAfterWrite = false;
  bool failReadOnce = false;
  @override
  Future<List<MoneyRecord>> readAll() async {
    if (failReadOnce) {
      failReadOnce = false;
      throw StateError('read failed');
    }
    return records.values.toList();
  }

  @override
  Future<void> saveAll(List<MoneyRecord> values) async {
    if (failWrites) throw StateError('disk full');
    for (final r in values) {
      r.validate();
    }
    for (final r in values) {
      records[r.id] = r;
    }
    if (failNextReadAfterWrite) {
      failNextReadAfterWrite = false;
      failReadOnce = true;
    }
  }

  @override
  Future<void> delete(String id) async {
    records.remove(id);
  }

  @override
  Future<void> clear() async {
    records.clear();
  }
}
