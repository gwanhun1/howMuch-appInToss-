import 'package:intl/intl.dart';

const categories = ['용돈', '축의금', '조의금', '돌잔치'];
const profileIcons = [
  '🙂',
  '🧑',
  '🎅',
  '🐱',
  '🐹',
  '🐰',
  '🐧',
  '🐶',
  '🧚',
  '🐷',
  '😈',
  '🐮',
  '🐻',
  '🤴',
  '🐲',
];
const maxAmount = 100000000;
String won(int amount) =>
    '${NumberFormat.decimalPattern('ko').format(amount)}원';
String dayString(DateTime date) => DateFormat('yyyy-MM-dd').format(date);
String today() =>
    dayString(DateTime.now().toUtc().add(const Duration(hours: 9)));
int? parseAmount(String text) {
  if (!RegExp(r'^\d+$').hasMatch(text)) return null;
  final value = int.tryParse(text);
  return value != null && value > 0 && value <= maxAmount ? value : null;
}

bool validDate(String text) {
  if (!RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(text)) return false;
  final date = DateTime.tryParse(text);
  return date != null && dayString(date) == text;
}

class MoneyRecord {
  const MoneyRecord({
    required this.id,
    required this.name,
    required this.amount,
    required this.date,
    this.mode = 'paid',
    this.type = '축의금',
    this.relation = '',
    this.profileIcon = '🙂',
    this.isFavorite = false,
    this.createdAt = '',
  });
  final String id, name, mode, type, relation, date, profileIcon;
  final String createdAt;
  final int amount;
  final bool isFavorite;
  MoneyRecord copyWith({bool? isFavorite}) => MoneyRecord(
    id: id,
    name: name,
    amount: amount,
    date: date,
    mode: mode,
    type: type,
    relation: relation,
    profileIcon: profileIcon,
    isFavorite: isFavorite ?? this.isFavorite,
    createdAt: createdAt,
  );
  void validate() {
    if (name.trim().isEmpty ||
        name.length > 50 ||
        relation.length > 50 ||
        parseAmount('$amount') == null ||
        !validDate(date) ||
        !['paid', 'received'].contains(mode) ||
        !categories.contains(type)) {
      throw const FormatException('이름, 금액(1원~1억 원), 날짜를 확인해주세요.');
    }
  }

  Map<String, Object?> toMap() => {
    'id': id,
    'createdAt': createdAt,
    'name': name,
    'amount': amount,
    'date': date,
    'mode': mode,
    'type': type,
    'relation': relation,
    'profileIcon': profileIcon,
    'isFavorite': isFavorite ? 1 : 0,
  };
  factory MoneyRecord.fromMap(Map<String, Object?> m) => MoneyRecord(
    id: m['id'] as String,
    createdAt: m['createdAt'] as String? ?? '',
    name: m['name'] as String,
    amount: m['amount'] as int,
    date: m['date'] as String,
    mode: m['mode'] as String,
    type: m['type'] as String,
    relation: m['relation'] as String,
    profileIcon: m['profileIcon'] as String,
    isFavorite: m['isFavorite'] == 1,
  );
}

int totalFor(Iterable<MoneyRecord> records, String mode) =>
    records.where((r) => r.mode == mode).fold(0, (sum, r) => sum + r.amount);
List<int> guideAmounts(String closeness, bool attending, String type) {
  final values = switch (closeness) {
    'close' => [100000, 200000, 300000],
    'regular' => [100000, 150000],
    _ => [50000, 100000],
  };
  if (closeness == 'regular' && !attending && type != '조의금') {
    values.insert(0, 50000);
  }
  return values;
}

class BudgetSummary {
  BudgetSummary(List<String> amounts, String budget)
    : total = amounts.map(parseAmount).fold(0, (sum, n) => sum + (n ?? 0)),
      valid = amounts.every((a) => parseAmount(a) != null),
      limit = parseAmount(budget);
  final int total;
  final bool valid;
  final int? limit;
  int? get remaining => valid && limit != null ? limit! - total : null;
}
