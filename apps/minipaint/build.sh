#!/bin/sh
# SPDX-License-Identifier: MIT
# Builds unmodified upstream code only inside a 3 GiB Docker container.
set -eu
if [ "$#" -ne 1 ]; then
  echo 'Usage: sh apps/minipaint/build.sh ABSOLUTE_EMPTY_OUTPUT_DIRECTORY' >&2
  exit 2
fi
case "$1" in /*) ;; *) echo 'Output directory must be absolute.' >&2; exit 2;; esac
mkdir -p "$1"
if [ -n "$(ls -A "$1")" ]; then
  echo 'Output directory must be empty.' >&2
  exit 2
fi
docker run --rm --memory=3g \
  -v "$1:/work" \
  node@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 \
  sh -ec 'apk add --no-cache git
    git clone --no-checkout https://github.com/viliusle/miniPaint.git /work/source
    cd /work/source
    git checkout --detach a79733eb803fc97084ef0ee4faa96b031e69e1c0
    npm ci --no-audit --no-fund
    npm run build
    sha256sum dist/bundle.js dist/bundle.js.LICENSE.txt > /work/build-sha256.txt'
