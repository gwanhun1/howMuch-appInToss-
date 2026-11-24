import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

import '../app.dart';
import '../data/api_record_repository.dart';
import '../state/records.dart';

class ApiLogin extends StatefulWidget {
  const ApiLogin({
    super.key,
    required this.address,
    this.origin,
    this.onReturnToLocal,
  });
  final String address;
  final String? origin;
  final VoidCallback? onReturnToLocal;

  @override
  State<ApiLogin> createState() => _ApiLoginState();
}

class _ApiLoginState extends State<ApiLogin> {
  final username = TextEditingController();
  final password = TextEditingController();
  ApiRecordRepository? repository;
  bool loading = false;
  bool registering = false;
  bool consent = false;

  bool get publicBuild => Uri.tryParse(widget.address)?.scheme == 'https';
  Uri? get policy => Uri.tryParse(apiPrivacyUrl);
  bool get hasPolicy =>
      policy?.scheme == 'https' && (policy?.host.isNotEmpty ?? false);
  String? error;

  @override
  void dispose() {
    repository?.close();
    username.dispose();
    password.dispose();
    super.dispose();
  }

  void endSession(String? message) {
    if (!mounted) return;
    final previous = repository;
    setState(() {
      repository = null;
      error = message;
    });
    previous?.close();
  }

  Future<void> signIn() async {
    if (loading || username.text.trim().isEmpty || password.text.isEmpty) {
      return;
    }
    final uri = Uri.tryParse(widget.address);
    if (uri == null ||
        uri.host.isEmpty ||
        !(uri.scheme == 'https' ||
            (kDebugMode &&
                uri.scheme == 'http' &&
                {'127.0.0.1', 'localhost', '10.0.2.2'}.contains(uri.host)))) {
      setState(() => error = 'HTTPS 주소나 디버그용 루프백 주소를 설정해주세요.');
      return;
    }
    if (registering && (!consent || !hasPolicy)) {
      setState(() => error = '개인정보 수집 및 이용 안내를 확인하고 동의해주세요.');
      return;
    }
    setState(() {
      loading = true;
      error = null;
    });
    final next = ApiRecordRepository(
      widget.address,
      origin: widget.origin,
      onSessionExpired: () => endSession('로그인이 만료됐어요. 다시 로그인해주세요.'),
    );
    try {
      if (registering) {
        if (!RegExp(r'^[a-zA-Z0-9_-]{3,40}$').hasMatch(username.text.trim()) ||
            password.text.length < 12 ||
            password.text.length > 256) {
          throw const RecordApiException(
            '아이디는 영문·숫자·밑줄·하이픈 3~40자, 비밀번호는 12~256자로 입력해주세요.',
          );
        }
        await next.register(username.text.trim(), password.text);
        if (mounted) setState(() => registering = false);
      }
      await next.login(username.text.trim(), password.text);
      if (!mounted) {
        next.close();
        return;
      }
      password.clear();
      setState(() => repository = next);
    } catch (failure) {
      next.close();
      if (mounted) {
        setState(
          () => error = failure is RecordApiException
              ? failure.message
              : '로그인하지 못했어요. 서버 설정을 확인해주세요.',
        );
      }
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (repository case final active?) {
      return ProviderScope(
        key: ObjectKey(active),
        overrides: [
          repositoryProvider.overrideWithValue(active),
          apiReturnToLocalProvider.overrideWithValue(widget.onReturnToLocal),
          if (publicBuild)
            apiDeleteAccountProvider.overrideWithValue((password) async {
              await active.deleteAccount(password);
              endSession(null);
            }),
          apiLogoutProvider.overrideWithValue(() async {
            await active.logout();
            endSession(null);
          }),
        ],
        child: const HowMuchApp(),
      );
    }
    return MaterialApp(
      home: Scaffold(
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 360),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      publicBuild ? '얼마냈지요' : '얼마냈지요 서버 데모',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      publicBuild
                          ? '계정에 기록을 저장하고 다시 불러올 수 있어요.'
                          : '연습용 기록을 Oracle 서버에 저장해요.',
                    ),
                    const SizedBox(height: 20),
                    TextField(
                      controller: username,
                      decoration: const InputDecoration(labelText: '아이디'),
                    ),
                    TextField(
                      controller: password,
                      decoration: const InputDecoration(labelText: '비밀번호'),
                      obscureText: true,
                      onSubmitted: (_) => signIn(),
                    ),
                    if (registering) ...[
                      const SizedBox(height: 16),
                      const Text(
                        '아이디와 비밀번호는 계정과 기록을 관리하는 데 사용돼요. '
                        '비밀번호는 해시로 보관하며, 계정을 삭제하면 서버에 저장된 계정과 기록이 삭제돼요. '
                        '동의를 거부할 수 있으며, 이 경우 서버 계정을 만들 수 없어요.',
                      ),
                      CheckboxListTile(
                        contentPadding: EdgeInsets.zero,
                        value: consent,
                        onChanged: loading
                            ? null
                            : (value) =>
                                  setState(() => consent = value ?? false),
                        title: const Text('개인정보 수집 및 이용에 동의해요 (필수)'),
                      ),
                    ],
                    if (publicBuild && hasPolicy)
                      TextButton(
                        onPressed: () async {
                          if (!await launchUrl(
                                policy!,
                                mode: LaunchMode.externalApplication,
                              ) &&
                              mounted) {
                            setState(() => error = '개인정보처리방침을 열지 못했어요.');
                          }
                        },
                        child: const Text('개인정보처리방침'),
                      ),
                    if (error case final message?) ...[
                      const SizedBox(height: 12),
                      Text(message, style: const TextStyle(color: Colors.red)),
                    ],
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: loading ? null : signIn,
                      child: Text(
                        loading ? '연결 중…' : (registering ? '가입하기' : '로그인'),
                      ),
                    ),
                    if (publicBuild && hasPolicy)
                      TextButton(
                        onPressed: loading
                            ? null
                            : () => setState(() {
                                registering = !registering;
                                consent = false;
                                error = null;
                              }),
                        child: Text(registering ? '로그인으로 돌아가기' : '계정 만들기'),
                      ),
                    if (widget.onReturnToLocal != null)
                      TextButton(
                        onPressed: loading ? null : widget.onReturnToLocal,
                        child: const Text('기기 기록으로 돌아가기'),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
