import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:material_ui/material_ui.dart';

import '../data/backup_files.dart';
import '../domain/record.dart';
import '../domain/record_backup.dart';
import '../state/records.dart';
import 'widgets/tool_layout.dart';

class BackupPage extends ConsumerStatefulWidget {
  const BackupPage({super.key});
  @override
  ConsumerState<BackupPage> createState() => _BackupPageState();
}

class _BackupPageState extends ConsumerState<BackupPage> {
  bool busy = false;
  RecordBackup? backup;
  RestorePreview? preview;
  String? message;

  Future<void> run(Future<void> Function() action) async {
    if (busy) return;
    setState(() {
      busy = true;
      message = null;
    });
    try {
      await action();
    } on FormatException catch (error) {
      if (mounted) setState(() => message = error.message);
    } catch (_) {
      if (mounted) {
        setState(() => message = '처리하지 못했어요. 저장 공간과 파일 접근 권한을 확인하고 다시 시도해주세요.');
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> export() => run(() async {
    final box = context.findRenderObject() as RenderBox?;
    final origin = box == null
        ? const Rect.fromLTWH(0, 0, 100, 100)
        : box.localToGlobal(Offset.zero) & box.size;
    final records = await ref.read(repositoryProvider).readAll();
    final now = DateTime.now();
    final bytes = encodeBackup(records, now: now);
    if (!mounted) return;
    final shared = await ref
        .read(backupFilesProvider)
        .share(
          bytes,
          'howmuch-backup-${DateFormat('yyyyMMdd-HHmmss').format(now)}.json',
          origin,
        );
    if (mounted) {
      setState(
        () => message = shared
            ? '공유 창을 닫았어요. 선택한 위치에 백업 파일이 저장됐는지 확인해주세요.'
            : '백업 파일 공유를 취소했어요.',
      );
    }
  });

  Future<void> pick() => run(() async {
    setState(() {
      backup = null;
      preview = null;
    });
    final bytes = await ref.read(backupFilesProvider).pick();
    if (bytes == null || !mounted) return;
    final parsed = decodeBackup(bytes);
    final current = await ref.read(repositoryProvider).readAll();
    if (!mounted) return;
    setState(() {
      backup = parsed;
      preview = RestorePreview(parsed, current);
    });
  });

  Future<void> restore() => run(() async {
    final selected = backup;
    if (selected == null) return;
    final count = await ref
        .read(recordsProvider.notifier)
        .restore(selected.records);
    if (!mounted) return;
    setState(() {
      backup = null;
      preview = null;
      message = '$count건을 복원했어요. 기존 기록은 그대로 유지했어요.';
    });
  });

  @override
  Widget build(BuildContext context) {
    final selected = backup, plan = preview;
    return PopScope(
      canPop: !busy,
      child: ToolScaffold(
        title: '기록 백업·복원',
        children: [
          const ToolIntro(
            '소중한 기록을 따로 보관하세요',
            '보낸 마음과 받은 마음의 모든 기록을 파일로 보관하고, 다른 기기의 이 독립 앱에서도 복원할 수 있어요.',
          ),
          const ToolCard(
            children: [
              Text('파일 보관 안내', style: TextStyle(fontWeight: FontWeight.w700)),
              SizedBox(height: 12),
              Text(
                '백업에는 이름·관계·금액·날짜·프로필·중요 표시가 들어 있어요. 암호화되지 않은 파일이니 안전한 위치에 보관해주세요. 앱인토스 기록과 연동하지 않아요.',
                style: toolText,
              ),
              SizedBox(height: 12),
              Text(
                '화면 보기 설정과 저장하지 않은 예정 비용·장부 입력은 포함되지 않아요. 최대 10,000건·10MB를 지원해요.',
                style: toolText,
              ),
            ],
          ),
          toolGap,
          ToolCard(
            children: [
              const ToolHeading('전체 기록 백업'),
              const Text(
                '공유 창에서 ‘파일에 저장’ 등 보관할 위치를 선택해주세요. 파일을 지우지 않는 한 앱을 삭제해도 백업 파일은 따로 보관할 수 있어요.',
                style: toolText,
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                key: const Key('export-backup'),
                onPressed: busy ? null : export,
                icon: const Icon(Icons.ios_share),
                label: const Text('백업 파일 만들기'),
              ),
            ],
          ),
          toolGap,
          ToolCard(
            children: [
              const ToolHeading('백업에서 복원'),
              const Text(
                '이 독립 앱에서 만든 JSON 파일을 선택해주세요. 파일을 선택하면 복원할 내용을 먼저 확인할 수 있어요.',
                style: toolText,
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                key: const Key('pick-backup'),
                onPressed: busy ? null : pick,
                icon: const Icon(Icons.file_open_outlined),
                label: const Text('백업 파일 선택'),
              ),
            ],
          ),
          if (selected != null && plan != null) ...[
            toolGap,
            ToolCard(
              tint: true,
              children: [
                const ToolHeading('복원 전 확인'),
                Text(
                  '백업 생성: ${DateFormat('yyyy-MM-dd HH:mm').format(selected.createdAt.toLocal())}',
                  style: toolText,
                ),
                const SizedBox(height: 12),
                Text(
                  '전체 ${selected.records.length}건 · 추가 ${plan.additions.length}건',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                Text(
                  '추가할 보낸 마음 ${won(totalFor(plan.additions, 'paid'))}\n추가할 받은 마음 ${won(totalFor(plan.additions, 'received'))}',
                  style: toolText,
                ),
                const SizedBox(height: 12),
                Text(
                  '동일한 기록 ${plan.identical}건 · 내용이 다른 기존 기록 ${plan.conflicts}건',
                  style: toolText,
                ),
                const SizedBox(height: 8),
                const Text(
                  '기록 ID가 같으면 현재 앱의 기록을 유지해요. 백업을 만든 뒤 수정한 내용도 덮어쓰지 않아요.',
                  style: toolText,
                ),
                const SizedBox(height: 16),
                FilledButton(
                  key: const Key('restore-backup'),
                  onPressed: busy || plan.additions.isEmpty ? null : restore,
                  child: Text('${plan.additions.length}건 추가 복원'),
                ),
                TextButton(
                  onPressed: busy
                      ? null
                      : () => setState(() {
                          backup = null;
                          preview = null;
                        }),
                  child: const Text('복원 취소'),
                ),
              ],
            ),
          ],
          if (busy)
            const Padding(
              padding: EdgeInsets.only(top: 24),
              child: Center(child: CircularProgressIndicator()),
            ),
          if (message != null)
            Padding(
              padding: const EdgeInsets.only(top: 24),
              child: Semantics(
                liveRegion: true,
                child: Text(
                  message!,
                  key: const Key('backup-message'),
                  style: toolText,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
