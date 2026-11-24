import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'data/record_repository.dart';
import 'state/records.dart';
import 'ui/api_login.dart';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  LicenseRegistry.addLicense(() async* {
    yield LicenseEntryWithLineBreaks(
      ['Tossface'],
      '${await rootBundle.loadString('assets/licenses/TOSSFACE-NOTICE.txt')}\n${await rootBundle.loadString('assets/licenses/TOSSFACE-LICENSE.txt')}',
    );
  });
  const address = String.fromEnvironment('HOWMUCH_API_URL');
  const origin = String.fromEnvironment('HOWMUCH_API_ORIGIN');
  final cloudEnabled = Uri.tryParse(address)?.scheme == 'https';
  if (address.isNotEmpty && !cloudEnabled) {
    runApp(
      const ApiLogin(address: address, origin: origin == '' ? null : origin),
    );
    return;
  }
  try {
    final repository = await SqliteRecordRepository.open();
    runApp(
      _StorageApp(
        repository: repository,
        cloudAddress: cloudEnabled ? address : null,
        cloudOrigin: origin.isEmpty ? null : origin,
      ),
    );
  } catch (_) {
    runApp(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('기록 저장소를 열지 못했어요. 저장 공간을 확인해주세요.'),
                TextButton(onPressed: main, child: const Text('다시 시도')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StorageApp extends StatefulWidget {
  const _StorageApp({
    required this.repository,
    required this.cloudAddress,
    required this.cloudOrigin,
  });

  final SqliteRecordRepository repository;
  final String? cloudAddress;
  final String? cloudOrigin;

  @override
  State<_StorageApp> createState() => _StorageAppState();
}

class _StorageAppState extends State<_StorageApp> {
  bool usingCloud = false;

  @override
  Widget build(BuildContext context) {
    final address = widget.cloudAddress;
    if (usingCloud && address != null) {
      return ApiLogin(
        address: address,
        origin: widget.cloudOrigin,
        onReturnToLocal: () => setState(() => usingCloud = false),
      );
    }
    return ProviderScope(
      overrides: [
        repositoryProvider.overrideWithValue(widget.repository),
        if (address != null)
          apiOpenProvider.overrideWithValue(
            () => setState(() => usingCloud = true),
          ),
      ],
      child: const HowMuchApp(),
    );
  }
}
