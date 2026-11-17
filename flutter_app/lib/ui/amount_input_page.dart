import 'package:material_ui/material_ui.dart';

import 'amount_formatter.dart';

import '../domain/record.dart';
import '../domain/presentation.dart';
import 'widgets/product_widgets.dart';
import 'design_tokens.dart';

class AmountInputPage extends StatefulWidget {
  const AmountInputPage({
    super.key,
    required this.value,
    required this.mode,
    required this.type,
    required this.records,
  });
  final String value, mode, type;
  final List<MoneyRecord> records;
  @override
  State<AmountInputPage> createState() => _AmountInputPageState();
}

class _AmountInputPageState extends State<AmountInputPage> {
  late final input = TextEditingController(
    text: int.tryParse(amountDigits(widget.value)) == null
        ? ''
        : formatAmount(int.parse(amountDigits(widget.value))),
  );
  final focus = FocusNode();
  @override
  void initState() {
    super.initState();
    focus.addListener(refresh);
  }

  void refresh() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    focus.removeListener(refresh);
    focus.dispose();
    input.dispose();
    super.dispose();
  }

  void choose(int value) => setState(() {
    final text = formatAmount(value);
    input.value = TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  });
  @override
  Widget build(BuildContext context) {
    final history = amountHistory(widget.records, widget.mode, widget.type);
    final paid = widget.mode == 'paid';
    return Scaffold(
      backgroundColor: const Color(0xfff9fafb),
      appBar: AppBar(title: Text(paid ? '보낸 돈 입력' : '받은 돈 입력')),
      bottomNavigationBar: BottomAction(
        child: SizedBox(
          width: double.infinity,
          child: FilledButton(
            key: const Key('confirm-amount'),
            onPressed: () {
              final amount = parseAmount(amountDigits(input.text));
              if (amount == null) {
                toast(context, '1원부터 1억 원까지 입력해주세요.');
                return;
              }
              Navigator.pop(context, amount);
            },
            child: const Text('확인'),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SizedBox(height: 24),
          Text(
            paid ? '이번에 얼마를 전했나요?' : '이번에 얼마를 받았나요?',
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
          ),
          if (history != null) ...[
            const SizedBox(height: 16),
            Text(
              '지난번 ${widget.type}에는 ${won(history.last)}을 ${paid ? '보내셨어요' : '받으셨어요'}.',
              style: const TextStyle(color: AppColors.primary),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Pill(
                  '지난 ${widget.type} ${won(history.last)}',
                  onTap: () => choose(history.last),
                ),
                if (history.frequent != history.last)
                  Pill(
                    '자주 쓴 ${won(history.frequent)}',
                    onTap: () => choose(history.frequent),
                  ),
              ],
            ),
          ],
          const SizedBox(height: 32),
          AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: focus.hasFocus ? AppColors.primary : AppColors.border,
                  width: focus.hasFocus ? 2 : 1,
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '금액',
                  style: TextStyle(
                    fontSize: 13,
                    color: focus.hasFocus
                        ? AppColors.primary
                        : AppColors.secondaryText,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          final painter = TextPainter(
                            text: TextSpan(
                              text: input.text.isEmpty ? '0' : input.text,
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            textDirection: TextDirection.ltr,
                            textScaler: MediaQuery.textScalerOf(context),
                          )..layout();
                          final size = painter.width > constraints.maxWidth
                              ? (32 * constraints.maxWidth / painter.width)
                                    .clamp(22.0, 32.0)
                              : 32.0;
                          return TextField(
                            key: const Key('record-amount'),
                            controller: input,
                            focusNode: focus,
                            autofocus: true,
                            keyboardType: TextInputType.number,
                            inputFormatters: [WonInputFormatter()],
                            style: TextStyle(
                              fontSize: size,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -.6,
                            ),
                            decoration: const InputDecoration(
                              hintText: '0',
                              isDense: true,
                              filled: false,
                              contentPadding: EdgeInsets.symmetric(vertical: 8),
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                            ),
                            onChanged: (_) => setState(() {}),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      '원',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: AppColors.secondaryText,
                      ),
                    ),
                    SizedBox(
                      width: 44,
                      child: input.text.isEmpty
                          ? null
                          : IconButton(
                              tooltip: '금액 지우기',
                              onPressed: () {
                                input.clear();
                                focus.requestFocus();
                                setState(() {});
                              },
                              icon: const Icon(
                                Icons.cancel_rounded,
                                size: 22,
                                color: Color(0xffb0b8c1),
                              ),
                            ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            input.text.isEmpty
                ? '최대 1억 원까지 입력할 수 있어요.'
                : readAmount(int.parse(amountDigits(input.text))),
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.secondaryText,
            ),
          ),
          const SizedBox(height: 36),
          const Text(
            '간편하게 선택하기',
            style: TextStyle(color: AppColors.secondaryText),
          ),
          const SizedBox(height: 12),
          LayoutBuilder(
            builder: (context, constraints) {
              final largeText = MediaQuery.textScalerOf(context).scale(15) > 22;
              final count = constraints.maxWidth < 280 || largeText ? 2 : 3;
              return GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: count,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                mainAxisExtent: largeText ? 68 : 50,
                children: [50000, 100000, 150000, 200000, 300000, 500000].map((
                  a,
                ) {
                  final selected = amountDigits(input.text) == '$a';
                  return Semantics(
                    selected: selected,
                    button: true,
                    child: Material(
                      color: selected ? AppColors.primary : AppColors.selected,
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        onTap: () => choose(a),
                        borderRadius: BorderRadius.circular(16),
                        child: Center(
                          child: Text(
                            '${a ~/ 10000}만',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: selected
                                  ? Colors.white
                                  : AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}
