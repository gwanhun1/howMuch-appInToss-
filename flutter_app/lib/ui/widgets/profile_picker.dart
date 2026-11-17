import 'package:material_ui/material_ui.dart';

import '../../domain/record.dart';
import '../design_tokens.dart';
import 'product_widgets.dart';

Future<String?> pickProfile(BuildContext context, String current) =>
    showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: AppColors.background,
      builder: (sheetContext) => ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(sheetContext).height * .9,
        ),
        child: SingleChildScrollView(child: _ProfilePicker(current: current)),
      ),
    );

class _ProfilePicker extends StatefulWidget {
  const _ProfilePicker({required this.current});
  final String current;
  @override
  State<_ProfilePicker> createState() => _ProfilePickerState();
}

class _ProfilePickerState extends State<_ProfilePicker> {
  late String selected = widget.current;
  @override
  Widget build(BuildContext context) => SafeArea(
    child: Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Align(
            alignment: Alignment.centerLeft,
            child: Text(
              '프로필 아이콘 선택',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
            ),
          ),
          const SizedBox(height: 24),
          ProfileAvatar(selected, size: 80),
          TextButton(
            onPressed: () => setState(() => selected = profileIcons.first),
            child: const Text('기본 아이콘으로'),
          ),
          const SizedBox(height: 16),
          GridView.count(
            shrinkWrap: true,
            crossAxisCount: 5,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            children: profileIcons
                .map(
                  (icon) => Semantics(
                    label: '프로필 $icon',
                    selected: selected == icon,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () => setState(() => selected = icon),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        decoration: BoxDecoration(
                          color: selected == icon
                              ? AppColors.selected
                              : AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: selected == icon
                                ? AppColors.primary
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: Center(child: ProfileAvatar(icon, size: 36)),
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('취소'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton(
                  onPressed: () => Navigator.pop(context, selected),
                  child: const Text('저장'),
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}
