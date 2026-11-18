import 'dart:convert';
import 'dart:typed_data';

import 'record.dart';

const maxBackupBytes = 10 * 1024 * 1024;
const maxBackupRecords = 10000;
const backupFormat = 'howmuch-independent-backup';

class RecordBackup {
  RecordBackup({required this.createdAt, required this.records});
  final DateTime createdAt;
  final List<MoneyRecord> records;
}

void validateBackupRecords(List<MoneyRecord> records) {
  if (records.length > maxBackupRecords) {
    throw const FormatException('백업은 최대 10,000건까지 지원해요.');
  }
  final ids = <String>{};
  for (final r in records) {
    r.validate();
    if (r.id.trim().isEmpty ||
        r.id.length > 128 ||
        !ids.add(r.id) ||
        r.profileIcon.isEmpty ||
        r.profileIcon.length > 32 ||
        r.createdAt.length > 40 ||
        (r.createdAt.isNotEmpty && DateTime.tryParse(r.createdAt) == null)) {
      throw const FormatException('기록 ID나 프로필, 작성일이 올바르지 않아요.');
    }
  }
}

Uint8List encodeBackup(List<MoneyRecord> records, {DateTime? now}) {
  validateBackupRecords(records);
  final bytes = Uint8List.fromList(
    utf8.encode(
      jsonEncode({
        'format': backupFormat,
        'version': 1,
        'createdAt': (now ?? DateTime.now()).toUtc().toIso8601String(),
        'records': records.map((r) => r.toMap()).toList(),
      }),
    ),
  );
  if (bytes.length > maxBackupBytes) {
    throw const FormatException('백업 파일은 10MB 이하만 지원해요.');
  }
  return bytes;
}

RecordBackup decodeBackup(Uint8List bytes) {
  if (bytes.length > maxBackupBytes) {
    throw const FormatException('백업 파일은 10MB 이하만 지원해요.');
  }
  final Object? data;
  try {
    final text = utf8.decode(bytes);
    data = jsonDecode(text.startsWith('\uFEFF') ? text.substring(1) : text);
  } catch (_) {
    throw const FormatException('파일이 손상되었거나 JSON 형식이 아니에요. 원본 백업 파일을 선택해주세요.');
  }
  try {
    if (data is! Map<String, dynamic> || data['format'] != backupFormat) {
      throw const FormatException('이 독립 앱에서 만든 JSON 백업 파일을 선택해주세요.');
    }
    if (data['version'] is! int || data['version'] != 1) {
      throw const FormatException('지원하지 않는 백업 버전이에요. 앱 업데이트를 확인해주세요.');
    }
    final createdAt = data['createdAt'];
    final rows = data['records'];
    if (createdAt is! String ||
        DateTime.tryParse(createdAt) == null ||
        rows is! List ||
        rows.length > maxBackupRecords) {
      throw const FormatException('백업 날짜나 기록 목록이 올바르지 않아요.');
    }
    final records = <MoneyRecord>[];
    for (final row in rows) {
      if (row is! Map<String, dynamic> ||
          ![
            'id',
            'name',
            'date',
            'mode',
            'type',
            'relation',
            'profileIcon',
            'createdAt',
          ].every((key) => row[key] is String) ||
          row['amount'] is! int ||
          row['isFavorite'] is! int ||
          ![0, 1].contains(row['isFavorite'])) {
        throw const FormatException('백업 기록의 항목이나 값이 올바르지 않아요.');
      }
      records.add(MoneyRecord.fromMap(row));
    }
    validateBackupRecords(records);
    return RecordBackup(
      createdAt: DateTime.parse(createdAt),
      records: List.unmodifiable(records),
    );
  } on FormatException {
    rethrow;
  } catch (_) {
    throw const FormatException('백업 파일을 읽지 못했어요. 올바른 JSON 백업인지 확인해주세요.');
  }
}

class RestorePreview {
  RestorePreview(RecordBackup backup, List<MoneyRecord> current) {
    final byId = {for (final r in current) r.id: r};
    for (final r in backup.records) {
      final existing = byId[r.id];
      if (existing == null) {
        additions.add(r);
      } else if (jsonEncode(existing.toMap()) == jsonEncode(r.toMap())) {
        identical++;
      } else {
        conflicts++;
      }
    }
  }
  final additions = <MoneyRecord>[];
  int identical = 0, conflicts = 0;
}
