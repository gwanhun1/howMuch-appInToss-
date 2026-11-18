import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

import '../domain/record_backup.dart';

abstract interface class BackupFiles {
  Future<Uint8List?> pick();
  Future<bool> share(Uint8List bytes, String name, Rect origin);
}

final backupFilesProvider = Provider<BackupFiles>((ref) => NativeBackupFiles());

class NativeBackupFiles implements BackupFiles {
  @override
  Future<Uint8List?> pick() async {
    final file = await FilePicker.pickFile(
      type: FileType.custom,
      allowedExtensions: ['json'],
    );
    if (file == null) return null;
    final size = await file.length();
    if (size != null && size > maxBackupBytes) {
      throw const FormatException('백업 파일은 10MB 이하만 지원해요.');
    }
    return file.readAsBytes();
  }

  @override
  Future<bool> share(Uint8List bytes, String name, Rect origin) async {
    final result = await SharePlus.instance.share(
      ShareParams(
        files: [XFile.fromData(bytes, mimeType: 'application/json')],
        fileNameOverrides: [name],
        sharePositionOrigin: origin,
      ),
    );
    return result.status != ShareResultStatus.dismissed;
  }
}
