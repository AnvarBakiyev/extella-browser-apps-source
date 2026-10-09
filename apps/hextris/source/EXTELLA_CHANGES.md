# hextris: modified browser distribution

Modified by Extella on 2026-10-09: window compatibility shim and validated JSON save/load; removed telemetry and advertising, omitted decorative fonts, and used the bundled copy of the empty remote script.

Distribution license: GPL-3.0-or-later. Full text: COPYING. Original copyright and dependency notices are preserved. Extella-authored modifications in this application directory are licensed under GPL-3.0-or-later.

Exact upstream revision: 3f4847dc8fd7dab3d1c87e6324b9159d92fbd396.
Corresponding source, all packaging changes and the build recipe are in this directory:
https://github.com/AnvarBakiyev/extella-browser-apps-source/tree/main/apps/hextris
The commit-pinned source URL is supplied in the listing. SOURCE_MANIFEST.json identifies every source file by SHA-256. A distribution is generated only from this source tree by pack.py.

This package is free of charge. No additional restrictions on copying, modification or redistribution are imposed. Private prerelease status is the distributor's publication workflow, not a restriction on recipients' license rights.

Download correction on 2026-10-09: the save adapter now clicks a detached download anchor, matching the standard browser file-download pattern. This prevents document-level navigation handling from sending a local Blob URL through a network proxy. Game state serialization and game logic are unchanged.
