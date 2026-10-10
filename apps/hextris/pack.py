#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
"""Package the complete modified source snapshot without executing app code."""
from pathlib import Path
import sys,json,hashlib,zipfile,shutil,subprocess,re
root=Path(__file__).resolve().parent
out=Path(sys.argv[1]).resolve()
# Resolve the checked-out source commit before generating output. Never pin a branch name.
repo=root.parents[1]
commit=subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip()
assert re.fullmatch(r'[0-9a-f]{40}',commit)
subprocess.run(['git','-C',str(repo),'diff','--quiet','HEAD','--',str(root)],check=True)
manifest=json.loads((root/'SOURCE_MANIFEST.json').read_text())
for name,digest in manifest['files'].items():
 assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,name
source_url='https://github.com/AnvarBakiyev/extella-browser-apps-source/tree/'+commit+'/apps/'+root.name
if out.exists():raise SystemExit('Choose a new output directory')
site=out/'site';site.mkdir(parents=True)
files=json.loads((root/'distribution-files.json').read_text())
for name in files:
 p=site/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/'source'/name,p)
changes=site/'EXTELLA_CHANGES.md'
notice=changes.read_text()
assert notice.count('__SOURCE_COMMIT__')==1
changes.write_text(notice.replace('__SOURCE_COMMIT__',commit))
with zipfile.ZipFile(out/'page.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in files:
  i=zipfile.ZipInfo(name,(2026,10,9,0,0,0));i.compress_type=zipfile.ZIP_DEFLATED;i.external_attr=0o644<<16;z.writestr(i,(site/name).read_bytes())
p=out/'page.zip';m={'files':len(files),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'source_commit':commit,'source_url':source_url}
assert m['files']<=500 and m['bytes']<=20*1024*1024
(out/'manifest.json').write_text(json.dumps(m,indent=2));print(json.dumps(m))
