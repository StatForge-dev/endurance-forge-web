const finite=Number.isFinite;
const median=xs=>{const a=xs.filter(finite).slice().sort((x,y)=>x-y);if(!a.length)return NaN;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2};
const mad=xs=>{const m=median(xs);return finite(m)?median(xs.map(x=>Math.abs(x-m))):NaN};
const durationLabel=s=>{if(!finite(s))return 'unavailable';const n=Math.max(0,Math.round(s)),m=Math.floor(n/60),sec=n%60;return `${m}:${String(sec).padStart(2,'0')}`};

export function assessRunEvidence(run){
  const reasons=[];
  // PERFORMANCE-NEUTRAL ELIGIBILITY PRINCIPLE:
  // Evidence tiering must never reject or downgrade a run because its EF estimate is
  // high/low, its pace is slow/fast, or it disagrees with the current combined fit.
  // Eligibility is based only on whether the observation is technically/model-adequate.
  // Discordant but valid observations remain in the model and are handled by robust weighting.
  const stableS=run?.analysis?.fitness?.durationS;
  const drift=Math.abs(run?.driftPct);

  if(run?.included===false)return {status:'Excluded',tier:'excluded',modelEligible:false,reasons:['Excluded by user.']};
  if(!finite(run?.fitValue)||!finite(run?.hrr)||!finite(run?.workloadVo2)){
    const why=run?.analysis?.fitness?.reason||'No usable single-run EF observation is available.';
    return {status:'Excluded',tier:'excluded',modelEligible:false,reasons:[why]};
  }
  if(!(run.hrr>=.35&&run.hrr<=.92))return {status:'Excluded',tier:'excluded',modelEligible:false,reasons:[`HR reserve (${Math.round(run.hrr*100)}%) is outside the current 35–92% model range.`]};
  // Multi-run inference deliberately requires more stable evidence than the minimum
  // needed to display a single-run estimate.
  if(!finite(stableS)||stableS<600)return {status:'Excluded',tier:'excluded',modelEligible:false,reasons:[`Stable EF window is ${durationLabel(stableS)}; multi-run inference requires at least 10:00.`]};

  let tier='primary';
  if(stableS<720){tier='supporting';reasons.push(`Stable EF window is ${durationLabel(stableS)}; usable, but shorter than the 12:00 Primary-evidence target.`)}
  if(run.dataQuality==='Low'||run.dataQuality==='Unavailable'){tier='supporting';reasons.push(`${run.dataQuality||'Low'} data quality reduces model influence.`)}
  if(run.singleConfidence==='Low'){tier='supporting';reasons.push('Single-run inference is Low confidence, so this observation is down-weighted.')}
  if(finite(drift)&&drift>10){tier='supporting';reasons.push(`Workload-normalized drift is ${drift.toFixed(1)}%, which reduces model influence.`)}
  if(run.hrr>.88){tier='supporting';reasons.push(`Stable-window HR reserve is ${Math.round(run.hrr*100)}%; high-intensity evidence remains usable but is down-weighted near the upper model boundary.`)}
  if(run.hrr<.45){tier='supporting';reasons.push(`Stable-window HR reserve is ${Math.round(run.hrr*100)}%; low-intensity evidence is more sensitive to extrapolation.`)}
  if(run.dataQuality==='Moderate'&&tier==='primary')reasons.push('Moderate data quality is acceptable for Primary evidence.')
  if(!reasons.length)reasons.push('Adequate stable-window duration, acceptable data quality, controlled drift, and usable HR reserve.')
  return {status:tier==='primary'?'Primary':'Supporting',tier,modelEligible:true,reasons};
}

function baseWeight(run,assessment){
  const q=run.dataQuality==='High'?1:(run.dataQuality==='Moderate'?.78:.45);
  const c=run.singleConfidence==='Moderate'?1:(run.singleConfidence==='Low'?.55:.35);
  const d=Math.abs(run.driftPct);
  const drift=!finite(d)?0.7:d<=5?1:(d<=10?.82:(d<=15?.55:.3));
  const evidence=assessment?.tier==='supporting'?.72:1;
  return q*c*drift*evidence;
}

