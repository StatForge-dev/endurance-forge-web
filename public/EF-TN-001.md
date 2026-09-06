# EF-TN-001 — Scientific Basis of the EF Aerobic Fitness Estimate

**Version:** 1.0  
**Date:** 2026-09-06  
**Endurance Forge release:** v0.4.5

## Scope

Endurance Forge does not measure oxygen consumption and does not claim laboratory equivalence. The EF Aerobic Fitness Estimate is a treadmill-derived, VO₂max-equivalent analytical estimate inferred from modeled treadmill workload and heart-rate reserve during a selected stable submaximal window.

## Mathematical derivation

For treadmill running, the workload oxygen-cost model is:

`VO2_work = 0.2 v + 0.9 v G + 3.5`

where `v` is speed in m/min and `G` is fractional grade. Heart-rate reserve is:

`HRR = (HR_exercise - HR_rest) / (HR_max - HR_rest)`

Using the approximation `%HRR ≈ %VO2 reserve`:

`HRR ≈ (VO2_work - VO2_rest) / (VO2_max - VO2_rest)`

Solving for maximal oxygen uptake and using the conventional standardized resting value 3.5 mL/kg/min:

`EF = 3.5 + (VO2_work - 3.5) / HRR`

The algebra is exact conditional on the assumptions; the estimate is uncertain because workload VO₂ is modeled and the HRR–VO₂R relationship is approximate.

## Evidence and limitations

Swain et al. (1998) found %HRR to be a substantially better indicator of %VO₂ reserve than %VO₂max during treadmill exercise. Cunha et al. (2011), however, showed that the relationship is not a stable 1:1 identity during prolonged constant-work treadmill exercise. This supports Endurance Forge's use of a stable window and drift assessment, while also requiring conservative interpretation.

Submaximal treadmill VO₂max prediction is established as a class of method. George et al. (1993) and a later multicenter treadmill-jogging study demonstrated useful prediction from steady-state jogging speed and HR. Marsh (2012) found an ACSM submaximal treadmill protocol reasonably useful at group level but with individual error around 4 mL/kg/min. Evans et al. (2015) found moderate-to-high accuracy across many submaximal prediction equations but emphasized population, modality, exertion, medication, and validation differences. None of these studies validates the exact Endurance Forge estimator.

The conventional ACSM running equation is intended for steady-state running and is commonly described for speeds above ~5 mph. Because genuine jogging can occur below that speed and published treadmill jogging tests have used speeds beginning around 4.3 mph, Endurance Forge does not exclude a run merely for being slower. Instead, v0.4.5 lowers single-run inference confidence when the ACSM running workload equation is used below 5 mph and explicitly identifies the workload estimate as extrapolative.

## Multi-run model

For model-eligible run `i`, let `x_i = HRR_i` and `y_i = VO2_work,i - 3.5`. Endurance Forge fits the weighted slope through the resting anchor:

`beta = sum(w_i x_i y_i) / sum(w_i x_i^2)`

`EF_combined = 3.5 + beta`

Weights reflect evidence quality and drift and are followed by robust residual weighting. A technically valid off-day is not excluded because its EF value is low/high or because it disagrees with the combined estimate.

## Validation status

The current evidence supports physiological plausibility and the general class of submaximal treadmill estimation. It does **not** establish the external accuracy of Endurance Forge. External validation requires prospective comparison against directly measured gas-exchange VO₂max with bias, RMSE/SEE, limits of agreement, test–retest reliability, and subgroup analyses reported.

## References

1. Swain DP, et al. *Med Sci Sports Exerc.* 1998;30(2):318–321. doi:10.1097/00005768-199802000-00022. https://pubmed.ncbi.nlm.nih.gov/9502363/
2. Cunha FA, et al. *Appl Physiol Nutr Metab.* 2011;36(6):839–847. doi:10.1139/h11-100. https://pubmed.ncbi.nlm.nih.gov/22034854/
3. Marsh CE. *J Strength Cond Res.* 2012;26(2):548–554. doi:10.1519/JSC.0b013e3181bac56e. https://pubmed.ncbi.nlm.nih.gov/22262016/
4. Evans HJL, et al. *J Sci Med Sport.* 2015;18(2):183–188. doi:10.1016/j.jsams.2014.03.006. https://pubmed.ncbi.nlm.nih.gov/24721146/
5. George JD, et al. *Med Sci Sports Exerc.* 1993;25(5):643–647. https://pubmed.ncbi.nlm.nih.gov/8492693/
6. George JD, et al. *Measurement in Physical Education and Exercise Science.* 2007. doi:10.1080/10913670701294047.
7. Foreman NA, et al. *Int J Sports Physiol Perform.* 2022;17(7):1030–1036. doi:10.1123/ijspp.2021-0021. https://pubmed.ncbi.nlm.nih.gov/35299154/
8. Kokkinos P, et al. *Am J Cardiol.* 2017;120(4):688–692. doi:10.1016/j.amjcard.2017.05.037. https://pubmed.ncbi.nlm.nih.gov/28676154/
9. Tanaka H, et al. *J Am Coll Cardiol.* 2001;37(1):153–156. doi:10.1016/S0735-1097(00)01054-8. https://pubmed.ncbi.nlm.nih.gov/11153730/
10. Mayhew JL. *Br J Sports Med.* 1977;11(3):116–121. doi:10.1136/bjsm.11.3.116. https://pubmed.ncbi.nlm.nih.gov/922272/
