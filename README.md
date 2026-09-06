# Endurance Forge Web v0.4.5 — Public Beta

Browser-local treadmill and endurance activity analysis for FIT, TCX, and GPX files.


## v0.4.5 — iPhone/iPad file-picker compatibility

- Removes the HTML file-picker `accept` restriction that could cause FIT files in iCloud Drive to appear dimmed and unselectable on iOS/iPadOS.
- Endurance Forge now lets the operating-system file picker return a file first, then validates the filename extension inside the app.
- FIT, TCX, and GPX remain the only supported activity formats; unsupported selections receive the existing clear validation error.
- Applies to both **Analyze** and **Compare Runs** upload controls.
- Resets the file input after each selection so the same file can be selected again after an error or retry.
- Updates the site release identifier to `PUBLIC BETA · v0.4.5 · LOCAL-FIRST`.

## v0.4.3 — Performance-neutral evidence eligibility

- Makes an explicit methodological guarantee that runs are never excluded because they were slow, difficult, unusually high-HR, low-performing, or produced a high/low valid EF estimate.
- Defines exclusion as an **evidence-adequacy/model-applicability** decision rather than a performance-quality decision.
- Keeps technically valid off-days in the combined fitness picture; discordant valid observations are handled through weighting and robust residual weighting rather than rejection.
- Adds a prominent Compare Runs note explaining that exclusion is based on evidence adequacy, not running performance.
- Adds the same principle to Metrics Guide and Methodology so the policy is public and auditable.
- Shows stable-window durations as `mm:ss` near 10:00/12:00 thresholds to avoid contradictory-looking rounded labels.
- Updates the site release identifier to `PUBLIC BETA · v0.4.3 · LOCAL-FIRST`.

## v0.4.2 — Activity visualization and virtual laps

- Displays the release number in the site header: `PUBLIC BETA · v0.4.2 · LOCAL-FIRST`.
- Remembers treadmill grade locally and warns when grade is left at 0%, reducing silent workload-input mistakes.
- Remembers distance/time/grade for previously analyzed files in the same browser.
- Adds corrected-distance Pace + Heart Rate progression with stable EF-window shading.
- Adds configurable Virtual Lap Analysis (default 0.25 mi) with pace, HR, HRR, cadence, stride length, ground-contact time, and vertical-ratio columns when available.
- Adds running-dynamics progression for cadence, stride length, ground-contact time, vertical oscillation, vertical ratio, and ground-contact balance when present in the source activity.
- Adds Heart-Rate Reserve zone distribution for the detected running segment.
- Adds Early vs Late Running Dynamics Change to distinguish cardiovascular change from simultaneous mechanical change without labeling it as fatigue.
- Extends native FIT parsing for common running-dynamics record fields and derives stride length from corrected speed/cadence when appropriate.


## v0.4.1 — Evidence transparency and multi-run eligibility
- Adds explicit **Primary**, **Supporting**, and **Excluded** evidence classifications for every run in Compare Runs.
- Adds a plain-language **why** explanation beside each run so users can see exactly why its model influence is full, reduced, or zero.
- Requires at least a 10-minute stable EF window for multi-run inclusion; shorter single-run estimates remain visible but are excluded from the combined model.
- Down-weights, rather than automatically rejects, usable high-HRR observations near the upper model boundary.
- Makes Supporting evidence explicit for shorter windows, Low data/inference quality, substantial drift, and edge-range HRR.
- High multi-run confidence now requires at least two Primary-evidence observations in addition to workload diversity and agreement requirements.
- Adds quantitative HRR and workload O₂ axis ticks to the multi-run relationship chart and visually distinguishes Primary from Supporting points.
- Updates Methodology to publish the evidence-tier rules and thresholds.

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


## v0.4.5 — Scientific basis

Adds EF-TN-001, a cited technical justification for the EF Aerobic Fitness Estimate, including derivation, validation literature, contrary evidence, model limitations, and explicit external-validation requirements. Single-run inference is now reduced to Low when the ACSM running workload equation is applied below its conventional ~5 mph running domain; this is a model-domain caution, not a judgment of running performance.
