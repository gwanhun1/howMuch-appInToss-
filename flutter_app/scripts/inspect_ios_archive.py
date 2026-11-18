#!/usr/bin/env python3
"""Check the local release archive without reading credentials or uploading it."""
import argparse
import json
import plistlib
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--archive', type=Path, default=ROOT / 'build/ios/archive/Runner.xcarchive')
parser.add_argument('--bundle-id', default='com.howmuchjournal.howmuch')
args = parser.parse_args()
archive = args.archive.resolve()
app = archive / 'Products/Applications/Runner.app'
if not (app / 'Info.plist').is_file():
    raise SystemExit('Release 아카이브가 없습니다. bash scripts/prepare_ios_release.sh를 실행해주세요.')
with (app / 'Info.plist').open('rb') as stream:
    info = plistlib.load(stream)
version_match = re.search(r'^version:\s*(\S+)', (ROOT / 'pubspec.yaml').read_text(), re.MULTILINE)
version, build = version_match.group(1).split('+')
checks = {
    'bundle_id_matches': info.get('CFBundleIdentifier') == args.bundle_id,
    'device_sdk_archive': info.get('DTPlatformName') == 'iphoneos',
    'version_matches': info.get('CFBundleShortVersionString') == version,
    'build_number_matches': info.get('CFBundleVersion') == build,
    'aot_framework_present': (app / 'Frameworks/App.framework/App').is_file(),
    'flutter_engine_present': (app / 'Frameworks/Flutter.framework/Flutter').is_file(),
    'debug_kernel_absent': not (app / 'Frameworks/App.framework/flutter_assets/kernel_blob.bin').exists(),
    'debug_symbols_present': bool(list((archive / 'dSYMs').glob('*.dSYM'))),
}
privacy = []
for path in sorted(app.rglob('PrivacyInfo.xcprivacy')):
    with path.open('rb') as stream:
        data = plistlib.load(stream)
    privacy.append({
        'path': str(path.relative_to(app)),
        'tracking': data.get('NSPrivacyTracking'),
        'collected_data_types': data.get('NSPrivacyCollectedDataTypes', []),
        'accessed_api_types': data.get('NSPrivacyAccessedAPITypes', []),
    })
checks['privacy_manifests_present'] = bool(privacy)
# A non-zero signing inspection is expected for the unsigned preparation build.
signature = subprocess.run(['codesign', '-dv', str(app)], capture_output=True, text=True)
report = {
    'bundle_id': info.get('CFBundleIdentifier'),
    'version': info.get('CFBundleShortVersionString'),
    'build': info.get('CFBundleVersion'),
    'minimum_ios': info.get('MinimumOSVersion'),
    'device_family': info.get('UIDeviceFamily'),
    'checks': checks,
    'privacy_manifests': privacy,
    'code_signature_present': signature.returncode == 0,
    'provisioning_profile_present': (app / 'embedded.mobileprovision').is_file(),
    'distribution_validation': 'not_performed',
    'uploaded': False,
    'note': 'This checks local archive structure only. Signing, provisioning and App Store validation are separate.',
}
output = ROOT / 'build/ios/release-readiness.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
for name, passed in checks.items():
    print(f'{"PASS" if passed else "FAIL"}: {name}')
print(f'개인정보 manifest: {len(privacy)}개')
print(f'검사 보고서: {output}')
print(f'아카이브: {archive}')
print('앱 배포 서명·프로비저닝과 App Store 검증·업로드는 별도로 진행해야 합니다.')
if not all(checks.values()):
    raise SystemExit(1)
