# Hextris packaging source — preparation

This recipe packages the official browser files from commit `3f4847dc8fd7dab3d1c87e6324b9159d92fbd396`. It performs no upstream build and executes no upstream JavaScript. All transformations are visible in `pack.py`: add the shared MIT shim, remove analytics and ads, omit custom font resources, relocate the author's empty remote script to its identical bundled copy, and include notices. No game logic is repaired.

```sh
git clone https://github.com/Hextris/hextris.git /absolute/path/to/hextris
git -C /absolute/path/to/hextris checkout --detach 3f4847dc8fd7dab3d1c87e6324b9159d92fbd396
python3 apps/hextris/pack.py /absolute/path/to/hextris /absolute/path/to/new-output
```

The output contains `site`, `page.zip`, and a size/file-count/SHA-256 manifest. The source checkout must be clean and the output directory must not already exist. The archive retains the main GPL license, copyright attribution and third-party notices. The packaging recipe and shim are MIT licensed; all upstream code retains its own license.

The original game does not export files. This preparation is not an Extella release: the task's export exception and a native-window test remain pending. Omitted icon fonts leave decorative canvas glyphs unavailable; English text instructions and keyboard gameplay remain.

Validation on 2026-10-07: the recipe produced 61 files and a 236,576-byte archive. Chrome opaque-origin sandbox tests passed start, rotation and arrival of a block, online and cold offline, with no page errors or external requests in that workflow. The runtime files match the previously tested package.
