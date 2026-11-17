import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';

import '../design_tokens.dart';

const toolGap = SizedBox(height: 24);
const fieldGap = SizedBox(height: 20);
const toolText = TextStyle(
  fontSize: 14,
  height: 1.6,
  color: AppColors.secondaryText,
);

class ToolScaffold extends StatelessWidget {
  const ToolScaffold({
    super.key,
    required this.title,
    required this.children,
    this.footer,
  });
  final String title;
  final List<Widget> children;
  final Widget? footer;
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.surface,
    appBar: AppBar(
      title: Text(
        title,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
      ),
      backgroundColor: AppColors.surface,
      scrolledUnderElevation: 0,
    ),
    bottomNavigationBar: footer == null
        ? null
        : DecoratedBox(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.viewInsetsOf(context).bottom,
              ),
              child: SafeArea(
                top: false,
                child: Center(
                  heightFactor: 1,
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 600),
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
                      child: SizedBox(width: double.infinity, child: footer),
                    ),
                  ),
                ),
              ),
            ),
          ),
    body: Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 600),
        child: ListView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          children: children,
        ),
      ),
    ),
  );
}

class ToolIntro extends StatelessWidget {
  const ToolIntro(this.title, this.description, {super.key});
  final String title, description;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 28),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 24,
            height: 1.35,
            fontWeight: FontWeight.w700,
            letterSpacing: -.5,
          ),
        ),
        const SizedBox(height: 10),
        Text(description, style: toolText),
      ],
    ),
  );
}

class ToolCard extends StatelessWidget {
  const ToolCard({super.key, required this.children, this.tint = false});
  final List<Widget> children;
  final bool tint;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: tint ? AppColors.selected : Colors.white,
      borderRadius: BorderRadius.circular(20),
    ),
    child: Material(
      color: Colors.transparent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: children,
      ),
    ),
  );
}

class ToolField extends StatelessWidget {
  const ToolField({
    super.key,
    required this.label,
    required this.child,
    this.help,
  });
  final String label;
  final Widget child;
  final String? help;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text(
        label,
        style: const TextStyle(
          fontSize: 14,
          height: 1.4,
          fontWeight: FontWeight.w600,
          color: Color(0xff333d4b),
        ),
      ),
      const SizedBox(height: 8),
      child,
      if (help != null) ...[
        const SizedBox(height: 8),
        Text(
          help!,
          style: const TextStyle(
            fontSize: 12,
            height: 1.5,
            color: AppColors.secondaryText,
          ),
        ),
      ],
    ],
  );
}

InputDecoration toolInput({String? hint, String? suffix, String? error}) =>
    InputDecoration(
      hintText: hint,
      suffixText: suffix,
      errorText: error,
      errorMaxLines: 3,
      counterText: '',
      filled: true,
      fillColor: const Color(0xfff2f4f6),
      hintStyle: const TextStyle(fontSize: 15, color: Color(0xff8b95a1)),
      suffixStyle: const TextStyle(
        fontSize: 15,
        color: AppColors.secondaryText,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
    );

class ToolTextInput extends StatelessWidget {
  const ToolTextInput({
    super.key,
    required this.controller,
    this.hint,
    this.money = false,
    this.onChanged,
    this.error,
    this.maxLength = 50,
    this.minLines = 1,
    this.maxLines = 1,
  });
  final TextEditingController controller;
  final String? hint, error;
  final bool money;
  final ValueChanged<String>? onChanged;
  final int maxLength, minLines, maxLines;
  @override
  Widget build(BuildContext context) => TextField(
    controller: controller,
    maxLength: maxLength,
    minLines: minLines,
    maxLines: maxLines,
    textInputAction: maxLines > 1
        ? TextInputAction.newline
        : money
        ? TextInputAction.done
        : TextInputAction.next,
    keyboardType: maxLines > 1
        ? TextInputType.multiline
        : money
        ? TextInputType.number
        : TextInputType.text,
    inputFormatters: money ? [FilteringTextInputFormatter.digitsOnly] : null,
    onChanged: onChanged,
    style: const TextStyle(fontSize: 16, height: 1.4, color: AppColors.text),
    onTapOutside: (_) => FocusManager.instance.primaryFocus?.unfocus(),
    decoration: toolInput(hint: hint, suffix: money ? '원' : null, error: error),
  );
}

class ToolOption extends StatelessWidget {
  const ToolOption(
    this.label, {
    super.key,
    required this.selected,
    required this.onTap,
    this.expand = false,
  });
  final String label;
  final bool selected, expand;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    selected: selected,
    child: Material(
      color: selected ? AppColors.selected : const Color(0xfff2f4f6),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          constraints: const BoxConstraints(minHeight: 44),
          width: expand ? double.infinity : null,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? AppColors.primary : Colors.transparent,
            ),
          ),
          child: Text(
            label,
            textAlign: expand ? TextAlign.left : TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              height: 1.4,
              fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
              color: selected ? AppColors.primary : const Color(0xff4e5968),
            ),
          ),
        ),
      ),
    ),
  );
}

class ToolDate extends StatelessWidget {
  const ToolDate({
    super.key,
    required this.label,
    required this.value,
    required this.onTap,
  });
  final String label, value;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => ToolField(
    label: label,
    child: Material(
      color: const Color(0xfff2f4f6),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              const Icon(
                Icons.calendar_today_outlined,
                size: 18,
                color: AppColors.secondaryText,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(value, style: const TextStyle(fontSize: 16)),
              ),
              const Icon(
                Icons.expand_more,
                size: 20,
                color: AppColors.secondaryText,
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class ToolHeading extends StatelessWidget {
  const ToolHeading(this.title, {super.key, this.action});
  final String title;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 20),
    child: Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 17,
              height: 1.4,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        ?action,
      ],
    ),
  );
}
