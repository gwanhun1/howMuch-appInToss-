import 'package:unorm_dart/unorm_dart.dart' as unicode;

import 'record.dart';

String normalizeName(String value) => unicode.nfc(value.trim()).toLowerCase();
int compareRecords(MoneyRecord a, MoneyRecord b) {
  final favorite = (b.isFavorite ? 1 : 0).compareTo(a.isFavorite ? 1 : 0);
  return favorite != 0 ? favorite : compareRecent(a, b);
}

int compareRecent(MoneyRecord a, MoneyRecord b) {
  final date = b.date.compareTo(a.date);
  return date != 0 ? date : b.createdAt.compareTo(a.createdAt);
}

class PersonGroup {
  PersonGroup(this.name, this.relation);
  final String name, relation;
  final records = <MoneyRecord>[];
  int get paid => totalFor(records, 'paid');
  int get received => totalFor(records, 'received');
}

List<PersonGroup> searchPeople(List<MoneyRecord> records, String query) {
  final search = normalizeName(query);
  if (search.isEmpty) return [];
  final groups = <(String, String), PersonGroup>{};
  for (final r in records) {
    if (!normalizeName(r.name).contains(search)) continue;
    final key = (normalizeName(r.name), r.relation.trim());
    final group = groups.putIfAbsent(
      key,
      () => PersonGroup(r.name.trim(), r.relation.trim()),
    );
    group.records.add(r);
  }
  final result = groups.values.toList();
  for (final g in result) {
    g.records.sort(compareRecent);
  }
  result.sort((a, b) {
    final n = a.name.compareTo(b.name);
    return n != 0 ? n : a.relation.compareTo(b.relation);
  });
  return result;
}

String? dday(String date, {String? referenceDay}) {
  if (!validDate(date)) return null;
  final reference = DateTime.parse('${referenceDay ?? today()}T00:00:00Z');
  final diff = DateTime.parse('${date}T00:00:00Z').difference(reference).inDays;
  return diff < 0
      ? null
      : diff == 0
      ? 'D-Day'
      : 'D-$diff';
}

({int last, int frequent})? amountHistory(
  List<MoneyRecord> records,
  String mode,
  String type,
) {
  final matching =
      records.where((r) => r.mode == mode && r.type == type).toList()
        ..sort(compareRecent);
  if (matching.isEmpty) return null;
  final counts = <int, int>{};
  for (final r in matching) {
    counts[r.amount] = (counts[r.amount] ?? 0) + 1;
  }
  var frequent = matching.first.amount, count = 0;
  for (final entry in counts.entries) {
    if (entry.value > count) {
      frequent = entry.key;
      count = entry.value;
    }
  }
  return (last: matching.first.amount, frequent: frequent);
}

String guideExplanation(String closeness, bool attending, String type) {
  final prefix = switch (closeness) {
    'close' => '가까운 사이라면 친밀도와 본인의 예산에 맞춰 선택해보세요.',
    'regular' => '꾸준히 연락하는 사이라면 평소 주고받은 마음도 함께 생각해보세요.',
    _ => '가끔 연락하는 사이라면 부담이 적은 선택부터 살펴보세요.',
  };
  final suffix = type == '조의금'
      ? '조문 여부보다 위로를 전하는 마음과 본인의 형편이 우선이에요.'
      : attending
      ? '참석 비용도 고려할 수 있지만, 무리해서 금액을 맞출 필요는 없어요.'
      : '참석하지 않아도 본인의 형편에 맞게 마음을 전할 수 있어요.';
  return '$prefix $suffix';
}
