#!/bin/zsh

set -e

cd "/Users/guangyuan/Documents/Finance/算命工具"

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
