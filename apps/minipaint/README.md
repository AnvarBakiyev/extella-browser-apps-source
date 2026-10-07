# miniPaint build source (preparation; not a released package)

Upstream: https://github.com/viliusle/miniPaint/tree/a79733eb803fc97084ef0ee4faa96b031e69e1c0

Version 4.14.3. The pinned lockfile installs AlertifyJS 1.14.0 under GPL-3.0, in addition to MIT and other dependencies. Upstream's top-level MIT license is not a complete dependency license inventory.

`build.sh` retrieves this exact upstream commit and runs `npm ci` and `npm run build` in Docker with a 3 GiB memory limit. It uses a pinned Node 22 Alpine image digest. The output contains the complete source checkout, lockfile, installed dependencies and generated `dist` files, plus build hashes. Git and its Alpine dependencies are obtained from the image's configured package repository; they are not frozen separately. Bit-for-bit reproducibility across architectures is not promised.

Run from a checkout of this repository:

```sh
sh apps/minipaint/build.sh /absolute/path/to/empty/build-directory
```

Two fresh builds from this commit and lockfile completed on 2026-10-07, including an end-to-end invocation of this recipe. Both generated bundle SHA-256 `88789c0f547b1c6fd8969bff65ad6facf17af832ef8cde5172d0ef80b82a754d`. Real Chrome tests of the rebuilt app in an opaque-origin sandbox passed drawing, JSON export/reimport and PNG export online and cold offline. No app logic changes were made.

Package the tested build with:

```sh
python3 apps/minipaint/pack.py /absolute/path/to/build-directory/source /absolute/path/to/new/package-directory
```

The packer checks the upstream commit, source changes and tested bundle hash. It adds the first-script shim and full notices without application logic edits, then emits a deterministic ZIP and manifest within the 20 MiB / 500-file limits. All modifications are represented by these scripts and the shared shim. Source for npm dependencies is installed under `node_modules` by the pinned build recipe; AlertifyJS source is available there and at https://registry.npmjs.org/alertifyjs/-/alertifyjs-1.14.0.tgz .

No miniPaint Extella prerelease is supplied yet. NeuQuant licensing clarification remains pending. This build recipe and the shared compatibility shim are MIT licensed; upstream files retain their respective licenses.
