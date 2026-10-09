#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Package the complete modified source snapshot without executing app code."""
from pathlib import Path
import sys,json,hashlib,zipfile,shutil
root=Path(__file__).resolve().parent
out=Path(sys.argv[1]).resolve()
if out.exists():raise SystemExit('Choose a new output directory')
site=out/'site';site.mkdir(parents=True)
files=json.loads((root/'distribution-files.json').read_text())
for name in files:
 p=site/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/'source'/name,p)
with zipfile.ZipFile(out/'page.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in files:
  i=zipfile.ZipInfo(name,(2026,10,9,0,0,0));i.compress_type=zipfile.ZIP_DEFLATED;i.external_attr=0o644<<16;z.writestr(i,(site/name).read_bytes())
p=out/'page.zip';m={'files':len(files),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
assert m['files']<=500 and m['bytes']<=20*1024*1024
(out/'manifest.json').write_text(json.dumps(m,indent=2));print(json.dumps(m))
