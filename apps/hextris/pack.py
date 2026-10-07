#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Package the pinned official Hextris browser source; execute no upstream code."""
from pathlib import Path
import argparse, hashlib, json, re, shutil, subprocess, zipfile
PIN = '3f4847dc8fd7dab3d1c87e6324b9159d92fbd396'
parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path, help='clean Git checkout at the pinned commit')
parser.add_argument('output', type=Path, help='new output directory')
args = parser.parse_args()
src, out = args.source.resolve(), args.output.resolve()
def git(*arguments):
    return subprocess.check_output(['git', '-C', str(src), *arguments], text=True).strip()
if git('rev-parse', 'HEAD') != PIN or git('status', '--porcelain', '--untracked-files=all'):
    raise SystemExit('Expected a clean checkout at ' + PIN)
if out.exists():
    raise SystemExit('Output directory already exists; choose a new directory.')
site = out / 'site'
site.mkdir(parents=True)
for name in ['js', 'vendor', 'images']:
    shutil.copytree(src / name, site / name)
(site / 'style').mkdir()
for name in ['style.css', 'rrssb.css']:
    shutil.copy2(src / 'style' / name, site / 'style' / name)
for name in ['a.js', 'index.html', 'LICENSE.md', 'README.md', 'favicon.ico', 'manifest.webmanifest']:
    shutil.copy2(src / name, site / name)
recipe = Path(__file__).resolve().parent
public_root = recipe.parents[1]
shutil.copy2(public_root / 'shim/extella-sandbox-shim.js', site / 'extella-sandbox-shim.js')
shutil.copy2(recipe / 'THIRD_PARTY_NOTICES.md', site / 'THIRD_PARTY_NOTICES.md')
f = site / 'index.html'
h = f.read_text().replace('<head>', '<head><script src="./extella-sandbox-shim.js"></script>', 1)
h = re.sub(r'<link[^>]*(?:fonts.googleapis.com|style/fa/)[^>]*>', '', h)
h = re.sub(r'<script[^>]*pagead2.googlesyndication.com[^>]*></script>', '', h)
h = re.sub(r'<script>\s*\(function\(i,s,o,g,r,a,m\)[\s\S]*?</script>', '', h)
h = h.replace('</body>', '<script src="./extella-file-save.js"></script></body>')
shutil.copy2(recipe / 'extella-file-save.js', site / 'extella-file-save.js')
f.write_text(h)
f = site / 'js/initialization.js'
j, count = re.subn(r'\(function\(i, s, o, g, r, a, m\)[\s\S]*?ga\(\x27send\x27, \x27pageview\x27\);', '', f.read_text())
if count != 1:
    raise SystemExit('Expected exactly one initialization analytics block.')
f.write_text(j)
f = site / 'style/style.css'
f.write_text(re.sub(r'@font-face\s*\{[^}]+\}', '', f.read_text()))
f = site / 'js/main.js'
j = f.read_text().replace('http://hextris.io/a.js', './a.js')
telemetry = "$.get('http://54.183.184.126/' + String(score))"
if j.count(telemetry) != 1:
    raise SystemExit('Expected exactly one game-over score telemetry call.')
f.write_text(j.replace(telemetry, '/* Extella packaging: game-over score telemetry removed. */'))
(site / 'EXTELLA_CHANGES.md').write_text('''# Hextris packaging changes — 2026-10-07

Upstream source: https://github.com/Hextris/hextris/tree/''' + PIN + '''
Copyright (C) 2018 Logan Engstrom; GPL-3.0-or-later. Full license in LICENSE.md.
Packaging recipe and MIT shim source: https://github.com/AnvarBakiyev/extella-browser-apps-source/tree/main/apps/hextris

- Insert the sandbox shim before all upstream scripts.
- Remove both Google Analytics loaders/calls, the advertising loader and game-over score telemetry.
- Omit external and bundled Exo fonts and FontAwesome stylesheet/font files. Existing text labels and keyboard instructions remain; decorative canvas font glyphs are unavailable. Use the browser font fallback.
- Change remote a.js URL to the identical empty a.js supplied by upstream.
- Retain application source, licenses, copyright notices and bundled library notices. No game logic fixes.

User-authorized file persistence adds Save game / Load game / Continue game. Files contain board, incoming blocks, score, high scores, combo, color palette and wave state as validated plain JSON; no imported functions execute. Temporary score labels and screen shake are not retained. Games pause during save/load. Native-window testing remains pending. There are no additional license restrictions on copying, modifying or sharing this GPL application.
''')
files = sorted(f for f in site.rglob('*') if f.is_file())
if len(files) > 500:
    raise SystemExit('Exceeds 500-file limit.')
archive = out / 'page.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in files:
        info = zipfile.ZipInfo(f.relative_to(site).as_posix(), (2026, 10, 7, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        z.writestr(info, f.read_bytes())
if archive.stat().st_size > 20 * 1024 * 1024:
    raise SystemExit('Exceeds 20 MiB limit.')
manifest = {'upstream': PIN, 'files': len(files), 'bytes': archive.stat().st_size,
            'sha256': hashlib.sha256(archive.read_bytes()).hexdigest()}
(out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest))
