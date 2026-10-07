#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Package the output of build.sh without executing upstream application code."""
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess, zipfile
PIN = 'a79733eb803fc97084ef0ee4faa96b031e69e1c0'
BUNDLE = '88789c0f547b1c6fd8969bff65ad6facf17af832ef8cde5172d0ef80b82a754d'
p = argparse.ArgumentParser()
p.add_argument('source', type=Path, help='source directory produced by build.sh')
p.add_argument('output', type=Path, help='new output directory')
a = p.parse_args()
src, out = a.source.resolve(), a.output.resolve()
def git(*args):
    return subprocess.check_output(['git', '-C', str(src), *args], text=True).strip()
if git('rev-parse', 'HEAD') != PIN:
    raise SystemExit('Wrong upstream commit')
changes = git('diff', '--name-only', 'HEAD').splitlines()
if any(not x.startswith('dist/') for x in changes):
    raise SystemExit('Unexpected upstream source modifications')
if hashlib.sha256((src/'dist/bundle.js').read_bytes()).hexdigest() != BUNDLE:
    raise SystemExit('Bundle differs from the tested build; review and retest before packaging')
if out.exists():
    raise SystemExit('Choose a new output directory')
site = out/'site'; site.mkdir(parents=True)
for name in ['src', 'dist', 'images']:
    shutil.copytree(src/name, site/name)
for name in ['MIT-LICENSE.txt', 'service-worker.js']:
    shutil.copy2(src/name, site/name)
recipe = Path(__file__).resolve().parent
root = recipe.parents[1]
shutil.copy2(root/'shim/extella-sandbox-shim.js', site/'extella-sandbox-shim.js')
shutil.copy2(recipe/'THIRD_PARTY_NOTICES.md', site/'THIRD_PARTY_NOTICES.md')
h = (src/'index.html').read_text()
if h.count('<head>') != 1:
    raise SystemExit('Unexpected HTML entry')
(site/'index.html').write_text(h.replace('<head>', '<head>\n<script src="./extella-sandbox-shim.js"></script>', 1))
(site/'EXTELLA_CHANGES.md').write_text('''# miniPaint packaging — 2026-10-07

Upstream miniPaint 4.14.3, MIT ViliusL:
https://github.com/viliusle/miniPaint/tree/''' + PIN + '''

Sources of packaging changes, compatibility shim and Docker build recipe:
https://github.com/AnvarBakiyev/extella-browser-apps-source/tree/main/apps/minipaint

Build the pinned upstream lockfile using build.sh, then package with pack.py.
The rebuilt bundle includes AlertifyJS 1.14.0 under GPL-3.0; full license and other dependency notices are in THIRD_PARTY_NOTICES.md. The complete upstream source and dependency source are obtained by build.sh, including node_modules and the pinned lockfile.

Changes: insert the MIT compatibility shim as the first script; retain original source and license files; add full dependency notices and this record. No application logic changes. This is a preparation artifact: the Extella task's NeuQuant license allowlist decision remains pending. That task status imposes no additional restrictions on recipients' rights under the included licenses.
''')
files = sorted(f for f in site.rglob('*') if f.is_file())
if len(files)>500: raise SystemExit('Too many files')
archive = out/'page.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in files:
        info = zipfile.ZipInfo(f.relative_to(site).as_posix(), (2026,10,7,0,0,0))
        info.compress_type = zipfile.ZIP_DEFLATED; info.external_attr = 0o644<<16
        z.writestr(info, f.read_bytes())
if archive.stat().st_size>20*1024*1024: raise SystemExit('Archive too large')
m = dict(upstream=PIN, bundleSha256=BUNDLE, files=len(files), bytes=archive.stat().st_size, sha256=hashlib.sha256(archive.read_bytes()).hexdigest())
(out/'manifest.json').write_text(json.dumps(m,indent=2)+'\n'); print(json.dumps(m))
