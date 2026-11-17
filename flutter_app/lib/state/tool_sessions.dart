import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';
import 'package:uuid/uuid.dart';

import '../domain/record.dart';

class PlanDraft {
  final name = TextEditingController();
  final amount = TextEditingController();
  String type = '축의금';
  void dispose() {
    name.dispose();
    amount.dispose();
  }
}

class BudgetSession {
  String month = today().substring(0, 7);
  final budget = TextEditingController();
  final rows = [PlanDraft()];
  void dispose() {
    budget.dispose();
    for (final r in rows) {
      r.dispose();
    }
  }
}

class GuestDraft {
  GuestDraft({String name = '', String amount = '', String relation = ''})
    : name = TextEditingController(text: name),
      amount = TextEditingController(text: amount),
      relation = TextEditingController(text: relation);
  final id = const Uuid().v4();
  final TextEditingController name, amount, relation;
  bool get empty =>
      name.text.isEmpty && amount.text.isEmpty && relation.text.isEmpty;
  MoneyRecord record(String date) {
    final value = parseAmount(amount.text);
    if (value == null) throw const FormatException('금액은 1원부터 1억 원까지 입력해주세요.');
    final r = MoneyRecord(
      id: id,
      name: name.text.trim(),
      amount: value,
      relation: relation.text.trim(),
      date: date,
      mode: 'received',
      createdAt: DateTime.now().toUtc().toIso8601String(),
    );
    r.validate();
    return r;
  }

  void dispose() {
    name.dispose();
    amount.dispose();
    relation.dispose();
  }
}

class WeddingSession {
  String date = today();
  final guests = [GuestDraft()];
  final csv = TextEditingController();
  void dispose() {
    csv.dispose();
    for (final g in guests) {
      g.dispose();
    }
  }
}

final budgetSessionProvider = Provider((ref) {
  final s = BudgetSession();
  ref.onDispose(s.dispose);
  return s;
});
final weddingSessionProvider = Provider((ref) {
  final s = WeddingSession();
  ref.onDispose(s.dispose);
  return s;
});
