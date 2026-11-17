import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:howmuch/ui/amount_formatter.dart';

void main() {
  final formatter = WonInputFormatter();
  TextEditingValue input(String text) => TextEditingValue(
    text: text,
    selection: TextSelection.collapsed(offset: text.length),
  );
  test('천 단위 표시와 최대값 제한, 선행 0 제거', () {
    expect(
      formatter.formatEditUpdate(input(''), input('123213')).text,
      '123,213',
    );
    expect(
      formatter.formatEditUpdate(input(''), input('00050000')).text,
      '50,000',
    );
    expect(
      formatter.formatEditUpdate(input(''), input('999999999999')).text,
      '100,000,000',
    );
    expect(formatter.formatEditUpdate(input('5'), input('')).text, '');
  });
  test('쉼표 앞 backspace는 이전 숫자 삭제, 중간 수정 커서 유지', () {
    final value = formatter.formatEditUpdate(
      const TextEditingValue(
        text: '123,456',
        selection: TextSelection.collapsed(offset: 4),
      ),
      const TextEditingValue(
        text: '123456',
        selection: TextSelection.collapsed(offset: 3),
      ),
    );
    expect(value.text, '12,456');
    expect(value.selection.baseOffset, 2);
    final edit = formatter.formatEditUpdate(
      input('12,345'),
      const TextEditingValue(
        text: '192,345',
        selection: TextSelection.collapsed(offset: 2),
      ),
    );
    expect(edit.text, '192,345');
    expect(edit.selection.baseOffset, 2);
  });
}
