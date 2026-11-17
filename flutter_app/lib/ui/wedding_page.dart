import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart' show Uint8List;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'package:uuid/uuid.dart';

import '../domain/record.dart';
import '../domain/wedding_csv.dart';
import '../state/records.dart';
import '../state/tool_sessions.dart';
import 'widgets/product_widgets.dart';
import 'widgets/tool_layout.dart';
import 'design_tokens.dart';
import 'record_editor.dart';

class WeddingPage extends ConsumerStatefulWidget {
  const WeddingPage({super.key});
  @override
  ConsumerState<WeddingPage> createState() => _WeddingPageState();
}

class _WeddingPageState extends ConsumerState<WeddingPage> {
  bool busy = false, allowDuplicates = false;
  String? message;
  WeddingSession get session => ref.read(weddingSessionProvider);
  String get date => session.date;
  void changed() => setState(() {
    message = null;
    allowDuplicates = false;
  });
  void parse(String text) {
    if (busy) return;
    try {
      final parsed = parseWeddingCsv(text, date, () => const Uuid().v4());
      final blank = session.guests.length == 1 && session.guests.first.empty;
      if ((blank ? 0 : session.guests.length) + parsed.length > 25) {
        throw const FormatException('현재 입력과 CSV를 합쳐 최대 25명까지 불러올 수 있어요.');
      }
      setState(() {
        if (blank) {
          session.guests.removeAt(0).dispose();
        }
        session.guests.addAll(
          parsed.map(
            (r) => GuestDraft(
              name: r.name,
              amount: '${r.amount}',
              relation: r.relation,
            ),
          ),
        );
        session.csv.clear();
        allowDuplicates = false;
        message = '${parsed.length}명을 입력 목록에 불러왔어요. 아직 저장되지 않았어요.';
      });
    } on FormatException catch (e) {
      setState(() => message = e.message);
    }
  }

