# EF-TN-002 — Experimental Analytics Methodology

**Endurance Forge · v0.5.34**

## Status and scope

Experimental Analytics contains exploratory, project-defined measures intended to expose potentially useful within-run and longitudinal patterns. DI, FIP, PHH, ARL, and Recovery τ are not presented as clinical measures, laboratory measurements, Garmin/Firstbeat metrics, or universal performance scores. Detection rules and thresholds may change as the methods are tested against more activities.

## Shared preprocessing

The selected running segment is resampled at approximately 5-second intervals. Usable samples require speed > 1 mph and HR > 40 bpm. Experimental analysis requires at least 30 usable samples and 10 minutes of analyzed duration. Metrics can impose stricter requirements.

## 1. Durability Index (DI)

For each sample:

`EF(t) = speed(t) / HR(t)`

Reference windows are 20–40% and 60–80% of analyzed duration:

`DI = 100 × mean EF(60–80%) / mean EF(20–40%)`

100% means late-window efficiency equals early-window efficiency in this ratio. Values below 100% indicate lower late-run speed-per-heartbeat efficiency; values above 100% indicate higher late-run efficiency. The excluded opening and closing portions reduce direct influence from start transitions and cooldown/finishing behavior.

Confidence is sample-count based, with a duration-quality requirement for the highest confidence level. DI has no universal good/bad threshold in Endurance Forge.

## 2. Fatigue Inflection Point (FIP)

FIP is the estimated onset of sustained running-efficiency deterioration and uses two independent validation paths.

**Path A — Change point.** The smoothed efficiency series is compared with a continuous segmented (hinge) regression over candidate breakpoints from 25–80% of analyzed duration. A change-point FIP requires ΔBIC >= 6, a sufficiently negative post-break slope, a meaningful negative slope change, at least 2% early-to-late efficiency loss, a non-boundary candidate, and a stable breakpoint among similarly supported candidates.

**Path B — Progressive onset.** When no discrete change point validates and early-to-late loss is at least 3%, Endurance Forge establishes a pre-onset efficiency baseline from 15–30% of the run. The progressive loss threshold is 50% of the observed early-to-late loss, bounded to 2–5%. Candidate onsets from 30–82.5% are evaluated. A candidate must cross the adaptive threshold, show at least 0.75% local deterioration, retain at least 80% of the threshold loss in the subsequent median, and have at least 68% of subsequent samples remain below the threshold. The highest-supported candidate is selected rather than the first eligible candidate.

This two-path design separates a discrete change in slope from a gradual but established deterioration. It also avoids the former fixed 40% eligibility boundary that produced artificial clustering during validation. The reported method is **change point** or **progressive onset**. If neither path validates, FIP remains **Not detected**. These are Endurance Forge analytical rules, not published physiological diagnostic cutoffs.

## 3. Pace–HR Hysteresis (PHH)

The chronological speed–HR path is treated as a loop. Endurance Forge computes the polygon/shoelace area and normalizes it by central speed and HR ranges:

`PHH = |loop area| / [(speed95 − speed5) × (HR95 − HR5)]`

At least 0.5 mph central (5th–95th percentile) speed variation is required. Confidence is reduced below 0.8 mph. PHH describes loop magnitude; it does not establish a cause.

## 4. Aerobic Response Lag (ARL)

Speed and HR are smoothed. Short-window changes are calculated and cross-correlated at candidate lags from 0–120 seconds in 5-second increments. The lag with the highest positive correlation is retained.

A result currently requires:

- best correlation >= 0.10; and
- central speed variation >= 0.35 mph.

Stronger confidence requires correlation >= 0.22 and speed variation >= 0.6 mph. These are project-level reliability gates, not clinical thresholds.

## 5. Recovery Kinetics (RK)

The smoothed HR trace is searched for separated post-effort peaks followed by sustained decline. A candidate currently requires at least a 6 bpm peak-to-following-minimum decline, HRR60 >= 3 bpm, and a peak-to-recovery-floor span >= 5 bpm.

Qualifying events are modeled as:

`HR(t) = HRfloor + (HRpeak − HRfloor)e^(−t/τ)`

The normalized recovery is log-transformed and fitted linearly to estimate τ. Fits are retained when τ is 5–360 seconds and enough samples support the fit. The activity result uses median τ and median HRR60 across detected recoveries. Smaller τ represents faster decay within this model.

Confidence is Low for one recovery, Moderate for two, and High for three or more.

## Charts

- **DI:** record-level efficiency profile with 20–40% and 60–80% reference windows.
- **FIP:** efficiency trajectory with accepted breakpoint when detected.
- **PHH:** chronological speed–HR loop.
- **ARL:** normalized speed demand and HR response timing.
- **RK:** detected post-effort recovery curves.

Chart normalization is visual only where noted and does not change the underlying metric.

## Multi-run interpretation

Each activity is analyzed independently before longitudinal plotting. Missing or undetected values remain missing and are never converted to zero. FIP is plotted as percent of analyzed run to make runs of different duration more comparable. Treadmill/outdoor filters are provided because the conditions are not assumed to share one baseline.

## Limitations

Experimental measures can be influenced by pacing strategy, terrain, treadmill behavior, temperature, humidity, hydration, fatigue, caffeine, medications, illness, sensor lag/error, stopping versus active recovery, and workout structure. They should be interpreted as within-person analytical observations, preferably across comparable activities. They are not diagnoses and are not evidence by themselves that training caused a longitudinal change.


