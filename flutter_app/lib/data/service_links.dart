import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

const privacyPolicyUrl =
    'https://small-heather-964.notion.site/41c7443c4245819ab944f6ea48b477f4';
const customerSupportUrl =
    'https://small-heather-964.notion.site/41c7443c4245814db8d6e2a316dcd239';

typedef ExternalLinkOpener = Future<bool> Function(Uri url);

final externalLinkOpenerProvider = Provider<ExternalLinkOpener>(
  (ref) =>
      (url) => launchUrl(url, mode: LaunchMode.externalApplication),
);
