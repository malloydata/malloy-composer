#!/usr/bin/env sh
set -euxo pipefail

nix-shell --quiet --pure --command "$(cat <<NIXCMD
  set -euxo pipefail
  cd /workspace
  git remote set-url origin git@github.com:malloydata/malloydata.github.io
  git config --global user.email "malloy-ci-bot@google.com"
  git config --global user.name "Malloy CI Bot"
  npm ci --silent
  bundle install
  npm run docs-deploy
  git checkout -b docs-release
  git add -f duckdb-wasm/idst
  git mv duckdb-wasm docs
  git commit -m "Docs Release"
  git push -f origin docs-release
NIXCMD
)"
