export 'random_picker.dart' show showRandomPicker;

import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/record.dart';
import '../domain/presentation.dart';
import '../state/records.dart';
import '../state/tool_sessions.dart';
import 'widgets/product_widgets.dart';
import 'widgets/tool_layout.dart';
import 'design_tokens.dart';

class GuideSelection {
  const GuideSelection(this.amount, this.name, this.type, this.relation);
  final int amount;
  final String name, type, relation;
}

class GuidePage extends ConsumerStatefulWidget {
  const GuidePage({
    super.key,
    this.initialType = '축의금',
    this.selectionMode = false,
  });
  final String initialType;
  final bool selectionMode;
  @override
  ConsumerState<GuidePage> createState() => _GuidePageState();
}

class _GuidePageState extends ConsumerState<GuidePage> {
  late String type = widget.initialType;
  String relation = '친구', closeness = 'regular';
  bool attending = true;
  int? selectedAmount;
  final name = TextEditingController();
  @override
  void dispose() {
    name.dispose();
    super.dispose();
  }

  Widget choices(
    String label,
    Map<String, String> values,
    String selected,
    void Function(String) change, {
    bool stack = false,
  }) => ToolField(
    label: label,
    child: stack
        ? Column(
            children: values.entries
                .map(
                  (e) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: ToolOption(
                      e.value,
                      selected: e.key == selected,
                      expand: true,
                      onTap: () => setState(() {
                        change(e.key);
                        selectedAmount = null;
                      }),
                    ),
                  ),
                )
                .toList(),
          )
        : Wrap(
            spacing: 8,
            runSpacing: 8,
            children: values.entries
                .map(
                  (e) => ToolOption(
                    e.value,
                    selected: e.key == selected,
                    onTap: () => setState(() {
                      change(e.key);
                      selectedAmount = null;
                    }),
                  ),
                )
                .toList(),
          ),
  );
  @override
  Widget build(BuildContext context) {
    final records = ref.watch(recordsProvider).asData?.value ?? <MoneyRecord>[];
    final amounts = guideAmounts(closeness, attending, type),
        amount = selectedAmount ?? amounts.first;
    final history =
        records.where((r) => r.mode == 'paid' && r.type == type).toList()
          ..sort(compareRecent);
    final person =
        records
            .where(
              (r) =>
                  name.text.trim().isNotEmpty &&
                  normalizeName(r.name) == normalizeName(name.text),
            )
            .toList()
          ..sort(compareRecent);
    return ToolScaffold(
      title: '금액 가이드',
      footer: FilledButton(
        key: const Key('apply-guide'),
        onPressed: () => Navigator.pop(
          context,
          GuideSelection(amount, name.text.trim(), type, relation),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Text(
            '${won(amount)} ${widget.selectionMode ? '계산기에 적용' : '기록 입력하기'}',
            textAlign: TextAlign.center,
          ),
        ),
      ),
      children: [
        const ToolIntro('얼마를 전하면 좋을까요?', '상황과 관계를 선택하면 참고할 금액을 알려드려요.'),
        ToolCard(
          children: [
            choices(
              '어떤 경조사인가요?',
              {for (final t in orderedCategories.take(3)) t: t},
              type,
              (v) => type = v,
            ),
            toolGap,
            choices(
              '어떤 관계인가요?',
              {for (final r in relations) r: r},
              relation,
              (v) => relation = v,
            ),
            toolGap,
            choices(
              '얼마나 가까운 사이인가요?',
              {
                'acquaintance': '가끔 연락하는 사이',
                'regular': '꾸준히 연락하는 사이',
                'close': '아주 가까운 사이',
              },
              closeness,
              (v) => closeness = v,
              stack: true,
            ),
            const SizedBox(height: 16),
            choices(
              type == '조의금' ? '조문할 예정인가요?' : '참석할 예정인가요?',
              {'yes': '네, 참석해요', 'no': '참석하지 않아요'},
              attending ? 'yes' : 'no',
              (v) => attending = v == 'yes',
            ),
          ],
        ),
        toolGap,
        ToolCard(
          tint: true,
          children: [
            const Text(
              '이 금액부터 비교해보세요',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            Text(guideExplanation(closeness, attending, type), style: toolText),
            const SizedBox(height: 20),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: amounts
                  .map(
                    (a) => ToolOption(
                      won(a),
                      selected: a == amount,
                      onTap: () => setState(() => selectedAmount = a),
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 16),
            const Text(
              '서비스 자체 참고 기준이에요. 실제 평균이나 정답은 아니며, 기록할 때 금액을 바꿀 수 있어요.',
              style: TextStyle(
                fontSize: 12,
                height: 1.6,
                color: AppColors.secondaryText,
              ),
            ),
          ],
        ),
        toolGap,
        ToolCard(
          children: [
            ToolField(
              label: '이름 (선택)',
              help: '이름을 입력하면 이전에 주고받은 내역도 볼 수 있어요.',
              child: ToolTextInput(
                key: const Key('guide-name'),
                controller: name,
                hint: '누구에게 전할 마음인가요?',
                onChanged: (_) => setState(() {}),
              ),
            ),
            if (person.isNotEmpty) ...[
              toolGap,
              const Text(
                '같은 이름으로 남긴 기록',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              const Text('동명이인일 수 있으니 관계와 날짜를 확인해주세요.', style: toolText),
              ...person
                  .take(5)
                  .map(
                    (r) => DetailLine(
                      title:
                          '${r.date} · ${r.relation.isEmpty ? '관계 없음' : r.relation}',
                      subtitle: r.type,
                      value:
                          '${r.mode == 'paid' ? '보낸' : '받은'} 마음 ${won(r.amount)}',
                    ),
                  ),
            ],
          ],
        ),
        if (history.isNotEmpty) ...[
          toolGap,
          ToolCard(
            children: [
              Text(
                '최근 보낸 $type',
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              ...history
                  .take(3)
                  .map(
                    (r) => DetailLine(
                      title: r.name,
                      subtitle: r.date,
                      value: '${won(r.amount)} 선택',
                      onTap: () => setState(() => selectedAmount = r.amount),
                    ),
                  ),
            ],
          ),
        ],
        toolGap,
        const Text(
          '선택한 금액은 바로 저장되지 않아요. 입력창에서 이름과 날짜를 확인한 뒤 저장해주세요.',
          style: toolText,
        ),
      ],
    );
  }
}

class BudgetPage extends ConsumerStatefulWidget {
  const BudgetPage({super.key});
  @override
  ConsumerState<BudgetPage> createState() => _BudgetPageState();
}

class _BudgetPageState extends ConsumerState<BudgetPage> {
  @override
  Widget build(BuildContext context) {
    final session = ref.watch(budgetSessionProvider), rows = session.rows;
    final summary = BudgetSummary(
      rows.map((r) => r.amount.text).toList(),
      session.budget.text,
    );
    final counts = <String, int>{};
    for (final r in rows) {
      counts[r.type] = (counts[r.type] ?? 0) + 1;
    }
    final invalid = rows
        .where((r) => parseAmount(r.amount.text) == null)
        .length;
    return ToolScaffold(
      title: '예정 비용',
      children: [
        const ToolIntro(
          '이번 달, 얼마 준비할까요?',
          '예정된 경조사 비용을 모아 예산과 비교해보세요. 실제 기록에는 포함되지 않아요.',
        ),
        ToolCard(
          children: [
            ToolDate(
              label: '계획할 달',
              value: session.month,
              onTap: () async {
                final d = await showDatePicker(
                  context: context,
                  initialDate: DateTime.parse('${session.month}-01'),
                  firstDate: DateTime(1900),
                  lastDate: DateTime(2200),
                );
                if (d != null && mounted) {
                  setState(() => session.month = dayString(d).substring(0, 7));
                }
              },
            ),
            fieldGap,
            ToolField(
              label: '준비한 예산 (선택)',
              child: ToolTextInput(
                key: const Key('budget-limit'),
                controller: session.budget,
                money: true,
                maxLength: 9,
                hint: '예산을 입력해주세요',
                error: session.budget.text.isNotEmpty && summary.limit == null
                    ? '1원부터 1억 원까지 입력해주세요.'
                    : null,
                onChanged: (_) => setState(() {}),
              ),
            ),
          ],
        ),
        toolGap,
        ToolCard(
          tint: true,
          children: [
            Text('${session.month} · 예정 ${rows.length}건', style: toolText),
            const SizedBox(height: 10),
            Text(
              won(summary.total),
              key: const Key('budget-total'),
              style: const TextStyle(
                fontSize: 28,
                height: 1.3,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
            if (counts.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(
                counts.entries.map((e) => '${e.key} ${e.value}건').join(' · '),
                style: toolText,
              ),
            ],
            if (summary.remaining != null) ...[
              const SizedBox(height: 16),
              Text(
                summary.remaining! < 0
                    ? '예산보다 ${won(-summary.remaining!)} 더 필요해요.'
                    : '예산에서 ${won(summary.remaining!)} 남아요.',
                style: TextStyle(
                  fontSize: 14,
                  height: 1.5,
                  color: summary.remaining! < 0
                      ? const Color(0xffd14343)
                      : AppColors.primary,
                ),
              ),
            ],
            if (invalid > 0) ...[
              const SizedBox(height: 12),
              Text(
                '미입력 또는 확인이 필요한 $invalid건은 합계에서 제외했어요.',
                style: const TextStyle(
                  fontSize: 12,
                  height: 1.5,
                  color: AppColors.secondaryText,
                ),
              ),
            ],
          ],
        ),
        toolGap,
        const Text(
          '예정된 경조사',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 12),
        ...rows.asMap().entries.map((entry) {
          final row = entry.value;
          return Padding(
            key: ObjectKey(row),
            padding: const EdgeInsets.only(bottom: 16),
            child: ToolCard(
              children: [
                ToolHeading(
                  '예정 경조사 ${entry.key + 1}',
                  action: TextButton(
                    onPressed: () => setState(() {
                      rows.remove(row);
                      row.dispose();
                    }),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.secondaryText,
                    ),
                    child: const Text('삭제'),
                  ),
                ),
                ToolField(
                  label: '이름·행사 (선택)',
                  child: ToolTextInput(controller: row.name, hint: '예: 친구 결혼식'),
                ),
                fieldGap,
                ToolField(
                  label: '종류',
                  child: DropdownButtonFormField<String>(
                    initialValue: row.type,
                    isExpanded: true,
                    decoration: toolInput(),
                    items: orderedCategories
                        .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                        .toList(),
                    onChanged: (v) => setState(() => row.type = v!),
                  ),
                ),
                fieldGap,
                ToolField(
                  label: '예정 금액',
                  child: ToolTextInput(
                    key: ValueKey('plan-amount-${entry.key}'),
                    controller: row.amount,
                    money: true,
                    maxLength: 9,
                    hint: '금액을 입력해주세요',
                    error:
                        row.amount.text.isNotEmpty &&
                            parseAmount(row.amount.text) == null
                        ? '1원부터 1억 원까지 입력해주세요.'
                        : null,
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [50000, 100000, 150000]
                      .map(
                        (a) => ToolOption(
                          '${a ~/ 10000}만 원',
                          selected: row.amount.text == '$a',
                          onTap: () => setState(() => row.amount.text = '$a'),
                        ),
                      )
                      .toList(),
                ),
                if (row.type != '용돈') ...[
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton.icon(
                      onPressed: () async {
                        final result = await Navigator.push<GuideSelection>(
                          context,
                          MaterialPageRoute(
                            builder: (_) => GuidePage(
                              initialType: row.type,
                              selectionMode: true,
                            ),
                          ),
                        );
                        if (result != null && mounted) {
                          setState(() {
                            row.amount.text = '${result.amount}';
                            if (result.name.isNotEmpty) {
                              row.name.text = result.name;
                            }
                          });
                        }
                      },
                      icon: const Icon(Icons.lightbulb_outline, size: 18),
                      label: const Text('금액 가이드 보기'),
                    ),
                  ),
                ],
              ],
            ),
          );
        }),
        OutlinedButton.icon(
          onPressed: rows.length >= 50
              ? null
              : () => setState(() => rows.add(PlanDraft())),
          icon: const Icon(Icons.add, size: 20),
          label: const Text('예정 경조사 추가하기'),
        ),
        const SizedBox(height: 16),
        const Text(
          '최대 50건까지 계산할 수 있어요. 입력 내용은 화면을 다녀와도 유지되지만 앱을 종료하면 사라져요.',
          style: toolText,
        ),
      ],
    );
  }
}
