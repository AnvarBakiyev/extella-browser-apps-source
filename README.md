# Extella browser application packaging sources

Public source for the compatibility shim and reproducible packaging changes distributed with open-source browser applications in Extella.

The shim in `shim/extella-sandbox-shim.js` is MIT licensed. It supplies temporary storage in sandboxed windows, disables unsupported native file pickers so applications can use their own fallbacks, and stubs unavailable service workers. IndexedDB is disabled, not emulated. Save work to a file before closing the window.

Application recipes will record the precise upstream version, download integrity, included license notices, and all packaging changes. Upstream code retains its own license. No Extella platform code, credentials, account inventories, or deployment credentials are included here.

## Build recipes under preparation

- [miniPaint 4.14.3](apps/minipaint/README.md): pinned upstream commit and Docker build, with a 3 GiB memory limit. This is build-source preparation, not a released Extella package.
