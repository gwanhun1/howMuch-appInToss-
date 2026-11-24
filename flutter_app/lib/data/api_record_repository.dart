import 'dart:async';
import 'dart:convert';
import 'dart:io';

import '../domain/record.dart';
import 'record_repository.dart';

class RecordApiException implements Exception {
  const RecordApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

class ApiRecordRepository implements RecordRepository {
  ApiRecordRepository(String address, {this.origin, this.onSessionExpired})
    : _base = Uri.parse(address);

  final Uri _base;
  final String? origin;
  final void Function()? onSessionExpired;
  final _client = HttpClient()..connectionTimeout = const Duration(seconds: 10);
  Cookie? _session;
  static const _timeout = Duration(seconds: 20);

  void close() => _client.close(force: true);

  Future<void> login(String username, String password) async {
    await _request('POST', 'session', {
      'username': username,
      'password': password,
    });
    if (_session == null) {
      throw const RecordApiException('서버가 로그인 세션을 보내지 않았어요.');
    }
  }

  Future<void> register(String username, String password) async {
    await _request('POST', 'accounts', {
      'username': username,
      'password': password,
      'privacyConsent': true,
    });
  }

  Future<void> deleteAccount(String password) async {
    await _request('DELETE', 'accounts/me', {'password': password});
    _session = null;
  }

  Future<void> logout() async {
    await _request('DELETE', 'session');
    _session = null;
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String route, [
    Object? body,
  ]) async {
    try {
      final uri = _base.resolve('/api/v1/$route');
      final request = await _client.openUrl(method, uri).timeout(_timeout);
      request.followRedirects = false;
      request.headers.set('Origin', origin ?? _base.origin);
      // Dart의 HttpClient에는 브라우저처럼 로그인 쿠키를 관리하는 저장소가 없다.
      // 서버가 발급한 쿠키를 이 저장소 인스턴스의 메모리에서만 관리한다.
      if (_session case final cookie?) request.cookies.add(cookie);
      if (body != null) {
        request.headers.contentType = ContentType.json;
        request.write(jsonEncode(body));
      }
      final response = await request.close().timeout(_timeout);
      final content = await utf8.decoder
          .bind(response)
          .join()
          .timeout(_timeout);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        for (final cookie in response.cookies) {
          if (cookie.name == 'howmuch_session') {
            _session = cookie.value.isEmpty ? null : cookie;
          }
        }
        if (content.isEmpty) return {};
        return jsonDecode(content) as Map<String, dynamic>;
      }

      if (response.statusCode == 401 && _session != null) {
        _session = null;
        onSessionExpired?.call();
        throw const RecordApiException('로그인이 만료됐어요. 다시 로그인해주세요.');
      }
      final message = switch (response.statusCode) {
        401 => '아이디 또는 비밀번호를 확인해주세요.',
        403 when route == 'accounts/me' => '비밀번호를 확인해주세요.',
        403 => '서버 연결 설정을 확인해주세요.',
        404 => '기록을 찾을 수 없어요. 다시 불러온 뒤 시도해주세요.',
        409 when route == 'accounts' => '사용할 수 없는 아이디예요.',
        409 => '같은 ID에 다른 기록이 있어요.',
        422 => '이름, 금액, 날짜와 유형을 확인해주세요.',
        _ => '서버 요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.',
      };
      throw RecordApiException(message);
    } on IOException {
      throw const RecordApiException('서버에 연결할 수 없어요.');
    } on TimeoutException {
      throw const RecordApiException('서버 응답이 늦어요. 잠시 후 다시 시도해주세요.');
    }
  }

  @override
  Future<List<MoneyRecord>> readAll() async {
    final result = await _request('GET', 'bootstrap');
    final records = (result['records'] as List).map((entry) {
      final json = entry as Map<String, dynamic>;
      return MoneyRecord(
        id: json['id'] as String,
        name: json['name'] as String,
        amount: json['amount'] as int,
        date: json['date'] as String,
        mode: json['mode'] as String,
        type: json['type'] as String? ?? '미분류',
        relation: json['relation'] as String,
        profileIcon: json['profileIcon'] as String,
        isFavorite: json['isFavorite'] as bool,
        createdAt: json['createdAt'] as String,
      );
    }).toList();
    // SQLite와 같은 순서로 반환해 홈 목록의 동작을 맞춘다.
    return records..sort((a, b) {
      if (a.isFavorite != b.isFavorite) return a.isFavorite ? -1 : 1;
      final date = b.date.compareTo(a.date);
      if (date != 0) return date;
      final created = b.createdAt.compareTo(a.createdAt);
      return created == 0 ? b.id.compareTo(a.id) : created;
    });
  }

  Map<String, Object?> _body(MoneyRecord record) => {
    'name': record.name,
    'amount': record.amount,
    'date': record.date,
    'mode': record.mode,
    'type': record.type == '미분류' ? null : record.type,
    'relation': record.relation,
    'profileIcon': record.profileIcon,
    'isFavorite': record.isFavorite,
  };

  @override
  Future<void> saveAll(List<MoneyRecord> records) async {
    if (records.isEmpty) return;
    if (records.length > 1) {
      // 빠른 장부는 서버 한 요청에서 처리해 중간에 실패하면 전부 취소된다.
      await _request('POST', 'records/batch', {
        'records': [
          for (final record in records) {'id': record.id, ..._body(record)},
        ],
      });
      return;
    }
    final record = records.single;
    await _request('POST', 'records', {'id': record.id, ..._body(record)});
  }

  Future<void> update(MoneyRecord record) async {
    await _request(
      'PATCH',
      'records/${Uri.encodeComponent(record.id)}',
      _body(record),
    );
  }

  @override
  Future<void> delete(String id) async {
    await _request('DELETE', 'records/${Uri.encodeComponent(id)}');
  }

  @override
  Future<int> restoreMissing(List<MoneyRecord> records) =>
      throw UnsupportedError('서버 데모에서는 파일 복원을 지원하지 않아요.');

  @override
  Future<void> clear() => throw UnsupportedError('서버 데모에서는 전체 삭제를 지원하지 않아요.');
}
