#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[ "$(uname -s)" = Darwin ] || { echo 'iOS Release 준비는 Xcode가 설치된 Mac에서 실행해주세요.'; exit 1; }
command -v flutter >/dev/null || { echo 'Flutter를 설치해주세요.'; exit 1; }
xcrun --find xcodebuild >/dev/null
bash scripts/check.sh
flutter build ipa --release --no-codesign
python3 scripts/inspect_ios_archive.py
