import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../domain/record.dart';
import '../state/records.dart';
import 'widgets/profile_picker.dart';
import 'widgets/product_widgets.dart';
import 'design_tokens.dart';
import 'amount_input_page.dart';

Future<void> openEditor(
  BuildContext context, {
  MoneyRecord? record,
  int? amount,
  String mode = 'paid',
  String? type,
  String? date,
  String name = '',
  String relation = '',
}) => showModalBottomSheet<void>(
  context: context,
  isScrollControlled: true,
  useSafeArea: true,
  backgroundColor: Colors.white,
  shape: const RoundedRectangleBorder(
    borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
  ),
  builder: (sheet) => SizedBox(
    height: MediaQuery.sizeOf(sheet).height * .9,
    child: ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      child: RecordEditor(
        record: record,
        initialAmount: amount,
        initialMode: mode,
        initialType: type,
        initialDate: date,
        initialName: name,
        initialRelation: relation,
      ),
    ),
  ),
);

class RecordEditor extends ConsumerStatefulWidget {
  const RecordEditor({
    super.key,
    this.record,
    this.initialAmount,
    this.initialMode = 'paid',
    this.initialType,
    this.initialDate,
    this.initialName = '',
    this.initialRelation = '',
  });
  final MoneyRecord? record;
  final int? initialAmount;
  final String initialMode, initialName, initialRelation;
  final String? initialType, initialDate;
  @override
  ConsumerState<RecordEditor> createState() => _RecordEditorState();
}

class _RecordEditorState extends ConsumerState<RecordEditor> {
  final form = GlobalKey<FormState>();
  late final String recordId = widget.record?.id ?? const Uuid().v4();
  late final String createdAt =
      widget.record?.createdAt ?? DateTime.now().toUtc().toIso8601String();
  late final TextEditingController name, relation;
  late String mode, date, icon;
  String? type;
  int? amount;
  bool busy = false, expanded = true, favorite = false, tried = false;
  String? error;
  @override
  void initState() {
    super.initState();
    final r = widget.record;
    name = TextEditingController(text: r?.name ?? widget.initialName);
    relation = TextEditingController(
      text: r?.relation ?? widget.initialRelation,
    );
    mode = r?.mode ?? widget.initialMode;
    type = r?.type ?? widget.initialType;
    amount = r?.amount ?? widget.initialAmount;
    date = r?.date ?? widget.initialDate ?? today();
    icon = r?.profileIcon ?? profileIcons.first;
    favorite = r?.isFavorite ?? false;
    expanded = r == null || r.relation.isNotEmpty || r.date.isNotEmpty;
  }

  @override
  void dispose() {
    name.dispose();
    relation.dispose();
    super.dispose();
  }

