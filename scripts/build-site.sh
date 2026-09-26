#!/usr/bin/env bash
# Assembles the public preview site into _site/ (prototype + design screenshots only).
# docs/ and design sources are NOT published.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf _site && mkdir -p _site/prototype
cp gallery.html _site/index.html
cp prototype/index.html _site/prototype/index.html
for d in designs/*/; do
  mkdir -p "_site/$d"
  cp -r "$d/screenshots" "_site/$d"
done
cp staticwebapp.config.json _site/
echo "Built _site/ ($(find _site -type f | wc -l) files)"
