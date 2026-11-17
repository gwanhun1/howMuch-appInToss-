import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'data/record_repository.dart';
import 'state/records.dart';

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
  try {
    final repository = await SqliteRecordRepository.open();
    runApp(
      ProviderScope(
        overrides: [repositoryProvider.overrideWithValue(repository)],
        child: const HowMuchApp(),
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
