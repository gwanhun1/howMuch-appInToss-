import 'package:material_ui/material_ui.dart';

import '../design_tokens.dart';

const orderedCategories = ['축의금', '조의금', '돌잔치', '용돈'];
const relations = ['친구', '가족', '지인', '직장', '동료'];
Color categoryColor(String type) => switch (type) {
  '축의금' => const Color(0xfff06595),
  '조의금' => const Color(0xff6b7684),
  '돌잔치' => const Color(0xffffb900),
  '용돈' => const Color(0xff20c997),
  _ => AppColors.primary,
};

class ProfileAvatar extends StatelessWidget {
  const ProfileAvatar(
    this.value, {
    super.key,
    this.size = 48,
    this.muted = false,
  });
  final String value;
  final double size;
  final bool muted;
  @override
  Widget build(BuildContext context) {
    final child = Text(
      value,
      textScaler: TextScaler.noScaling,
      style: TextStyle(fontFamily: 'Tossface', fontSize: size, height: 1.15),
    );
    return muted
        ? ColorFiltered(
            colorFilter: const ColorFilter.matrix([
              .2126,
              .7152,
              .0722,
              0,
              0,
              .2126,
              .7152,
              .0722,
              0,
              0,
              .2126,
              .7152,
              .0722,
              0,
              0,
              0,
              0,
              0,
              1,
              0,
            ]),
            child: child,
          )
        : child;
  }
}

class Pill extends StatelessWidget {
  const Pill(
    this.label, {
    super.key,
    this.selected = false,
    required this.onTap,
    this.color,
    this.icon,
  });
  final String label;
  final bool selected;
  final VoidCallback? onTap;
  final Color? color;
  final IconData? icon;
  @override
  Widget build(BuildContext context) => Semantics(
    selected: selected,
    button: true,
    child: Material(
      color: selected ? (color ?? AppColors.primary) : const Color(0xfff2f4f6),
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(
                  icon,
                  size: 16,
                  color: selected ? Colors.white : AppColors.secondaryText,
                ),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                style: TextStyle(
                  color: selected ? Colors.white : AppColors.secondaryText,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class SectionCard extends StatelessWidget {
  const SectionCard({super.key, required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.symmetric(vertical: 8),
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: AppColors.border),
    ),
    child: Material(color: Colors.transparent, child: child),
  );
}

InputDecoration boxInput(
  String label, {
  String? hint,
  String? suffix,
  String? error,
}) => InputDecoration(
  labelText: label,
  counterText: '',
  hintText: hint,
  suffixText: suffix,
  errorText: error,
  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
  border: OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: const BorderSide(color: AppColors.border),
  ),
  enabledBorder: OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: const BorderSide(color: AppColors.border),
  ),
  focusedBorder: OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: const BorderSide(color: AppColors.primary),
  ),
);

class BottomAction extends StatelessWidget {
  const BottomAction({super.key, required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) => ColoredBox(
    color: Colors.white,
    child: Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
          child: child,
        ),
      ),
    ),
  );
}

void toast(BuildContext context, String message) =>
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));

/// Put monetary details below the title when accessibility text needs more space.
class DetailLine extends StatelessWidget {
  const DetailLine({
    super.key,
    required this.title,
    required this.value,
    this.subtitle,
    this.onTap,
  });
  final String title, value;
  final String? subtitle;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(12),
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
          if (subtitle != null)
            Text(
              subtitle!,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.secondaryText,
              ),
            ),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(color: AppColors.primary)),
        ],
      ),
    ),
  );
}
