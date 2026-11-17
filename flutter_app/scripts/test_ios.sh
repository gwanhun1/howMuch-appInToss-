#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
sim_id="${1:-$(xcrun simctl list devices booted -j | python3 -c 'import json,sys; ds=[d for group in json.load(sys.stdin)["devices"].values() for d in group if d["state"] == "Booted"]; print(ds[0]["udid"] if ds else "")')}"
[ -n "$sim_id" ] || { echo '먼저 Simulator를 실행하고 기기를 부팅해주세요. 또는 기기 ID를 인자로 주세요.'; exit 1; }
flutter test integration_test/app_test.dart -d "$sim_id"
