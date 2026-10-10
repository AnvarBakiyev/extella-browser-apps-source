# minipaint: full corresponding source

Upstream revision: `a79733eb803fc97084ef0ee4faa96b031e69e1c0`. Full modified source: [source](source). Distribution license: **GPL-3.0-only**, including Extella-authored changes in this directory; upstream permissive notices remain intact. See [COPYING](COPYING) and source/THIRD_PARTY_NOTICES.md.

Modified by Extella on 2026-10-09: window compatibility shim and dependency notices; rebuilt the original pinned bundle. AlertifyJS 1.14.0 is retained. The combined distribution is GPL-3.0-only; upstream miniPaint files retain their MIT notices.

`dependencies.tar.gz` contains the exact installed dependency source/build inputs, including AlertifyJS 1.14.0 src and full license. Rebuild offline inside Docker: `sh apps/minipaint/build.sh /absolute/empty/directory`. The original bundle SHA-256 is 88789c0f547b1c6fd8969bff65ad6facf17af832ef8cde5172d0ef80b82a754d. This is the tested bundle included in source/dist.

Generate the page archive using `python3 apps/minipaint/pack.py /absolute/new/output`. `distribution-files.json` is the exact archive member list; `SOURCE_MANIFEST.json` contains source-file hashes. No credentials, deployment or marketplace access is required to inspect or package the source.

The application is free. Marketplace prereleases remain hidden while the distributor seeks the author's response. This does not restrict recipients' rights under the license.

Build-time data attribution: caniuse-lite 1.0.30001788 by Ben Briggs (package author), browser support data from Can I Use by Alexis Deveria and contributors; https://github.com/browserslist/caniuse-lite and https://caniuse.com/ . CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), unchanged. Full license and attribution remain inside the dependency snapshot. This build-time dataset is not loaded by the packaged miniPaint page.

Packaging resolves the full checked-out Git commit and embeds its source URL in EXTELLA_CHANGES.md. Run from a clean Git checkout; source manifests are verified before packaging. The only transformation of this notice template is substitution of the source commit; runtime files are copied unchanged.
