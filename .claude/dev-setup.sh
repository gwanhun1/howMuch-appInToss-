#!/bin/bash
# Tmux 세션 초기화 및 dev 서버 실행 스크립트

SESSION_NAME="howmuch-dev"

# 기존 세션 정리
tmux kill-session -t $SESSION_NAME 2>/dev/null

# 새 세션 생성
tmux new-session -d -s $SESSION_NAME -x 220 -y 50

# 윈도우 1: 메인 dev 서버
tmux send-keys -t $SESSION_NAME "npm run dev" Enter

# 윈도우 2: 린트 모니터 (선택사항)
tmux new-window -t $SESSION_NAME
tmux send-keys -t $SESSION_NAME "cd /Users/jeong-gwanhun/Desktop/study/howMuch-appInToss- && npm run lint" Enter

# 윈도우 3: 명령 입력용
tmux new-window -t $SESSION_NAME
tmux send-keys -t $SESSION_NAME "cd /Users/jeong-gwanhun/Desktop/study/howMuch-appInToss-" Enter

echo "✅ Tmux 세션 생성 완료: $SESSION_NAME"
echo "접속: tmux attach-session -t $SESSION_NAME"
echo ""
echo "윈도우:"
echo "  1번: dev 서버 (5173)"
echo "  2번: lint 모니터"
echo "  3번: 명령 입력"
