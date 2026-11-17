import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';

import '../domain/record.dart';
import 'widgets/product_widgets.dart';

Future<void> showRandomPicker(BuildContext context) => showDialog<void>(
  context: context,
  barrierColor: Colors.black.withValues(alpha: .65),
  builder: (_) => const _RandomPicker(),
);

class _RandomPicker extends StatefulWidget {
  const _RandomPicker();
  @override
  State<_RandomPicker> createState() => _RandomPickerState();
}

class _RandomPickerState extends State<_RandomPicker>
    with SingleTickerProviderStateMixin {
  final cards = [50000, 100000, 200000, 300000, 500000];
  late final motion = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 800),
  );
  int? selected;
  bool shuffling = true;
  String? copyStatus;
  @override
  void initState() {
    super.initState();
    shuffle();
  }

  @override
  void dispose() {
    motion.dispose();
    super.dispose();
  }

  Future<void> shuffle() async {
    setState(() {
      selected = null;
      shuffling = true;
      copyStatus = null;
      cards.shuffle(math.Random());
    });
    await motion.forward(from: 0);
    if (mounted) setState(() => shuffling = false);
  }

  Future<void> copy(int value) async {
    try {
      await Clipboard.setData(ClipboardData(text: '$value'));
      if (mounted) setState(() => copyStatus = 'copied');
    } catch (_) {
      if (mounted) setState(() => copyStatus = 'failed');
    }
  }

  @override
  Widget build(BuildContext context) {
    final value = selected == null ? null : cards[selected!];
    final reduceMotion = MediaQuery.disableAnimationsOf(context);
    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      backgroundColor: Colors.transparent,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: 380,
          maxHeight: MediaQuery.sizeOf(context).height * .88,
        ),
        child: Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xff1e3a6e), Color(0xff2d1b4e)],
            ),
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.white.withValues(alpha: .15)),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Align(
                  alignment: Alignment.centerRight,
                  child: IconButton(
                    tooltip: '닫기',
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: Colors.white70),
                  ),
                ),
                const Icon(
                  Icons.auto_awesome_rounded,
                  color: Color(0xfffdd778),
                  size: 30,
                ),
                const SizedBox(height: 12),
                Semantics(
                  liveRegion: true,
                  child: Text(
                    shuffling
                        ? '마음을 섞고 있어요'
                        : value == null
                        ? '얼마 낼까?'
                        : '오늘의 마음 금액',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  shuffling
                      ? '잠시 후 카드를 골라주세요'
                      : value == null
                      ? '마음이 가는 카드를 한 장 골라보세요'
                      : '나의 형편에 맞게 가볍게 참고해보세요',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Colors.white70,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 26),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final width = (constraints.maxWidth - 24) / 5;
                    return AnimatedBuilder(
                      animation: motion,
                      builder: (context, _) => Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: List.generate(5, (i) {
                          final chosen = selected == i;
                          final shift = shuffling && !reduceMotion
                              ? math.sin(motion.value * math.pi * 6 + i) * 5
                              : 0.0;
                          return Transform.translate(
                            offset: Offset(0, shift),
                            child: Semantics(
                              button: true,
                              label: '${i + 1}번째 카드',
                              selected: chosen,
                              child: AnimatedOpacity(
                                duration: const Duration(milliseconds: 200),
                                opacity: selected != null && !chosen ? .35 : 1,
                                child: Material(
                                  color: Colors.transparent,
                                  child: InkWell(
                                    key: ValueKey('picker-card-$i'),
                                    borderRadius: BorderRadius.circular(14),
                                    onTap: shuffling || selected != null
                                        ? null
                                        : () {
                                            setState(() => selected = i);
                                            copy(cards[i]);
                                          },
                                    child: AnimatedContainer(
                                      duration: const Duration(
                                        milliseconds: 250,
                                      ),
                                      width: width,
                                      height: width * 1.65,
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                          colors: chosen
                                              ? [
                                                  const Color(0xffffdf88),
                                                  const Color(0xfff8b84d),
                                                ]
                                              : [
                                                  const Color(0xff5077bd),
                                                  const Color(0xff384b86),
                                                ],
                                        ),
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(
                                          color: chosen
                                              ? const Color(0xffffedbe)
                                              : Colors.white.withValues(
                                                  alpha: .25,
                                                ),
                                          width: 1.5,
                                        ),
                                      ),
                                      child: Center(
                                        child: chosen
                                            ? ProfileAvatar(
                                                [
                                                  '🐱',
                                                  '🐹',
                                                  '🐧',
                                                  '🐰',
                                                  '🐲',
                                                ][i],
                                                size: width * .6,
                                              )
                                            : Icon(
                                                Icons.auto_awesome_outlined,
                                                size: width * .4,
                                                color: Colors.white70,
                                              ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 24),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  child: value == null
                      ? const SizedBox(
                          key: ValueKey('picker-empty-result'),
                          height: 60,
                          child: Center(
                            child: Text(
                              '5만 · 10만 · 20만 · 30만 · 50만 원',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Colors.white60,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        )
                      : Column(
                          key: ValueKey(value),
                          children: [
                            Text(
                              won(value),
                              key: const Key('picker-result'),
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: Color(0xffffdf88),
                                fontSize: 30,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              copyStatus == 'copied'
                                  ? '금액을 복사했어요'
                                  : copyStatus == 'failed'
                                  ? '복사하지 못했어요. 아래에서 다시 시도해주세요.'
                                  : '선택한 마음 금액이에요',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                              ),
                            ),
                            TextButton(
                              onPressed: () => copy(value),
                              style: TextButton.styleFrom(
                                foregroundColor: Colors.white,
                              ),
                              child: const Text('금액 복사'),
                            ),
                          ],
                        ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    if (value != null) ...[
                      Expanded(
                        child: OutlinedButton(
                          key: const Key('reshuffle'),
                          onPressed: shuffle,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white30),
                          ),
                          child: const Text('다시 뽑기'),
                        ),
                      ),
                      const SizedBox(width: 10),
                    ],
                    Expanded(
                      child: FilledButton(
                        onPressed: () => Navigator.pop(context),
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xff3182f6),
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('닫기'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  '무작위 추천이며 적정 금액이나 정답을 뜻하지 않아요.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white60,
                    fontSize: 11,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
