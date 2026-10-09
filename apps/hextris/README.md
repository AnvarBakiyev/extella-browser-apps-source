# hextris: full corresponding source

Upstream revision: `3f4847dc8fd7dab3d1c87e6324b9159d92fbd396`. Full modified source: [source](source). Distribution license: **GPL-3.0-or-later**, including Extella-authored changes in this directory; upstream permissive notices remain intact. See [COPYING](COPYING) and source/THIRD_PARTY_NOTICES.md.

Modified by Extella on 2026-10-09: window compatibility shim and validated JSON save/load; removed telemetry and advertising, omitted decorative fonts, and used the bundled copy of the empty remote script.

No application build is needed: the source tree contains the original JavaScript and the full unminified save adapter. The complete preferred source is available directly in source/. Other game logic is unchanged.

Generate the page archive using `python3 apps/hextris/pack.py /absolute/new/output`. `distribution-files.json` is the exact archive member list; `SOURCE_MANIFEST.json` contains source-file hashes. No credentials, deployment or marketplace access is required to inspect or package the source.

The application is free. Marketplace prereleases remain hidden while the distributor seeks the author's response. This does not restrict recipients' rights under the license.
