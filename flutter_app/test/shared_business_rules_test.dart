import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:howmuch/domain/record.dart';

void main() {
  final examples = jsonDecode(
    File('../shared/business-rules.json').readAsStringSync(),
  ) as Map<String, dynamic>;
  test('React와 같은 입력/기댓값으로 금액 검증', () {
    for (final row in examples['amounts'] as List<dynamic>) {
      final example = row as Map<String, dynamic>;
      expect(parseAmount(example['input'] as String), example['expected']);
    }
  });
  test('React와 같은 입력/기댓값으로 금액 가이드 검증', () {
    for (final row in examples['guides'] as List<dynamic>) {
      final e = row as Map<String, dynamic>;
      expect(
        guideAmounts(
          e['closeness'] as String,
          e['attending'] as bool,
          e['type'] as String,
        ),
        e['expected'],
      );
    }
  });
}
