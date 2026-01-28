#!/usr/bin/env sh
# shellcheck shell=sh
set -eu

if [ -n "${HUSKY-}" ]; then
  export PATH="$HUSKY:$PATH"
fi
