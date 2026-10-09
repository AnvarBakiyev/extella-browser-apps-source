# Extella browser application corresponding sources

This repository contains full source snapshots, dependency inputs, licenses and packaging recipes for modified browser applications distributed as free private Extella prereleases.

- [miniPaint](apps/minipaint/README.md): combined distribution GPL-3.0-only, including retained GPL AlertifyJS; upstream miniPaint remains MIT.
- [Hextris](apps/hextris/README.md): GPL-3.0-or-later.

Each application directory states the exact upstream revision and includes a SHA-256 source manifest. Extella changes in those directories use the application's distribution license. Upstream copyright/license notices are retained. The shared historical shim outside the application directories remains MIT licensed.

No Extella platform implementation or marketplace credentials are needed to build or package these applications. Publication in the Extella store is controlled separately; source availability imposes no additional restrictions on recipients.
