const finite=Number.isFinite;
const median=xs=>{const a=xs.filter(finite).slice().sort((x,y)=>x-y);if(!a.length)return NaN;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2};
const mad=xs=>{const m=median(xs);return finite(m)?median(xs.map(x=>Math.abs(x-m))):NaN};

function baseWeight(run){
  const q=run.dataQuality==='High'?1:(run.dataQuality==='Moderate'?.78:.45);
  const c=run.singleConfidence==='Moderate'?1:(run.singleConfidence==='Low'?.55:.35);
  const d=Math.abs(run.driftPct);
  const drift=!finite(d)?0.7:d<=5?1:(d<=10?.82:(d<=15?.55:.3));
  return q*c*drift;
}

function distinctWorkloads(values,gap=2.5){
  const s=values.filter(finite).slice().sort((a,b)=>a-b);if(!s.length)return 0;
  let n=1,last=s[0];
  for(let i=1;i<s.length;i++)if(s[i]-last>=gap){n++;last=s[i]}
  return n;
}

export function combineAerobicFitness(runs=[]){
  const eligible=runs.filter(r=>r.included!==false&&finite(r.fitValue)&&finite(r.hrr)&&r.hrr>=.35&&r.hrr<=.92&&finite(r.workloadVo2));
  if(eligible.length<2)return {available:false,confidence:'Unavailable',reason:'At least two qualifying runs with a shared maximum/resting HR profile are required.',eligibleCount:eligible.length,totalCount:runs.length};

  const pts=eligible.map(r=>({...r,x:r.hrr,y:r.workloadVo2-3.5,baseWeight:baseWeight(r)}));
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
  if(!(value>=15&&value<=90))return {available:false,confidence:'Low',reason:'The combined workload/heart-rate relationship produced an implausible estimate.',eligibleCount:eligible.length,totalCount:runs.length};

  const individual=eligible.map(r=>r.fitValue), med=median(individual), spreadMad=mad(individual);
  const workloads=eligible.map(r=>r.workloadVo2), hrrs=eligible.map(r=>r.hrr);
  const workloadRange=Math.max(...workloads)-Math.min(...workloads), hrrRange=Math.max(...hrrs)-Math.min(...hrrs), distinct=distinctWorkloads(workloads);
  const residualCapacity=pts.map(p=>(p.y-slope*p.x)/p.x), residualMad=mad(residualCapacity);
  const highQuality=eligible.filter(r=>r.dataQuality==='High'||r.dataQuality==='Moderate').length;
  let confidence='Low';
  if(eligible.length>=3&&highQuality>=3&&distinct>=2&&workloadRange>=4&&hrrRange>=.12&&spreadMad<=2&&residualMad<=2.5)confidence='High';
  else if(eligible.length>=2&&highQuality>=2&&spreadMad<=4&&residualMad<=4&&(workloadRange>=2||hrrRange>=.07))confidence='Moderate';
  const reason=confidence==='High'
    ? 'Multiple qualifying runs across distinct workloads converge on a consistent workload–heart-rate relationship. High confidence refers to corroboration within the Endurance Forge model, not laboratory equivalence.'
    : confidence==='Moderate'
      ? 'Multiple qualifying runs provide useful corroboration, but workload diversity or run-to-run agreement is not strong enough for High inference confidence.'
      : 'The qualifying runs do not agree closely enough, or do not span enough workload, to support a stronger combined inference.';
  return {available:true,value,confidence,reason,eligibleCount:eligible.length,totalCount:runs.length,medianIndividual:med,spreadMad,workloadRange,hrrRange,distinctWorkloads:distinct,residualMad,points:eligible.map((r,i)=>({...r,weight:weights[i],predictedWorkloadVo2:3.5+slope*r.hrr}))};
}