  Future<void> toggleFavorite() async {
    if (busy) return;
    final previous = favorite;
    setState(() => favorite = !favorite);
    if (widget.record == null) return;
    setState(() => busy = true);
    try {
      await ref.read(recordsProvider.notifier).save([
        widget.record!.copyWith(isFavorite: favorite),
      ]);
    } catch (_) {
      if (mounted) {
        setState(() {
          favorite = previous;
          error = '중요 표시 변경에 실패했어요.';
        });
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> save() async {
    if (busy) return;
    setState(() {
      tried = true;
      error = null;
    });
    final valid = form.currentState!.validate();
    if (!valid || type == null || amount == null) {
      setState(() => error = '이름, 상황, 금액을 확인해주세요.');
      return;
    }
    setState(() => busy = true);
    try {
      await ref.read(recordsProvider.notifier).save([
        MoneyRecord(
          id: recordId,
          name: name.text.trim(),
          amount: amount!,
          date: date,
          mode: mode,
          type: type!,
          relation: relation.text.trim(),
          profileIcon: icon,
          isFavorite: favorite,
          createdAt: createdAt,
        ),
      ]);
      if (mounted) {
        Navigator.pop(context);
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          busy = false;
          error = '저장하지 못했어요. 입력을 유지했으니 다시 시도해주세요.';
        });
      }
    }
  }

  Future<void> remove() async {
    final yes = await showDialog<bool>(
      context: context,
      builder: (dialog) => AlertDialog(
        title: const Text('이 기록을 삭제할까요?'),
        content: const Text('삭제한 기록은 되돌릴 수 없어요.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialog, false),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialog, true),
            child: const Text('삭제'),
          ),
        ],
      ),
    );
    if (yes != true || !mounted) return;
    setState(() => busy = true);
    try {
      await ref.read(recordsProvider.notifier).remove(widget.record!.id);
      if (mounted) Navigator.pop(context);
    } catch (_) {
      if (mounted) {
        setState(() {
          busy = false;
          error = '삭제하지 못했어요. 다시 시도해주세요.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) => PopScope(
    canPop: !busy,
    child: Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(
          widget.record == null
              ? '${mode == 'paid' ? '보낸' : '받은'} 마음 추가하기'
              : '${widget.record!.name} 정보 수정',
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            key: const Key('editor-favorite'),
            tooltip: '중요 표시',
            onPressed: busy ? null : toggleFavorite,
            icon: Icon(
              favorite ? Icons.star_rounded : Icons.star_outline_rounded,
              color: favorite ? AppColors.primary : const Color(0xffb0b8c1),
            ),
          ),
          IconButton(
            tooltip: '닫기',
            onPressed: busy ? null : () => Navigator.pop(context),
            icon: const Icon(Icons.close),
          ),
        ],
      ),
      bottomNavigationBar: BottomAction(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(error!, style: const TextStyle(color: Colors.red)),
              ),
            Row(
              children: [
                if (widget.record != null) ...[
                  Expanded(
                    child: TextButton(
                      onPressed: busy ? null : remove,
                      child: const Text('삭제'),
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  flex: 2,
                  child: FilledButton(
                    key: const Key('save-record'),
                    onPressed: busy ? null : save,
                    child: Text(busy ? '저장 중…' : '기록 저장'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      body: AbsorbPointer(
        absorbing: busy,
        child: Form(
          key: form,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
            children: [
              Center(
                child: Semantics(
                  label: '프로필 아이콘 변경',
                  button: true,
                  child: InkWell(
                    key: const Key('profile-picker'),
                    customBorder: const CircleBorder(),
                    onTap: () async {
                      final selected = await pickProfile(context, icon);
                      if (selected != null && mounted) {
                        setState(() => icon = selected);
                      }
                    },
                    child: SizedBox(
                      width: 112,
                      height: 112,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          ProfileAvatar(icon, size: 80, muted: type == '조의금'),
                          Positioned(
                            right: 0,
                            bottom: 4,
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: const BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.edit_rounded,
                                color: AppColors.primary,
                                size: 20,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                key: const Key('record-name'),
                controller: name,
                maxLength: 50,
                decoration: const InputDecoration(
                  labelText: '이름',
                  hintText: '누구에게?',
                ),
                validator: (v) =>
                    v == null || v.trim().isEmpty ? '이름을 입력해주세요.' : null,
              ),
              const SizedBox(height: 20),
              const Text(
                '어떤 상황인가요?',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: orderedCategories
                    .map(
                      (v) => Pill(
                        v,
                        selected: type == v,
                        color: categoryColor(v),
                        onTap: () => setState(() => type = v),
                      ),
                    )
                    .toList(),
              ),
              if (tried && type == null)
                const Text(
                  '어떤 상황인지 선택해주세요.',
                  style: TextStyle(color: Colors.red),
                ),
              const SizedBox(height: 16),
              ListTile(
                key: const Key('open-amount'),
                contentPadding: EdgeInsets.zero,
                title: const Text('금액'),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      amount == null ? '입력하기' : won(amount!),
                      style: const TextStyle(color: AppColors.secondaryText),
                    ),
                    const Icon(
                      Icons.chevron_right,
                      color: AppColors.secondaryText,
                    ),
                  ],
                ),
                onTap: () async {
                  final value = await Navigator.of(context).push<int>(
                    MaterialPageRoute(
                      builder: (_) => AmountInputPage(
                        value: amount?.toString() ?? '',
                        mode: mode,
                        type: type ?? '',
                        records: ref.read(recordsProvider).asData?.value ?? [],
                      ),
                    ),
                  );
                  if (value != null && mounted) setState(() => amount = value);
                },
              ),
              if (tried && amount == null)
                const Text('금액을 입력해주세요.', style: TextStyle(color: Colors.red)),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text(
                  '관계와 날짜 (선택)',
                  style: TextStyle(color: AppColors.secondaryText),
                ),
                trailing: Icon(
                  expanded ? Icons.expand_more : Icons.chevron_right,
                ),
                onTap: () => setState(() => expanded = !expanded),
              ),
              if (expanded) ...[
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: relations
                      .map(
                        (v) => Pill(
                          v,
                          selected: relation.text == v,
                          onTap: () => setState(() => relation.text = v),
                        ),
                      )
                      .toList(),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: relation,
                  maxLength: 50,
                  decoration: const InputDecoration(
                    labelText: '관계 직접 입력',
                    hintText: '친구, 가족, 직장 등',
                  ),
                  onChanged: (_) => setState(() {}),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.calendar_today_outlined, size: 20),
                  title: const Text('날짜'),
                  subtitle: Text(date),
                  onTap: () async {
                    final now = DateTime.parse(today());
                    final first = DateTime(now.year - 10, now.month, now.day),
                        last = DateTime(now.year + 10, now.month, now.day);
                    final value = await showDatePicker(
                      context: context,
                      initialDate: DateTime.parse(date).clamp(first, last),
                      firstDate: first,
                      lastDate: last,
                    );
                    if (value != null && mounted) {
                      setState(() => date = dayString(value));
                    }
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    ),
  );
}

extension on DateTime {
  DateTime clamp(DateTime min, DateTime max) => isBefore(min)
      ? min
      : isAfter(max)
      ? max
      : this;
}
