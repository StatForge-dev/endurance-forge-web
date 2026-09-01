# Endurance Forge Web v0.3.5 — Public Beta

Browser-local treadmill and endurance activity analysis for FIT, TCX, and GPX files.

## v0.3.6
- Adds Endurance Forge favicon and touch icons across all routes.
- Adds a workout timeline showing warm-up, sustained run, drift-analysis segment, and stable fitness window.
- Adds first-half vs second-half heart-rate and speed visualization for HR drift / aerobic decoupling.
- Adds a heart-rate-reserve visualization for the stable fitness window.
- Adds Compare Runs visual summaries for average HR and workload-normalized drift.
- Includes small public-copy cleanup; no analytics or estimation-method changes from v0.3.5.

## v0.3.5
- Adds `sitemap.xml` and `robots.txt` for search-engine discovery.
- Adds indexable routes for Home, Analyze, Compare Runs, Metrics Guide, and Methodology.
- Adds page-specific titles, descriptions, canonical URLs, Open Graph metadata, and basic WebApplication structured data.
- Adds browser history/back-button support for application navigation.
- No analytics or estimation-method changes from v0.3.4.

## v0.3.4
- Cleans public-facing copy to remove release-note, roadmap, and internal-development language.
- Removes repeated version numbers from normal page headings.
- Reframes beta status, methodology, confidence limitations, privacy, and feedback for runners.
- No analytics or estimation-method changes from v0.3.3.

## v0.3.3
- Adds optional project-support links to the site footer and Methodology page.
- Support destination: Buy Me a Coffee for Endurance Forge.
- No analytics or estimation-method changes from v0.3.2.

## Public-beta focus
- Explicitly defines EF Aerobic Fitness Estimate as a **treadmill-derived VO₂max-equivalent estimate**.
- Adds a dedicated **Metrics Guide** with plain-language interpretation.
- Expands **Methodology** with equations, assumptions, stable-window logic, confidence, limitations, and privacy.
- Adds a comparison of laboratory VO₂max, device VO₂max estimates, EF Aerobic Fitness Estimate, and Running O₂ Cost.
- Adds public-beta labeling and a GitHub feedback/issues link.
- Keeps the v0.3.1 analysis algorithm unchanged.

## Important interpretation
EF Aerobic Fitness is comparable to VO₂max in concept and units (mL/kg/min), but is not a direct oxygen-consumption measurement and is not claimed to be interchangeable with laboratory or device-manufacturer VO₂max.

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
