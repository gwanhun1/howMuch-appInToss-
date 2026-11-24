import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart' show Clipboard, ClipboardData;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../domain/record.dart';
import '../data/service_links.dart';
import '../domain/presentation.dart';
import '../state/records.dart';
import 'record_editor.dart';
import 'backup_page.dart';
import 'tools_page.dart';
import 'wedding_page.dart';
import 'widgets/product_widgets.dart';
import 'widgets/tool_layout.dart' show toolInput;
import 'design_tokens.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});
  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  String mode = 'paid', category = '전체', query = '';
  bool grid = true;
  double swipeDistance = 0;
  final search = TextEditingController();
  SharedPreferences? preferences;
  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance()
        .then((value) {
          if (!mounted) return;
          setState(() {
            preferences = value;
            mode = value.getString('record-mode') == 'received'
                ? 'received'
                : 'paid';
            grid = value.getString('record-view') != 'list';
          });
        })
        .catchError((Object _) {
          /* Browsing remains available if preferences cannot be read. */
        });
  }

  void setMode(String value) {
    setState(() => mode = value);
    preferences?.setString('record-mode', value);
  }

  void toggleView() {
    setState(() => grid = !grid);
    preferences?.setString('record-view', grid ? 'card' : 'list');
  }

  @override
  void dispose() {
    search.dispose();
    super.dispose();
  }

  Future<void> change(Future<void> Function() action) async {
    try {
      await action();
    } catch (_) {
      if (mounted) toast(context, '변경하지 못했어요. 다시 시도해주세요.');
    }
  }

  Future<void> edit([MoneyRecord? record, String? initialType]) async {
    if (record != null) setMode(record.mode);
    await openEditor(
      context,
      record: record,
      mode: record?.mode ?? mode,
      type: initialType ?? (category == '전체' ? null : category),
    );
  }

  Future<void> openGuide() async {
    final result = await Navigator.of(context).push<GuideSelection>(
      MaterialPageRoute(builder: (_) => const GuidePage()),
    );
    if (result != null && mounted) {
      setMode('paid');
      setState(() {
        query = '';
        search.clear();
      });
      await openEditor(
        context,
        amount: result.amount,
        type: result.type,
        name: result.name,
        relation: result.relation,
      );
    }
  }

  void page(Widget widget) =>
      Navigator.of(context)
          .push<void>(MaterialPageRoute(builder: (_) => widget));
  Future<void> guide() async {
    for (final step in [
      '기록 추가를 누르면 이름과 상황, 금액을 입력할 수 있어요.',
      '보낸 마음과 받은 마음을 전환해보세요. 좌우로 스와이프해도 바뀌어요.',
    ]) {
      if (!mounted) return;
      final next = await showDialog<bool>(
        context: context,
        builder: (dialog) => AlertDialog(
          title: const Text('얼마냈지요 사용법'),
          content: Text(step),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialog, false),
              child: const Text('그만 보기'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(dialog, true),
              child: Text(step.startsWith('기록') ? '다음' : '시작하기'),
            ),
          ],
        ),
      );
      if (next != true) break;
    }
  }

  Future<void> openServiceLink(String title, String url) async {
    try {
      if (await ref.read(externalLinkOpenerProvider)(Uri.parse(url))) return;
    } catch (_) {
      // Keep a copyable link available when the OS cannot launch a browser.
    }
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (dialog) => AlertDialog(
        title: Text(title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('브라우저를 열지 못했어요. 주소를 복사해서 브라우저에 붙여넣어주세요.'),
            const SizedBox(height: 16),
            SelectableText(url),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialog),
            child: const Text('닫기'),
          ),
          TextButton(
            onPressed: () async {
              try {
                await Clipboard.setData(ClipboardData(text: url));
                if (dialog.mounted) Navigator.pop(dialog);
                if (mounted) toast(context, '주소를 복사했어요.');
              } catch (_) {
                if (dialog.mounted) {
                  toast(dialog, '주소를 복사하지 못했어요. 주소를 길게 눌러 복사해주세요.');
                }
              }
            },
            child: const Text('주소 복사'),
          ),
        ],
      ),
    );
  }

  Future<void> confirmDeleteAccount(
    Future<void> Function(String) remove,
  ) async {
    var password = '';
    final confirmed = await showDialog<String>(
      context: context,
      builder: (dialog) => AlertDialog(
        title: const Text('계정과 서버 기록을 삭제할까요?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('서버에 저장된 계정과 모든 기록이 삭제돼요. 되돌릴 수 없어요.'),
            TextField(
              obscureText: true,
              decoration: const InputDecoration(labelText: '현재 비밀번호'),
              onChanged: (text) => password = text,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialog),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              if (password.isNotEmpty) Navigator.pop(dialog, password);
            },
            child: const Text('계정 삭제'),
          ),
        ],
      ),
    );
    if (mounted && confirmed != null) await change(() => remove(confirmed));
  }

  Future<void> settings() {
    final apiLogout = ref.read(apiLogoutProvider);
    final openCloud = ref.read(apiOpenProvider);
    final returnToLocal = ref.read(apiReturnToLocalProvider);
    final deleteAccount = ref.read(apiDeleteAccountProvider);
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheet) => SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                '내 기록과 개인정보',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 16),
              if (apiLogout != null) ...[
                Text(
                  deleteAccount == null
                      ? '데모 기록은 Oracle 서버에 저장돼요. 연습용 정보만 입력해주세요.'
                      : '계정과 기록이 서버에 저장돼요. 설정에서 계정과 서버 기록을 삭제할 수 있어요.',
                ),
                if (deleteAccount != null)
                  TextButton(
                    onPressed: () async {
                      Navigator.pop(sheet);
                      await confirmDeleteAccount(deleteAccount);
                    },
                    child: const Text('계정과 서버 기록 삭제'),
                  ),
                TextButton(
                  onPressed: () {
                    Navigator.pop(sheet);
                    change(apiLogout);
                  },
                  child: const Text('로그아웃'),
                ),
                if (returnToLocal != null)
                  TextButton(
                    onPressed: () {
                      Navigator.pop(sheet);
                      returnToLocal();
                    },
                    child: const Text('기기 기록으로 돌아가기'),
                  ),
              ] else ...[
                const Text(
                  '이름·관계·금액·날짜·프로필은 이 기기에 저장돼요. 앱에서 서버로 전송하지 않아요. 운영체제 백업 설정에 따라 OS가 앱 데이터를 백업할 수 있어요. 앱 삭제 시 기록이 사라질 수 있어요. CSV는 축의금 장부만 내보내요. 전체 기록은 백업·복원에서 JSON 파일로 따로 보관할 수 있어요.',
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () {
                    Navigator.pop(sheet);
                    page(const BackupPage());
                  },
                  icon: const Icon(Icons.backup_outlined),
                  label: const Text('기록 백업·복원'),
                ),
                if (openCloud != null)
                  TextButton.icon(
                    onPressed: () {
                      Navigator.pop(sheet);
                      openCloud();
                    },
                    icon: const Icon(Icons.cloud_outlined),
                    label: const Text('서버 기록 사용하기'),
                  ),
              ],
              const SizedBox(height: 16),
              if (apiLogout == null || deleteAccount != null) ...[
                TextButton.icon(
                  key: const Key('privacy-policy-link'),
                  onPressed: () => openServiceLink(
                    '개인정보처리방침',
                    deleteAccount == null ? privacyPolicyUrl : apiPrivacyUrl,
                  ),
                  icon: const Icon(Icons.privacy_tip_outlined, size: 20),
                  label: const Text('개인정보처리방침'),
                ),
                TextButton.icon(
                  key: const Key('customer-support-link'),
                  onPressed: () =>
                      openServiceLink('고객지원·문의', customerSupportUrl),
                  icon: const Icon(Icons.help_outline, size: 20),
                  label: const Text('고객지원·문의'),
                ),
              ],
              const SizedBox(height: 16),
              const Text(
                '이용 안내',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              const Text(
                '경조사 비용을 기록하고 관리하는 도구입니다. 참고 금액과 통계는 실제 평균이나 정답을 의미하지 않아요. 송금이나 금융 거래 기능은 제공하지 않아요.',
              ),
              const SizedBox(height: 16),
              const Text('프로필에는 토스팀에서 제공한 토스페이스가 적용되어 있습니다.'),
              TextButton(
                onPressed: () =>
                    showLicensePage(context: context, applicationName: '얼마냈지요'),
                child: const Text('오픈소스·토스페이스 라이선스'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(sheet);
                  guide();
                },
                child: const Text('사용법 보기'),
              ),
              if (apiLogout == null)
                TextButton(
                  onPressed: () async {
                    Navigator.pop(sheet);
                    final yes = await showDialog<bool>(
                      context: context,
                      builder: (dialog) => AlertDialog(
                        title: const Text('모든 기록을 삭제할까요?'),
                        content: const Text('삭제한 기록은 되돌릴 수 없어요.'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(dialog, false),
                            child: const Text('취소'),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(dialog, true),
                            child: const Text('모두 삭제'),
                          ),
                        ],
                      ),
                    );
                    if (yes == true) {
                      await change(
                        () => ref.read(recordsProvider.notifier).clear(),
                      );
                    }
                  },
                  child: const Text(
                    '모든 기록 삭제',
                    style: TextStyle(color: Colors.red),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> breakdown(List<MoneyRecord> records) =>
      showModalBottomSheet<void>(
        context: context,
        showDragHandle: true,
        isScrollControlled: true,
        builder: (context) => SafeArea(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.sizeOf(context).height * .8,
            ),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    '${mode == 'paid' ? '보낸' : '받은'} 마음 합계',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  ...orderedCategories.map(
                    (type) => DetailLine(
                      title: type,
                      value: won(
                        records
                            .where((r) => r.type == type)
                            .fold(0, (s, r) => s + r.amount),
                      ),
                    ),
                  ),
                  const Divider(),
                  Text(
                    '총 ${won(totalFor(records, mode))}',
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(recordsProvider);
    return Scaffold(
      backgroundColor: const Color(0xfff9fafb),
      appBar: AppBar(
        title: const Text(
          '얼마냈지요',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        actions: [
          IconButton(
            tooltip: '설정',
            onPressed: settings,
            icon: const Icon(Icons.settings_outlined),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.small(
        tooltip: '금액 뽑기',
        onPressed: () => showRandomPicker(context),
        child: const Icon(Icons.casino_outlined),
      ),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('기록을 불러오지 못했어요.'),
              TextButton(
                onPressed: () => ref.invalidate(recordsProvider),
                child: const Text('다시 시도'),
              ),
            ],
          ),
        ),
        data: (records) {
          final modeRecords = records.where((r) => r.mode == mode).toList();
          final filtered =
              modeRecords
                  .where((r) => category == '전체' || r.type == category)
                  .toList()
                ..sort(compareRecords);
          final groups = searchPeople(records, query);
          return GestureDetector(
            onHorizontalDragStart: (_) => swipeDistance = 0,
            onHorizontalDragUpdate: (details) =>
                swipeDistance += details.delta.dx,
            onHorizontalDragEnd: (details) {
              if (swipeDistance.abs() < 50) return;
              setMode(swipeDistance < 0 ? 'received' : 'paid');
            },
            child: ListView(
              key: const PageStorageKey('home-scroll'),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 90),
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Pill(
                      '보낸 마음',
                      selected: mode == 'paid',
                      onTap: () => setMode('paid'),
                    ),
                    Pill(
                      '받은 마음',
                      selected: mode == 'received',
                      onTap: () => setMode('received'),
                    ),
                    if (modeRecords.isNotEmpty)
                      TextButton(
                        onPressed: () => breakdown(modeRecords),
                        child: Text(
                          '총 ${won(totalFor(records, mode))}',
                          key: const Key('total-amount'),
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    Pill('금액 가이드', onTap: openGuide),
                    Pill('예정 비용', onTap: () => page(const BudgetPage())),
                    Pill('축의금 장부', onTap: () => page(const WeddingPage())),
                  ],
                ),
                const SizedBox(height: 20),
                TextField(
                  key: const Key('search'),
                  controller: search,
                  style: const TextStyle(fontSize: 15, height: 1.4),
                  decoration: toolInput(hint: '이름으로 찾기').copyWith(
                    prefixIcon: const Icon(Icons.search, size: 22),
                    suffixIcon: query.isEmpty
                        ? null
                        : IconButton(
                            tooltip: '검색 지우기',
                            onPressed: () => setState(() {
                              query = '';
                              search.clear();
                            }),
                            icon: const Icon(Icons.close),
                          ),
                  ),
                  maxLength: 50,
                  onChanged: (value) => setState(() => query = value),
                ),
                const SizedBox(height: 20),
                if (query.trim().isNotEmpty) ...[
                  Text(
                    '${groups.length}개 이름·관계 묶음 · 보낸 마음과 받은 마음을 함께 검색해요.',
                    style: const TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '동명이인일 수 있으니 관계·날짜·내역을 확인해주세요.',
                    style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 12,
                    ),
                  ),
                  if (groups.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 28),
                      child: Text('일치하는 이름이 없어요. 다른 이름으로 검색해보세요.'),
                    ),
                  ...groups.map(
                    (g) => SectionCard(
                      child: ExpansionTile(
                        initiallyExpanded: true,
                        tilePadding: EdgeInsets.zero,
                        title: Text(
                          '${g.name} · ${g.relation.isEmpty ? '관계 없음' : g.relation} · ${g.records.length}건',
                        ),
                        children: [
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              '보낸 마음 ${won(g.paid)}\n받은 마음 ${won(g.received)}',
                              style: const TextStyle(
                                color: AppColors.primary,
                                height: 1.7,
                              ),
                            ),
                          ),
                          ...g.records.map(
                            (r) => DetailLine(
                              title: r.type,
                              subtitle: r.date,
                              value:
                                  '${r.mode == 'paid' ? '보낸' : '받은'} ${won(r.amount)}',
                              onTap: () => edit(r),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ] else ...[
                  Row(
                    children: [
                      PopupMenuButton<String>(
                        tooltip: '카테고리 선택',
                        initialValue: category,
                        onSelected: (v) => setState(() => category = v),
                        itemBuilder: (_) => ['전체', ...orderedCategories]
                            .map((v) => PopupMenuItem(value: v, child: Text(v)))
                            .toList(),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                category,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.expand_more, size: 18),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          '${filtered.length}개의 기록',
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.secondaryText,
                          ),
                        ),
                      ),
                      IconButton(
                        tooltip: grid ? '목록으로 보기' : '카드로 보기',
                        onPressed: toggleView,
                        icon: Icon(
                          grid
                              ? Icons.view_list_outlined
                              : Icons.grid_view_outlined,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (grid)
                    LayoutBuilder(
                      builder: (context, constraints) => GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: constraints.maxWidth < 330 ? 2 : 3,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 16,
                        mainAxisExtent:
                            174 +
                            (MediaQuery.textScalerOf(context).scale(14) - 14)
                                    .clamp(0, 28) *
                                4,
                        children: [addTile(), ...filtered.map(recordTile)],
                      ),
                    )
                  else ...[
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        key: const Key('add-record'),
                        onPressed: () => edit(),
                        icon: const Icon(Icons.add_circle_outline),
                        label: const Text('기록 추가'),
                      ),
                    ),
                    ...filtered.map(recordRow),
                  ],
                  if (filtered.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 28),
                      child: Column(
                        children: [
                          Text(
                            records.isEmpty
                                ? '첫 번째 마음을 기록해보세요'
                                : '조건에 맞는 기록이 없어요',
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            '어떤 마음을 주고받았나요?',
                            style: TextStyle(color: AppColors.secondaryText),
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: orderedCategories
                                .map((v) => Pill(v, onTap: () => edit(null, v)))
                                .toList(),
                          ),
                        ],
                      ),
                    ),
                ],
                const SizedBox(height: 24),
                const Text(
                  '← 스와이프하여 보낸/받은 마음을 확인해보세요 →',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.secondaryText,
                  ),
                ),
                const SizedBox(height: 40),
                const Text(
                  '얼마냈지요 팀에서 제공합니다.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.primary, fontSize: 13),
                ),
                Wrap(
                  alignment: WrapAlignment.center,
                  children: [
                    TextButton(
                      onPressed: settings,
                      child: const Text('이용안내·개인정보'),
                    ),
                    TextButton(onPressed: guide, child: const Text('사용법 보기')),
                  ],
                ),
                const Text(
                  '프로필 이모지: 토스팀의 토스페이스',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.secondaryText,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget addTile() => Material(
    color: const Color(0xffe8f3ff),
    borderRadius: BorderRadius.circular(24),
    child: InkWell(
      key: const Key('add-record'),
      onTap: () => edit(),
      borderRadius: BorderRadius.circular(24),
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.add_circle_outline, color: AppColors.primary, size: 36),
          SizedBox(height: 12),
          Text(
            '기록 추가',
            style: TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    ),
  );
  Widget recordTile(MoneyRecord r) {
    final color = categoryColor(r.type), label = dday(r.date);
    return Material(
      color: color.withValues(alpha: .07),
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        onTap: () => edit(r),
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 22, 8, 8),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ProfileAvatar(
                      r.profileIcon,
                      size: 42,
                      muted: r.type == '조의금',
                    ),
                    const SizedBox(height: 8),
                    Text(
                      r.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    Text(
                      won(r.amount),
                      maxLines: 1,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(r.type, style: TextStyle(fontSize: 11, color: color)),
                  ],
                ),
              ),
            ),
            Positioned(
              top: 0,
              left: 0,
              child: IconButton(
                tooltip: '즐겨찾기',
                iconSize: 19,
                visualDensity: VisualDensity.compact,
                onPressed: () => change(
                  () => ref.read(recordsProvider.notifier).save([
                    r.copyWith(isFavorite: !r.isFavorite),
                  ]),
                ),
                icon: Icon(
                  r.isFavorite
                      ? Icons.star_rounded
                      : Icons.star_outline_rounded,
                  color: r.isFavorite ? AppColors.primary : AppColors.border,
                ),
              ),
            ),
            if (label != null)
              Positioned(
                top: 7,
                right: 8,
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 9,
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget recordRow(MoneyRecord r) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: () => edit(r),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ProfileAvatar(r.profileIcon, size: 36, muted: r.type == '조의금'),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      r.name,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${r.type} · ${r.date}${dday(r.date) == null ? '' : ' · ${dday(r.date)}'}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.secondaryText,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      won(r.amount),
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: '즐겨찾기',
                onPressed: () => change(
                  () => ref.read(recordsProvider.notifier).save([
                    r.copyWith(isFavorite: !r.isFavorite),
                  ]),
                ),
                icon: Icon(
                  r.isFavorite
                      ? Icons.star_rounded
                      : Icons.star_outline_rounded,
                  color: r.isFavorite ? AppColors.primary : AppColors.border,
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
