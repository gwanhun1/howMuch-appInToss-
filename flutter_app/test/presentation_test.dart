import 'package:flutter_test/flutter_test.dart';
import 'package:howmuch/domain/record.dart';
import 'package:howmuch/domain/presentation.dart';

MoneyRecord r(
  String id, {
  String name = '민수',
  String relation = '친구',
  String mode = 'paid',
  int amount = 100000,
  String date = '2026-11-17',
  bool favorite = false,
  String createdAt = '',
}) => MoneyRecord(
  id: id,
  name: name,
  relation: relation,
  mode: mode,
  amount: amount,
  date: date,
  isFavorite: favorite,
  createdAt: createdAt,
);
void main() {
  test('NFC 이름 정규화와 관계별 그룹, 양 모드 합계', () {
    final groups = searchPeople([
      r('a', name: '가'),
      r('b', name: '가', mode: 'received', amount: 50000),
      r('c', name: '가', relation: '직장'),
      r('d', name: '다른이름'),
    ], ' 가 ');
    expect(groups.length, 2);
    final friends = groups.firstWhere((g) => g.relation == '친구');
    expect(friends.records.length, 2);
    expect(friends.paid, 100000);
    expect(friends.received, 50000);
    expect(searchPeople([r('x')], ''), isEmpty);
  });
  test('즐겨찾기 우선, 날짜와 작성일 역순', () {
    final records = [
      r('old'),
      r('favorite', favorite: true, date: '2020-01-01'),
      r('new', createdAt: '2026-11-17T01:00:00Z'),
    ]..sort(compareRecords);
    expect(records.map((r) => r.id), ['favorite', 'new', 'old']);
  });
  test('D-day는 서울 날짜 문자열 기준으로 과거/오늘/미래 구분', () {
    expect(dday('2026-11-16', referenceDay: '2026-11-17'), isNull);
    expect(dday('2026-11-17', referenceDay: '2026-11-17'), 'D-Day');
    expect(dday('2026-11-20', referenceDay: '2026-11-17'), 'D-3');
  });
  test('금액 이력은 같은 모드·카테고리의 최근값과 최빈값', () {
    final records = [
      r('1', amount: 50000, date: '2026-11-01'),
      r('2', amount: 50000, date: '2026-11-02'),
      r('3', amount: 100000),
      r('4', amount: 200000, mode: 'received'),
    ];
    expect(amountHistory(records, 'paid', '축의금'), (
      last: 100000,
      frequent: 50000,
    ));
    expect(amountHistory(records, 'paid', '조의금'), isNull);
  });
}
