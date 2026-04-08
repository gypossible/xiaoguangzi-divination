#!/bin/zsh

set -e

cd "/Users/guangyuan/Documents/Finance/算命工具"

MODEL_NAME="deepseek-r1:8b"
OLLAMA_API="http://127.0.0.1:11434/api/tags"
OLLAMA_LOG="/tmp/xiaoguangzi-ollama.log"

ensure_ollama_service() {
  if ! command -v ollama >/dev/null 2>&1; then
    echo "未检测到 ollama，问命引擎暂不可用。"
    return 1
  fi

  if curl -fsS "$OLLAMA_API" >/dev/null 2>&1; then
    return 0
  fi

  nohup ollama serve >"$OLLAMA_LOG" 2>&1 &

  for _ in {1..20}; do
    sleep 1
    if curl -fsS "$OLLAMA_API" >/dev/null 2>&1; then
      return 0
    fi
  done

  echo "本地问命引擎未能顺利启动。"
  return 1
}

ensure_ollama_model() {
  if ! command -v ollama >/dev/null 2>&1; then
    return 1
  fi

  if ollama list | awk 'NR > 1 { print $1 }' | grep -qx "$MODEL_NAME"; then
    return 0
  fi

  echo "正在准备本地问命引擎，请稍候..."
  ollama pull "$MODEL_NAME"
}

ensure_local_fortune_engine() {
  ensure_ollama_service || return 0
  ensure_ollama_model || return 0
}

ensure_local_fortune_engine

if lsof -i tcp:4173 -sTCP:LISTEN >/dev/null 2>&1; then
  open "http://127.0.0.1:4173/"
  exit 0
fi

if [ ! -d node_modules ]; then
  npm install
fi

npm run build
open "http://127.0.0.1:4173/"
npm run start
