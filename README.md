# Endurance Forge Web v0.3.2 — Public Beta

Browser-local treadmill and endurance activity analysis for FIT, TCX, and GPX files.

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
