# Endurance Forge Web v0.4.0 — Public Beta

Browser-local treadmill and endurance activity analysis for FIT, TCX, and GPX files.

## v0.4.0 — Multi-run aerobic inference
- Adds a combined EF Aerobic Fitness Estimate across qualifying treadmill runs.
- Each run is analyzed independently before combination; the model does not blindly average single-run estimates.
- Adds per-run treadmill truth inputs (distance, time, and grade) and run inclusion controls on Compare Runs.
- Uses a shared locally stored maximum/resting HR profile across selected activities.
- Fits workload oxygen reserve against HR-reserve fraction using quality/drift weighting plus iterative robust residual weighting.
- Reports qualifying-run count, workload span, run-to-run MAD, and multi-run inference confidence.
- High inference confidence requires corroboration across at least three suitable runs with workload diversity and close agreement.
- Adds a workload-vs-HRR visualization with the fitted combined EF relationship.
- Expands Metrics Guide and Methodology with the multi-run logic, equations, eligibility rules, confidence interpretation, and limitations.
- Adds a subtle application version identifier in the site footer for public-beta troubleshooting and release verification.

## v0.3.6 — Visualization and interface polish
- Adds Endurance Forge favicon and touch icons across all routes.
- Adds a workout timeline showing warm-up, sustained run, drift-analysis segment, and stable fitness window.
- Adds first-half vs second-half heart-rate and speed visualization for HR drift / aerobic decoupling.
- Adds a heart-rate-reserve visualization for the stable fitness window.
- Adds Compare Runs visual summaries for average HR and workload-normalized drift.
- Includes small public-copy cleanup; no analytics or estimation-method changes from v0.3.5.

## v0.3.5 — Search and SEO readiness
- Adds `sitemap.xml` and `robots.txt` for search-engine discovery.
- Adds indexable routes for Home, Analyze, Compare Runs, Metrics Guide, and Methodology.
- Adds page-specific titles, descriptions, canonical URLs, Open Graph metadata, and basic WebApplication structured data.
- Adds browser history/back-button support for application navigation.
- No analytics or estimation-method changes from v0.3.4.

## v0.3.4 — Public copy cleanup
- Cleans public-facing copy to remove release-note, roadmap, and internal-development language.
- Removes repeated version numbers from normal page headings.
- Reframes beta status, methodology, confidence limitations, privacy, and feedback for runners.
- No analytics or estimation-method changes from v0.3.3.

## v0.3.3 — Project support
- Adds optional project-support links to the site footer and Methodology page.
- Support destination: Buy Me a Coffee for Endurance Forge.
- No analytics or estimation-method changes from v0.3.2.

## Public-beta focus
- Explicitly defines EF Aerobic Fitness Estimate as a **treadmill-derived VO₂max-equivalent estimate**.
- Provides a dedicated **Metrics Guide** with plain-language interpretation.
- Publishes the **Methodology**, including equations, assumptions, stable-window logic, confidence, limitations, and multi-run inference logic.
- Keeps raw FIT, TCX, and GPX processing local to the browser.

## Important interpretation
EF Aerobic Fitness is comparable to VO₂max in concept and units (mL/kg/min), but is not a direct oxygen-consumption measurement and is not claimed to be interchangeable with laboratory or device-manufacturer VO₂max.

The multi-run result remains a treadmill-derived VO₂max-equivalent analytical estimate. Multiple qualifying runs can improve internal corroboration and inference confidence, but they do not convert the estimate into a laboratory measurement.

## Privacy
Raw FIT, TCX, and GPX files are parsed and analyzed in the browser. Physiological profile values are stored in browser-local storage.

## Development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

Cloudflare Pages build output: `dist`.
