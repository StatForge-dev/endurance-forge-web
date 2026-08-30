# Endurance Forge Web v0.3.1

Browser-local treadmill and endurance activity analysis for FIT, TCX, and GPX files.

## v0.3.1
- Automatic sustained-running segment detection separates walking/warm-up from the primary run when the speed trace supports it.
- Manual analysis-segment start/end override.
- Workload-normalized HR drift/aerobic decoupling calculated inside the selected running segment.
- EF Aerobic Fitness Estimate using treadmill workload plus heart-rate reserve when known maximum HR and resting HR are supplied.
- Confidence rating and explicit reasons when an aerobic-fitness estimate is unavailable.
- Activity max HR is never silently substituted for known physiological HRmax.
- Speed + HR activity visualization with the analyzed segment highlighted.
- Compare Runs now uses segment-aware HR/drift values.
- Raw activity files remain browser-local.

## Development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

Cloudflare Pages build output: `dist`


## v0.3.1 inference refinement
- Selects a stable aerobic-estimation window inside the sustained running segment.
- Keeps cardiac drift analysis on the longer comparable running segment.
- Separates data quality from physiological inference confidence.
- Caps a single-run submaximal aerobic-fitness estimate at Moderate inference confidence until corroborated by additional runs/workloads.
- Downgrades inference confidence when drift, workload variability, or HR-reserve range make extrapolation less reliable.
