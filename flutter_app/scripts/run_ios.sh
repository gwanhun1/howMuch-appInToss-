#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v flutter >/dev/null || { echo 'Flutter를 설치해주세요: brew install --cask flutter'; exit 1; }
open -a Simulator
sim_id="${1:-$(xcrun simctl list devices available -j | python3 -c 'import json,sys; ds=[d for group in json.load(sys.stdin)["devices"].values() for d in group if "iPhone" in d["name"]]; print(next((d["udid"] for d in ds if d["state"] == "Booted"), ds[0]["udid"] if ds else ""))')}"
[ -n "$sim_id" ] || { echo 'Xcode > Settings > Components에서 iOS Simulator를 설치해주세요.'; exit 1; }
if ! xcrun simctl list devices booted | grep -q "$sim_id"; then xcrun simctl boot "$sim_id"; fi
xcrun simctl bootstatus "$sim_id" -b
flutter pub get
flutter run -d "$sim_id"
