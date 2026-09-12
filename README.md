# Endurance Forge

**Advanced Running Analytics** for FIT, TCX, and GPX activities.

Endurance Forge is a browser-based running analytics project for outdoor and treadmill running. It focuses on physiological response, pace, running dynamics, workout structure, and multi-run patterns, while retaining unusually deep treadmill support such as corrected distance/time, grade-aware workload modeling, indoor environment context, and the EF Aerobic Fitness Estimate.

Raw activity files are processed locally in the browser.

## v0.5.7 — Incremental multi-run loading and compact environment controls

- Compare Runs now **adds newly selected activity files to the existing comparison** instead of replacing the current set.
- Duplicate files are ignored when their file identity matches an activity already loaded.
- The upload area changes to **Add more FIT, TCX, or GPX files** after the first batch is loaded.
- The optional Environment panel on single-run Analyze is now collapsible and starts closed unless saved environmental values already exist.
- The optional indoor Environment table on Compare Runs is also collapsible and starts closed.
- Environmental calculations, persistence, heat-map behavior, and treadmill/outdoor separation are unchanged.

## v0.4.8 — Environmental context and multi-run heat maps

- Adds optional start/end indoor temperature and relative-humidity inputs for treadmill runs, with °F/°C support and derived dew point.
- Stores environmental inputs locally with each run and makes them available in Compare Runs.
- Uses environment as interpretive/comparative context only; it does **not** alter the EF Aerobic Fitness Estimate.
- Adds a Run Pattern Heat Map after 8 selected runs, using each runner’s median and MAD to highlight robust deviations from their own baseline rather than universal good/bad thresholds.
- Adds a Metric Relationship Heat Map for exploratory pairwise associations across EF, HRR, HR drift, pace, supported running dynamics, and dew point when sufficient paired data exist.
- Labels heat-map patterns as emerging below 15 runs, leaves missing data neutral, and explicitly warns that correlations do not establish causation.
- Keeps all environmental and activity data browser-local.

## v0.4.6 — Garmin running-dynamics summary alignment

- Corrects Garmin FIT record-field mappings for fractional cadence, Vertical Ratio, Ground Contact Time Balance, and Step Length.
- Reads FIT session-level running-dynamics averages when available so Endurance Forge can display the activity average recorded in the FIT file.
- Adds **Activity avg** to the Early vs Late Running Dynamics table alongside Early, Late, and Change.
- Displays Ground Contact Time Balance in Garmin-style paired form, e.g. `44.1% L / 55.9% R`, rather than showing only the left-side percentage.
- Reports Vertical Ratio and GCT Balance changes in percentage points, while preserving relative-percent change for other applicable metrics.
- Keeps Endurance Forge Early/Late values distinct from the recorded activity average: the activity average summarizes the whole FIT activity, while Early/Late are calculated from the first and final thirds of the selected running segment.
- Verified against a Garmin FIT activity whose recorded summaries include 8.4% average Vertical Ratio, 44.1% L / 55.9% R average GCT Balance, 7.3 cm Vertical Oscillation, 283 ms Ground Contact Time, and 0.85 m Step Length.

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


## v0.4.8 mixed-run comparison
- Compare treadmill and outdoor runs in one multi-run workspace.
- Automatically classifies activities with detected GPS tracks as Outdoor; other runs default to Treadmill and can be changed manually.
- Outdoor runs contribute pace, heart-rate, drift, running-dynamics, and heat-map context but never enter the treadmill-derived EF Aerobic Fitness model.
- Mixed heat maps calculate deviation against separate treadmill and outdoor personal baselines.
- The relationship heat map standardizes metrics within run type before mixed-type correlations are calculated.
- Optional temperature/humidity remains specific to indoor/treadmill sessions.
- FIT import now reads record-position latitude/longitude so outdoor FIT activities can be recognized from GPS data when position fields are present.


## v0.5.7 analysis additions
- Pace–HR efficiency from speed relative to heart-rate reserve, including first-half vs second-half change.
- Expanded HR-reserve intensity summary.
- Outdoor elevation gain/loss/range from a smoothed altitude trace.
- Running-power summary and first-half vs second-half progression when power exists.
- Rule-based Run Insights tied directly to reported metrics.
- Pace/HRR efficiency added to Multi-Run run-by-run results and personal-baseline heat maps.
- Outdoor charts and virtual laps now use outdoor-appropriate wording.


## v0.5.7 multi-run overview
- New Multi-Run Snapshot with run counts, distance/time totals and robust median values for pace, HR, HRR, Pace/HRR efficiency and aerobic decoupling.
- New Across-Run Insights with expandable “Why?” explanations.
- New Pace–HR Efficiency longitudinal trend.
- New Aerobic Decoupling longitudinal trend.
- New Pace vs HRR scatter plot.
- New selectable Running Dynamics Trend for cadence, stride length, GCT, vertical ratio, vertical oscillation and running power.
- All Runs / Treadmill / Outdoor filtering for the new dashboard.
- Mixed-run trend lines stay separated by run type rather than fitting one misleading combined relationship.
- Existing heat maps remain as complementary “what was unusual?” and “what moves together?” views.


## v0.5.7 virtual-lap visualization

- Replaces the ambiguous single-line virtual-lap chart with two aligned, clearly labeled charts.
- Upper chart always shows pace by virtual lap.
- Lower chart defaults to Average Heart Rate and can be switched to HRR, cadence, stride length, ground-contact time, or vertical ratio.
- Each chart has its own Y-axis labels and units; the two metrics are not forced onto a misleading shared numeric scale.
- Virtual-lap numbers are shared across the aligned charts.
- Hovering a plotted point exposes complete lap details through the browser tooltip.
- The detailed virtual-lap table remains below the charts.


## v0.5.7 chart visibility update

- Reworked Multi-Run chart colors for strong contrast on the dark interface.
- Treadmill points/lines now use a bright blue/cyan treatment.
- Outdoor points/lines now use a light gray treatment.
- Scatter points are slightly larger and all chart points use stronger outlines.
- Hovered points receive a brighter highlight for easier inspection.
- Trend legends now use the same visible marker colors as the plotted data.


## v0.5.7 chart styling refinement

- Reduced Multi-Run longitudinal trend line width from the heavier v0.5.6 presentation to a thinner 1.55 px treatment.
- Keeps the high-contrast treadmill/outdoor colors and visible data points introduced in v0.5.6.
- Applies consistently to Pace–HR Efficiency, Aerobic Decoupling, and Running Dynamics trend charts.
- Scatter-plot markers and chart calculations are unchanged.
