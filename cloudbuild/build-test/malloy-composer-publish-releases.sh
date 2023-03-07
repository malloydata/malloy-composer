#!/usr/bin/env sh
set -euxo pipefail

nix-shell --quiet --pure --command "$(cat <<NIXCMD
  set -euxo pipefail
  cd /workspace
  git submodule init
  git submodule update
  npm ci --silent
  npm run server-package -- --all-targets
  npm run create-bundles
NIXCMD
)"
