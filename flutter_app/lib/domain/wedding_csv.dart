import 'dart:convert';

import 'record.dart';
import 'presentation.dart';

List<List<String>> parseCsv(String text) {
  final input = text
      .replaceFirst(RegExp('^\uFEFF'), '')
      .replaceAll('\r\n', '\n')
      .replaceAll('\r', '\n');
  final rows = <List<String>>[];
  var row = <String>[];
  var field = '';
  var quoted = false;
  var closed = false;
  for (var i = 0; i < input.length; i++) {
    final c = input[i];
    if (quoted) {
      if (c == '"') {
        if (i + 1 < input.length && input[i + 1] == '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else {
        field += c;
      }
    } else if (c == ',' || c == '\n') {
      row.add(field);
      field = '';
      closed = false;
      if (c == '\n') {
        if (row.any((v) => v.trim().isNotEmpty)) rows.add(row);
        row = [];
      }
    } else if (c == '"' && field.isEmpty && !closed) {
      quoted = true;
    } else if (closed || c == '"') {
      throw const FormatException('CSV 따옴표 형식을 확인해주세요.');
    } else {
      field += c;
    }
  }
  if (quoted) throw const FormatException('CSV 따옴표가 닫히지 않았어요.');
  row.add(field);
  if (row.any((v) => v.trim().isNotEmpty)) rows.add(row);
  return rows;
}

List<MoneyRecord> parseWeddingCsv(
  String text,
  String date,
  String Function() newId,
) {
  if (utf8.encode(text).length > 100000) {
    throw const FormatException('CSV는 100KB 이하만 지원해요.');
  }
  if (!validDate(date)) throw const FormatException('날짜를 확인해주세요.');
  final rows = parseCsv(text);
  if (rows.isEmpty) throw const FormatException('CSV 내용을 입력해주세요.');
  final header = rows.first;
  if (header.length < 2 ||
      header.length > 4 ||
      header[0] != '이름' ||
      header[1] != '금액' ||
      (header.length >= 3 && header[2] != '관계') ||
      (header.length == 4 && header[3] != '날짜')) {
    throw const FormatException('첫 줄은 이름,금액 또는 이름,금액,관계,날짜여야 해요.');
  }
  if (rows.length < 2 || rows.length > 26) {
    throw const FormatException('한 번에 1~25명까지 불러올 수 있어요.');
  }
  return rows.skip(1).map((row) {
    if (row.length != header.length) {
      throw const FormatException('CSV 열 개수를 확인해주세요.');
    }
    if (row.length == 4 && row[3].isNotEmpty && row[3] != date) {
      throw const FormatException('CSV 날짜와 선택한 날짜가 달라요.');
    }
    final amount = parseAmount(row[1].replaceAll(',', '').trim());
    if (amount == null) throw const FormatException('금액은 1원~1억 원으로 입력해주세요.');
    final r = MoneyRecord(
      id: newId(),
      name: row[0].trim(),
      amount: amount,
      date: date,
      mode: 'received',
      relation: row.length >= 3 ? row[2].trim() : '',
    );
    r.validate();
    return r;
  }).toList();
}

String csvCell(String value) {
  final safe = RegExp(r'^\s*[=+\-@\t\r\n]').hasMatch(value) ? "'$value" : value;
  return '"${safe.replaceAll('"', '""')}"';
}

String exportWeddingCsv(Iterable<MoneyRecord> records) {
  final rows = records
      .where((r) => r.mode == 'received' && r.type == '축의금')
      .map(
        (r) =>
            [r.name, '${r.amount}', r.relation, r.date].map(csvCell).join(','),
      );
  return '\uFEFF이름,금액,관계,날짜\r\n${rows.join('\r\n')}\r\n';
}

bool hasWeddingDuplicates(
  List<MoneyRecord> incoming,
  List<MoneyRecord> existing,
) {
  String key(MoneyRecord r) =>
      jsonEncode([normalizeName(r.name), r.amount, r.relation.trim(), r.date]);
  final seen = existing
      .where((r) => r.mode == 'received' && r.type == '축의금')
      .map(key)
      .toSet();
  for (final r in incoming) {
    if (!seen.add(key(r))) return true;
  }
  return false;
}
