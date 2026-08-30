# Endurance Forge Web v0.2.0

Local-first treadmill and running-performance analysis for FIT, TCX, and GPX activity files.

## Architecture

Source files are parsed by format adapters into a normalized Endurance Forge activity model. Analysis code consumes that model rather than format-specific structures.

Supported analysis inputs:
- FIT
- TCX
- GPX

Current corrected-file export:
- FIT

TCX and GPX support treadmill-authoritative distance/time/grade for analysis now; rewritten file exporters are intentionally deferred.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Vite writes the static production site to `dist/`.

## Privacy

The current app reads activity files through the browser File API. Raw files do not need to be sent to an Endurance Forge server.
