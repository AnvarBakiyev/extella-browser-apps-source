# Hextris packaging source with file persistence

This recipe packages the official browser files from commit `3f4847dc8fd7dab3d1c87e6324b9159d92fbd396`. It performs no upstream build and executes no upstream JavaScript. All transformations are visible in `pack.py`: add the shared MIT shim, remove analytics, ads and game-over score telemetry, omit custom font resources, relocate the author's empty remote script to its identical bundled copy, and include notices. The user-authorized GPL-3.0-or-later adapter adds file persistence; other game logic is not repaired.

```sh
git clone https://github.com/Hextris/hextris.git /absolute/path/to/hextris
git -C /absolute/path/to/hextris checkout --detach 3f4847dc8fd7dab3d1c87e6324b9159d92fbd396
python3 apps/hextris/pack.py /absolute/path/to/hextris /absolute/path/to/new-output
```

The output contains `site`, `page.zip`, and a size/file-count/SHA-256 manifest. The source checkout must be clean and the output directory must not already exist. The archive retains the main GPL license, copyright attribution and third-party notices. The packaging recipe and shim are MIT licensed; all upstream code retains its own license.

Save game / Load game export and restore board stacks, incoming blocks, score, high scores, combo state, wave generator state and the current color palette. Files are validated plain JSON: imported strings are never evaluated or passed to JSONfn.parse. Trusted upstream constructors restore object methods. Games pause while saved or loaded; Continue game resumes them. Temporary score labels, screen shake and the wall-clock rotation cooldown are not retained. Limits: 2 MB per file, 500 blocks total, 100 blocks per lane. The adapter source is `extella-file-save.js`, licensed GPL-3.0-or-later; the full GPL license is included in the packaged upstream LICENSE.md.

Omitted icon fonts leave decorative canvas glyphs unavailable; English text instructions and keyboard gameplay remain. Native Extella verification and final deployment are still pending.

Validation on 2026-10-07: Chrome opaque-origin sandbox tests passed exact fresh-window JSON roundtrip including two attached blocks, incoming block, score 123, combo multiplier 3, spiral generator and an explicit alternate-color fixture (the upstream color button is absent from this pinned HTML); malformed-file preservation; and rotation after continuing. Both online and cold-offline cases had no page errors or external requests. A separate forced-overflow test exercised the original game-over path and confirmed no score telemetry after its removal. These tests do not establish full gameplay coverage.
