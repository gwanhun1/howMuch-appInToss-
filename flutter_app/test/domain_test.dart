import 'package:flutter_test/flutter_test.dart';
import 'package:howmuch/domain/record.dart';
import 'package:howmuch/domain/wedding_csv.dart';

void main() {
  test('금액은 정수 1원~1억 원, 빈 값과 소수는 거절', () {
    expect(parseAmount('1'), 1);
    expect(parseAmount('100000000'), 100000000);
    for (final invalid in ['', '0', '-1', '1.5', '1e5', '100000001', ' 10']) {
      expect(parseAmount(invalid), isNull, reason: invalid);
    }
  });
  test('실재하는 날짜만 허용', () {
    expect(validDate('2024-02-29'), isTrue);
    expect(validDate('2025-02-29'), isFalse);
    expect(validDate('2026-13-01'), isFalse);
  });
  test('낸 마음과 받은 마음 합계를 분리', () {
    final records = [
      MoneyRecord(id: '1', name: 'A', amount: 50000, date: '2026-01-01'),
      MoneyRecord(
        id: '2',
        name: 'A',
        amount: 100000,
        date: '2026-01-01',
        mode: 'received',
      ),
    ];
    expect(totalFor(records, 'paid'), 50000);
    expect(totalFor(records, 'received'), 100000);
  });
  test('가이드의 참석 예외와 조의금 규칙을 보존', () {
    expect(guideAmounts('regular', false, '축의금'), [50000, 100000, 150000]);
    expect(guideAmounts('regular', false, '조의금'), [100000, 150000]);
    expect(guideAmounts('close', true, '축의금'), [100000, 200000, 300000]);
  });
  test('미입력 예산 행은 남은 예산 계산에서 유효한 0원이 아님', () {
    expect(BudgetSummary(['50000', ''], '100000').remaining, isNull);
    expect(BudgetSummary(['50000', '100000'], '100000').remaining, -50000);
  });
  test('CSV의 BOM, CRLF, 인용부호, 쉼표를 파싱', () {
    var id = 0;
    final result = parseWeddingCsv(
      '\uFEFF이름,금액,관계,날짜\r\n"김,민수","100,000","친구 ""대학""",2026-11-17\r\n',
      '2026-11-17',
      () => '${id++}',
    );
    expect(result.single.name, '김,민수');
    expect(result.single.amount, 100000);
    expect(result.single.relation, '친구 "대학"');
    expect(
      parseWeddingCsv(
        exportWeddingCsv(result),
        '2026-11-17',
        () => 'new',
      ).single.name,
      '김,민수',
    );
  });
  test('잘못된 CSV는 저장 대상으로 반환하지 않음', () {
    for (final text in [
      '이름,금액\n민수,0',
      '이름,금액\n"민수,100',
      '이름,금액,관계,날짜\n민수,100,,2026-01-01',
      '이름,금액\n${List.filled(26, '민수,100').join('\n')}',
    ]) {
      expect(
        () => parseWeddingCsv(text, '2026-11-17', () => 'id'),
        throwsFormatException,
      );
    }
  });
  test('CSV 수식 시작 문자를 무해화', () {
    expect(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
    expect(csvCell('일반 이름'), '"일반 이름"');
  });
  test('장부 중복은 날짜·이름·금액·관계 기준', () {
    const r = MoneyRecord(
      id: 'a',
      name: '민수',
      amount: 100000,
      date: '2026-11-17',
      mode: 'received',
    );
    expect(hasWeddingDuplicates([r], [r]), isTrue);
    expect(hasWeddingDuplicates([r, r], []), isTrue);
    expect(hasWeddingDuplicates([r], []), isFalse);
  });
}