  Future<void> pick() async {
    if (busy) return;
    setState(() => busy = true);
    try {
      final file = await FilePicker.pickFile(
        type: FileType.custom,
        allowedExtensions: ['csv'],
      );
      if (file == null || !mounted) return;
      final length = await file.length();
      if (length != null && length > 100000) {
        throw const FormatException('CSV는 100KB 이하만 지원해요.');
      }
      final text = utf8.decode(await file.readAsBytes());
      if (!mounted) return;
      setState(() => busy = false);
      parse(text);
    } catch (e) {
      if (mounted) {
        setState(
          () => message = e is FormatException
              ? e.message
              : '파일을 읽지 못했어요. UTF-8 CSV를 선택해주세요.',
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  List<MoneyRecord> prepare() {
    if (session.guests.isEmpty || session.guests.length > 25) {
      throw const FormatException('한 번에 1~25명까지 저장할 수 있어요.');
    }
    return session.guests.map((g) => g.record(date)).toList();
  }

  Future<void> save() async {
    if (busy) return;
    try {
      final records = prepare();
      if (hasWeddingDuplicates(
            records,
            ref.read(recordsProvider).asData?.value ?? [],
          ) &&
          !allowDuplicates) {
        setState(() => message = '중복 의심 내역을 확인해주세요.');
        return;
      }
      setState(() => busy = true);
      await ref.read(recordsProvider.notifier).save(records);
      if (mounted) {
        setState(() {
          for (final g in session.guests) {
            g.dispose();
          }
          session.guests
            ..clear()
            ..add(GuestDraft());
          session.csv.clear();
          allowDuplicates = false;
          message = '${records.length}명의 축의금을 저장했어요.';
        });
      }
    } on FormatException catch (e) {
      if (mounted) setState(() => message = e.message);
    } catch (_) {
      if (mounted) setState(() => message = '저장하지 못했어요. 입력은 유지되니 다시 시도해주세요.');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> export(List<MoneyRecord> records) async {
    final box = context.findRenderObject() as RenderBox?;
    final origin = box == null
        ? const Rect.fromLTWH(0, 0, 100, 100)
        : box.localToGlobal(Offset.zero) & box.size;
    setState(() => busy = true);
    try {
      await SharePlus.instance.share(
        ShareParams(
          files: [
            XFile.fromData(
              Uint8List.fromList(utf8.encode(exportWeddingCsv(records))),
              mimeType: 'text/csv',
            ),
          ],
          fileNameOverrides: ['축의금장부-$date.csv'],
          sharePositionOrigin: origin,
        ),
      );
    } catch (_) {
      if (mounted) setState(() => message = '공유하지 못했어요. 다시 시도해주세요.');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(recordsProvider),
        session = ref.watch(weddingSessionProvider);
    final records = state.asData?.value ?? <MoneyRecord>[];
    final ledger =
        records
            .where(
              (r) => r.mode == 'received' && r.type == '축의금' && r.date == date,
            )
            .toList()
          ..sort((a, b) => a.name.compareTo(b.name));
    List<MoneyRecord> prepared = [];
    String? validation;
    try {
      prepared = prepare();
    } on FormatException catch (e) {
      validation = e.message;
    }
    final duplicates = hasWeddingDuplicates(prepared, records),
        total = prepared.fold(0, (s, r) => s + r.amount);
    return PopScope(
      canPop: !busy,
      child: AbsorbPointer(
        absorbing: busy,
        child: ToolScaffold(
          title: '축의금 장부',
          footer: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Text(
                  validation != null
                      ? '하객 이름과 받은 금액을 입력해주세요'
                      : '${session.guests.length}명 · 합계 ${won(total)}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 13,
                    height: 1.4,
                    color: AppColors.secondaryText,
                  ),
                ),
              ),
              FilledButton(
                key: const Key('save-guests'),
                onPressed:
                    busy ||
                        !state.hasValue ||
                        validation != null ||
                        (duplicates && !allowDuplicates)
                    ? null
                    : save,
                child: Text(busy ? '저장 중…' : '${session.guests.length}명 저장하기'),
              ),
            ],
          ),
          children: [
            const ToolIntro(
              '받은 축의금을 정리해요',
              '하객을 입력하고 확인한 뒤 함께 저장하세요. 받은 마음에도 같은 기록이 반영돼요.',
            ),
            ToolCard(
              children: [
                ToolDate(
                  label: '결혼식 날짜',
                  value: date,
                  onTap: () async {
                    final value = await showDatePicker(
                      context: context,
                      initialDate: DateTime.parse(date),
                      firstDate: DateTime(1900),
                      lastDate: DateTime(2200),
                    );
                    if (value != null && mounted) {
                      setState(() {
                        session.date = dayString(value);
                        allowDuplicates = false;
                        message = null;
                      });
                    }
                  },
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Divider(height: 1),
                ),
                Text('저장된 축의금 · ${ledger.length}명', style: toolText),
                const SizedBox(height: 8),
                Text(
                  won(totalFor(ledger, 'received')),
                  style: const TextStyle(
                    fontSize: 28,
                    height: 1.3,
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: busy || ledger.isEmpty
                      ? null
                      : () => export(ledger),
                  icon: const Icon(Icons.ios_share, size: 18),
                  label: const Text('CSV 내보내기'),
                ),
                if (ledger.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  ExpansionTile(
                    tilePadding: EdgeInsets.zero,
                    childrenPadding: const EdgeInsets.only(top: 8),
                    title: const Text(
                      '저장된 내역 보기',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    children: ledger
                        .map(
                          (r) => DetailLine(
                            title: r.name,
                            subtitle: r.relation,
                            value: won(r.amount),
                            onTap: () => openEditor(context, record: r),
                          ),
                        )
                        .toList(),
                  ),
                ],
              ],
            ),
            toolGap,
            const Text(
              '입력할 하객',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            const Text(
              '아직 저장되지 않은 입력 목록이에요. 최대 25명까지 한 번에 저장할 수 있어요.',
              style: toolText,
            ),
            const SizedBox(height: 16),
            ...session.guests.asMap().entries.map((entry) {
              final g = entry.value;
              return Padding(
                key: ObjectKey(g),
                padding: const EdgeInsets.only(bottom: 16),
                child: ToolCard(
                  children: [
                    ToolHeading(
                      '${entry.key + 1}번째 하객',
                      action: TextButton(
                        onPressed: () {
                          setState(() {
                            session.guests.remove(g);
                            allowDuplicates = false;
                            message = null;
                          });
                          g.dispose();
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.secondaryText,
                        ),
                        child: const Text('삭제'),
                      ),
                    ),
                    ToolField(
                      label: '이름',
                      child: ToolTextInput(
                        key: ValueKey('guest-name-${entry.key}'),
                        controller: g.name,
                        hint: '하객 이름',
                        onChanged: (_) => changed(),
                      ),
                    ),
                    fieldGap,
                    ToolField(
                      label: '받은 금액',
                      child: ToolTextInput(
                        key: ValueKey('guest-amount-${entry.key}'),
                        controller: g.amount,
                        money: true,
                        maxLength: 9,
                        hint: '금액을 입력해주세요',
                        error:
                            g.amount.text.isNotEmpty &&
                                parseAmount(g.amount.text) == null
                            ? '1원부터 1억 원까지 입력해주세요.'
                            : null,
                        onChanged: (_) => changed(),
                      ),
                    ),
                    fieldGap,
                    ToolField(
                      label: '관계·구분 (선택)',
                      child: ToolTextInput(
                        controller: g.relation,
                        hint: '예: 신랑측 친구',
                        onChanged: (_) => changed(),
                      ),
                    ),
                  ],
                ),
              );
            }),
            OutlinedButton.icon(
              onPressed: session.guests.length >= 25
                  ? null
                  : () => setState(() {
                      session.guests.add(GuestDraft());
                      allowDuplicates = false;
                    }),
              icon: const Icon(Icons.add, size: 20),
              label: const Text('하객 추가하기'),
            ),
            toolGap,
            ToolCard(
              children: [
                ExpansionTile(
                  tilePadding: EdgeInsets.zero,
                  childrenPadding: const EdgeInsets.only(top: 16),
                  title: const Text(
                    'CSV로 여러 명 불러오기',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  children: [
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'UTF-8 CSV · 최대 25명 / 100KB\n첫 줄: 이름,금액 또는 이름,금액,관계,날짜\n날짜가 있다면 선택한 결혼식 날짜와 같아야 해요.',
                        style: toolText,
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: pick,
                        icon: const Icon(Icons.upload_file, size: 18),
                        label: const Text('CSV 파일 선택'),
                      ),
                    ),
                    fieldGap,
                    ToolField(
                      label: 'CSV 내용 붙여넣기',
                      child: ToolTextInput(
                        key: const Key('csv-input'),
                        controller: session.csv,
                        maxLength: 100000,
                        minLines: 4,
                        maxLines: 8,
                        hint: '이름,금액,관계\n김민수,100000,친구',
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () => parse(session.csv.text),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(vertical: 4),
                          child: Text(
                            'CSV 내용을 입력 목록에 추가하기',
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            if (duplicates) ...[
              const SizedBox(height: 16),
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: allowDuplicates,
                title: const Text(
                  '중복 의심 내역을 확인했으며 각각의 기록으로 저장할게요.',
                  style: TextStyle(fontSize: 14, height: 1.5),
                ),
                onChanged: (v) => setState(() => allowDuplicates = v ?? false),
              ),
            ],
            if (message != null) ...[
              const SizedBox(height: 16),
              Text(message!, style: toolText),
            ],
            if (!state.hasValue) ...[
              const SizedBox(height: 16),
              const Text('기록을 불러온 뒤 저장할 수 있어요.', style: toolText),
            ],
            const SizedBox(height: 20),
            const Text(
              '입력 내용은 앱을 종료하면 사라져요. CSV에는 이름·금액·관계·날짜가 포함되므로 공유 전 확인해주세요.',
              style: TextStyle(
                fontSize: 12,
                height: 1.6,
                color: AppColors.secondaryText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
