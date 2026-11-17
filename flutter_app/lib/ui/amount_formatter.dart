import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

import '../domain/record.dart';

String amountDigits(String text) => text.replaceAll(RegExp(r'[^0-9]'), '');
String formatAmount(int amount) =>
    NumberFormat.decimalPattern('ko').format(amount);

/// Keep a digit-relative cursor position while inserting grouping separators.
class WonInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (!newValue.composing.isCollapsed) return newValue;
    var text = newValue.text;
    var cursor = newValue.selection.baseOffset.clamp(0, text.length);
    // Backspacing over a grouping comma should delete the preceding digit.
    if (oldValue.selection.isCollapsed &&
        newValue.selection.isCollapsed &&
        oldValue.text.length == text.length + 1 &&
        oldValue.selection.baseOffset > 0 &&
        oldValue.text[oldValue.selection.baseOffset - 1] == ',' &&
        cursor == oldValue.selection.baseOffset - 1 &&
        cursor > 0) {
      text = text.replaceRange(cursor - 1, cursor, '');
      cursor--;
    }
    var before = amountDigits(text.substring(0, cursor)).length;
    var digits = amountDigits(text);
    if (digits.isEmpty) {
      return const TextEditingValue(
        text: '',
        selection: TextSelection.collapsed(offset: 0),
      );
    }
    final trimmed = digits.replaceFirst(RegExp(r'^0+(?=\d)'), '');
    before = (before - (digits.length - trimmed.length)).clamp(
      0,
      trimmed.length,
    );
    digits = trimmed;
    if (digits.length > 9 || int.parse(digits) > maxAmount) {
      final bounded = formatAmount(maxAmount);
      return TextEditingValue(
        text: bounded,
        selection: TextSelection.collapsed(offset: bounded.length),
      );
    }
    final formatted = formatAmount(int.parse(digits));
    var offset = 0, seen = 0;
    while (offset < formatted.length && seen < before) {
      if (formatted[offset] != ',') seen++;
      offset++;
    }
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: offset),
    );
  }
}

String readAmount(int value) {
  if (value == 100000000) return '1억 원';
  final tenThousands = value ~/ 10000, remainder = value % 10000;
  if (tenThousands == 0) return '${formatAmount(value)}원';
  return remainder == 0
      ? '${formatAmount(tenThousands)}만 원'
      : '${formatAmount(tenThousands)}만 ${formatAmount(remainder)}원';
}