function distinctWorkloads(values,gap=2.5){
  const s=values.filter(finite).slice().sort((a,b)=>a-b);if(!s.length)return 0;
  let n=1,last=s[0];
  for(let i=1;i<s.length;i++)if(s[i]-last>=gap){n++;last=s[i]}
  return n;
}

export function combineAerobicFitness(runs=[]){
  const assessed=runs.map(r=>({...r,evidence:assessRunEvidence(r)}));
  const eligible=assessed.filter(r=>r.evidence.modelEligible);
  const primaryCount=assessed.filter(r=>r.evidence.tier==='primary').length;
  const supportingCount=assessed.filter(r=>r.evidence.tier==='supporting').length;
  const excludedCount=assessed.filter(r=>r.evidence.tier==='excluded').length;
  const base={eligibleCount:eligible.length,totalCount:runs.length,primaryCount,supportingCount,excludedCount,assessments:assessed.map(r=>({runIndex:r.runIndex,id:r.id,name:r.name,...r.evidence}))};
  if(eligible.length<2)return {available:false,confidence:'Unavailable',reason:'At least two model-eligible runs with a shared maximum/resting HR profile are required.',...base};

  const pts=eligible.map(r=>({...r,x:r.hrr,y:r.workloadVo2-3.5,baseWeight:baseWeight(r,r.evidence)}));
  let weights=pts.map(p=>p.baseWeight);
  let slope=0;
  const solve=()=>{const den=pts.reduce((s,p,i)=>s+weights[i]*p.x*p.x,0);return den>0?pts.reduce((s,p,i)=>s+weights[i]*p.x*p.y,0)/den:NaN};
  slope=solve();
  for(let iter=0;iter<3&&finite(slope);iter++){
    const residuals=pts.map(p=>p.y-slope*p.x), center=median(residuals), scale=Math.max(.35,(mad(residuals.map(r=>r-center))/.6745)||0);
    weights=pts.map((p,i)=>{const a=Math.abs(residuals[i]-center),h=a<=1.5*scale?1:(1.5*scale/a);return p.baseWeight*h});
    slope=solve();
  }
  const value=3.5+slope;
  if(!(value>=15&&value<=90))return {available:false,confidence:'Low',reason:'The combined workload/heart-rate relationship produced an implausible estimate.',...base};

  const individual=eligible.map(r=>r.fitValue), med=median(individual), spreadMad=mad(individual);
  const workloads=eligible.map(r=>r.workloadVo2), hrrs=eligible.map(r=>r.hrr);
  const workloadRange=Math.max(...workloads)-Math.min(...workloads), hrrRange=Math.max(...hrrs)-Math.min(...hrrs), distinct=distinctWorkloads(workloads);
  const residualCapacity=pts.map(p=>(p.y-slope*p.x)/p.x), residualMad=mad(residualCapacity);
  const highQuality=eligible.filter(r=>r.dataQuality==='High'||r.dataQuality==='Moderate').length;
  let confidence='Low';
  if(eligible.length>=3&&primaryCount>=2&&highQuality>=3&&distinct>=2&&workloadRange>=4&&hrrRange>=.12&&spreadMad<=2&&residualMad<=2.5)confidence='High';
  else if(eligible.length>=2&&highQuality>=2&&spreadMad<=4&&residualMad<=4&&(workloadRange>=2||hrrRange>=.07))confidence='Moderate';
  const reason=confidence==='High'
    ? 'Multiple model-eligible runs, including Primary evidence, span distinct workloads and converge on a consistent workload–heart-rate relationship. High confidence refers to corroboration within the Endurance Forge model, not laboratory equivalence.'
    : confidence==='Moderate'
      ? 'Multiple model-eligible runs provide useful corroboration, but workload diversity, Primary-evidence depth, or run-to-run agreement is not strong enough for High inference confidence.'
      : 'The model-eligible runs do not agree closely enough, or do not span enough workload, to support a stronger combined inference.';
  return {available:true,value,confidence,reason,...base,medianIndividual:med,spreadMad,workloadRange,hrrRange,distinctWorkloads:distinct,residualMad,points:eligible.map((r,i)=>({...r,weight:weights[i],predictedWorkloadVo2:3.5+slope*r.hrr}))};
}
