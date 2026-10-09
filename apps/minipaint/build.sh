#!/bin/sh
# SPDX-License-Identifier: GPL-3.0-only
# Build the retained complete source and exact installed dependency snapshot.
set -eu
case "$1" in /*) ;; *) echo 'Supply an absolute empty output directory'; exit 2;; esac
mkdir -p "$1"
test -z "$(ls -A "$1")"
recipe_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cp -R "$recipe_dir/source/." "$1/"
tar -xzf "$recipe_dir/dependencies.tar.gz" -C "$1"
docker run --rm --network=none --memory=3g -v "$1:/work" -w /work node@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 npm run build
