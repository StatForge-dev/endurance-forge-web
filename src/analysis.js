import { oxygenCostLevelRun } from './fit.js';

const finite = Number.isFinite;
const MPS_TO_MPH = 2.2369362921;

function mean(values) {
  const x = values.filter(finite);
  return x.length ? x.reduce((a,b)=>a+b,0)/x.length : NaN;
}
function stdev(values) {
  const x=values.filter(finite); if(x.length<2)return NaN;
  const m=mean(x); return Math.sqrt(x.reduce((s,v)=>s+(v-m)**2,0)/(x.length-1));
}
function percentile(values,p) {
  const x=values.filter(finite).sort((a,b)=>a-b); if(!x.length)return NaN;
  const i=(x.length-1)*p, lo=Math.floor(i), hi=Math.ceil(i);
  return lo===hi?x[lo]:x[lo]+(x[hi]-x[lo])*(i-lo);
}
function smooth(values, radius=7) {
  return values.map((_,i)=>{
    const x=[]; for(let j=Math.max(0,i-radius);j<=Math.min(values.length-1,i+radius);j++) if(finite(values[j]))x.push(values[j]);
    return x.length?mean(x):NaN;
  });
}
function timeAxis(records,totalS) {
  const raw=records.map(r=>r.timestampMs).filter(finite);
  const hasTime=raw.length>=2 && raw.at(-1)>raw[0];
  if(hasTime){const t0=raw[0]; return records.map((r,i)=>finite(r.timestampMs)?(r.timestampMs-t0)/1000:(i/(Math.max(1,records.length-1)))*totalS);}
  return records.map((_,i)=>(i/(Math.max(1,records.length-1)))*totalS);
}
function deriveSpeed(records,times,scale) {
  const direct=records.map(r=>finite(r.speedMps)&&r.speedMps>0?r.speedMps*scale:NaN);
  const usable=direct.filter(finite).length >= Math.max(10,records.length*.25);
  if(usable)return direct.map(v=>finite(v)?v*MPS_TO_MPH:NaN);
  const d=records.map(r=>finite(r.distanceM)?r.distanceM:NaN);
  return records.map((_,i)=>{
    const a=Math.max(0,i-2),b=Math.min(records.length-1,i+2);
    if(!finite(d[a])||!finite(d[b])||!(times[b]>times[a]))return NaN;
    const mps=((d[b]-d[a])*scale)/(times[b]-times[a]);
    return mps>0&&mps<12?mps*MPS_TO_MPH:NaN;
  });
}
function findPrimaryRun(times,speeds) {
  const sm=smooth(speeds,7), valid=sm.filter(v=>finite(v)&&v>0.5);
  if(valid.length<20)return {startS:0,endS:times.at(-1)||0,thresholdMph:NaN,method:'whole activity',detected:false};
  const q20=percentile(valid,.20),q70=percentile(valid,.70),med=percentile(valid,.50);
  let threshold;
  if(finite(q20)&&finite(q70)&&q70-q20>=0.8) threshold=(q20+q70)/2;
  else threshold=Math.max(3.7,med*.78);
  threshold=Math.min(threshold,Math.max(3.7,med*.96));
  const active=[]; for(let i=0;i<sm.length;i++) if(finite(sm[i])&&sm[i]>=threshold)active.push(i);
  if(!active.length)return {startS:0,endS:times.at(-1)||0,thresholdMph:threshold,method:'whole activity',detected:false};
  const segments=[]; let s=active[0],last=active[0];
  for(let k=1;k<active.length;k++){
    const i=active[k];
    if(times[i]-times[last]>30){segments.push([s,last]);s=i;} last=i;
  }
  segments.push([s,last]);
  const scored=segments.map(([a,b])=>({a,b,duration:times[b]-times[a],avg:mean(sm.slice(a,b+1))})).filter(x=>x.duration>=300);
  if(!scored.length)return {startS:0,endS:times.at(-1)||0,thresholdMph:threshold,method:'whole activity',detected:false};
  scored.sort((x,y)=>y.duration-x.duration);
  const best=scored[0];
  return {startS:times[best.a],endS:times[best.b],thresholdMph:threshold,method:'automatic sustained running detection',detected:true};
}
function subset(series,startS,endS) { return series.filter(r=>r.t>=startS&&r.t<=endS); }
function linearSlope(points,key) {
  const x=points.filter(p=>finite(p.t)&&finite(p[key])); if(x.length<3)return NaN;
  const mt=mean(x.map(p=>p.t)), my=mean(x.map(p=>p[key]));
  const den=x.reduce((s,p)=>s+(p.t-mt)**2,0); if(!den)return NaN;
  return x.reduce((s,p)=>s+(p.t-mt)*(p[key]-my),0)/den;
}
function calcDrift(seg) {
  const usable=seg.filter(r=>finite(r.hr)&&finite(r.speedMph)&&r.speedMph>1);
  if(usable.length<40)return null;
  const mid=(usable[0].t+usable.at(-1).t)/2, first=usable.filter(r=>r.t<=mid),second=usable.filter(r=>r.t>mid);
  if(first.length<15||second.length<15)return null;
  const hr1=mean(first.map(r=>r.hr)),hr2=mean(second.map(r=>r.hr)),sp1=mean(first.map(r=>r.speedMph)),sp2=mean(second.map(r=>r.speedMph));
  if(![hr1,hr2,sp1,sp2].every(finite)||sp1<=0||sp2<=0)return null;
  const raw=(hr2/hr1-1)*100;
  const normalized=((hr2/sp2)/(hr1/sp1)-1)*100;
  const speedChange=(sp2/sp1-1)*100;
  return {value:normalized,rawHrDrift:raw,speedChange,firstHr:hr1,secondHr:hr2,firstSpeed:sp1,secondSpeed:sp2,label:Math.abs(speedChange)<=5?'HR drift':'Aerobic decoupling'};
}

function windowStats(points) {
  const usable=points.filter(r=>finite(r.hr)&&finite(r.speedMph)&&r.speedMph>1);
  if(usable.length<30)return null;
  const durationS=usable.at(-1).t-usable[0].t;
  if(durationS<480)return null;
  const avgHr=mean(usable.map(r=>r.hr)), avgSpeed=mean(usable.map(r=>r.speedMph));
  const speedSd=stdev(usable.map(r=>r.speedMph));
  const speedCv=finite(speedSd)&&avgSpeed>0?speedSd/avgSpeed:NaN;
  const hrSlopeBpmMin=linearSlope(usable,'hr')*60;
  const drift=calcDrift(usable);
  return {usable,durationS,avgHr,avgSpeed,speedCv,hrSlopeBpmMin,drift};
}

function findStableFitnessWindow(seg) {
  if(!seg.length)return null;
  const total=seg.at(-1).t-seg[0].t;
  const desired=total>=1500?900:total>=1080?720:Math.min(total,600);
  if(desired<480)return null;
  const step=30;
  const startMin=seg[0].t;
  const lastStart=seg.at(-1).t-desired;
  const candidates=[];
  for(let s=startMin;s<=lastStart+1;s+=step){
    const stats=windowStats(subset(seg,s,s+desired));
    if(!stats)continue;
    const driftAbs=stats.drift?Math.abs(stats.drift.value):8;
    const speedPenalty=finite(stats.speedCv)?stats.speedCv*100:12;
    const slopePenalty=finite(stats.hrSlopeBpmMin)?Math.abs(stats.hrSlopeBpmMin)*1.8:6;
    const latePenalty=total>desired?((s-startMin)/Math.max(1,total-desired))*0.8:0;
    const score=driftAbs*0.9+speedPenalty*1.4+slopePenalty+latePenalty;
    candidates.push({startS:s,endS:s+desired,score,...stats});
  }
  if(!candidates.length){
    const stats=windowStats(seg); return stats?{startS:seg[0].t,endS:seg.at(-1).t,score:NaN,...stats}:null;
  }
  candidates.sort((a,b)=>a.score-b.score);
  return candidates[0];
}

function assessDataQuality(win) {
  if(!win)return {level:'Unavailable',reason:'No stable estimation window with usable speed and heart-rate data.'};
  const cv=win.speedCv, coverage=win.usable.length/Math.max(1,Math.round(win.durationS));
  if(win.durationS>=720&&finite(cv)&&cv<=.05&&coverage>=.5)return {level:'High',reason:'Long, well-sampled estimation window with stable treadmill speed.'};
  if(win.durationS>=600&&finite(cv)&&cv<=.10)return {level:'Moderate',reason:'Usable estimation window with acceptable workload stability.'};
  return {level:'Low',reason:'Limited duration, sampling, or workload stability in the estimation window.'};
}

function fitnessEstimate(win,gradePct,maxHr,restHr,wholeDrift,dataQuality) {
  if(!win)return {value:NaN,confidence:'Unavailable',dataQuality:dataQuality?.level||'Unavailable',reason:'No stable estimation window could be identified.'};
  const {avgHr,avgSpeed,durationS,speedCv}=win;
  if(!finite(avgHr)||!finite(avgSpeed)||durationS<480)return {value:NaN,confidence:'Unavailable',dataQuality:dataQuality?.level||'Unavailable',reason:'Needs at least 8 minutes of stable running with usable speed and heart-rate samples.'};
  if(!(maxHr>100)||!(restHr>25)||maxHr<=restHr+30)return {value:NaN,confidence:'Unavailable',dataQuality:dataQuality?.level||'Unavailable',reason:'Enter your known maximum HR and resting HR for a submaximal EF aerobic fitness estimate.'};
  const hrr=(avgHr-restHr)/(maxHr-restHr);
  if(!(hrr>=.35&&hrr<=.92))return {value:NaN,confidence:'Low',dataQuality:dataQuality?.level||'Unavailable',reason:`Estimation window is outside the preferred submaximal HR-reserve range (${Math.round(hrr*100)}% HRR).`};
  const workload=oxygenCostLevelRun(avgSpeed,gradePct);
  const value=3.5+(workload-3.5)/hrr;
  if(!(value>=15&&value<=90))return {value:NaN,confidence:'Low',dataQuality:dataQuality?.level||'Unavailable',reason:'The available workload/HR relationship produced an implausible estimate.'};

  let confidence='Moderate'; // Single-run submaximal inference is intentionally capped at Moderate.
  const localDrift=win.drift?Math.abs(win.drift.value):NaN;
  const wholeDriftAbs=wholeDrift?Math.abs(wholeDrift.value):NaN;
  const unstable = (finite(speedCv)&&speedCv>.10) || (finite(localDrift)&&localDrift>7) || (finite(wholeDriftAbs)&&wholeDriftAbs>12) || hrr<.45 || hrr>.88 || dataQuality?.level==='Low';
  if(unstable)confidence='Low';
  const reason=confidence==='Moderate'
    ? 'Single-run submaximal estimate from the most stable workload/HR window; inference confidence is capped at Moderate until corroborated by additional runs or workloads.'
    : 'Single-run estimate from the most stable workload/HR window, but physiological or workload instability reduces inference confidence.';
  return {value,confidence,dataQuality:dataQuality?.level||'Unavailable',reason,workloadVo2:workload,hrr,avgHr,avgSpeed,durationS,speedCv,windowDrift:win.drift,windowStartS:win.startS,windowEndS:win.endS,hrSlopeBpmMin:win.hrSlopeBpmMin};
}

export function analyzeTreadmillActivity(activity,{targetDistanceM,targetTimerS,gradePct=0,maxHr=NaN,restHr=NaN,manualStartS=NaN,manualEndS=NaN}={}) {
  const records=activity?.records||[];
  const totalS=targetTimerS>0?targetTimerS:activity?.recordedTimerS;
  if(!records.length||!(totalS>0)) return {available:false,reason:'No usable time-series records.'};
  const recordedDistance=activity?.recordedDistanceM;
  const recordedTime=activity?.recordedTimerS;
  const distScale=(targetDistanceM>0&&recordedDistance>0)?targetDistanceM/recordedDistance:1;
  const timeScale=(targetTimerS>0&&recordedTime>0)?targetTimerS/recordedTime:1;
  const speedScale=distScale/timeScale;
  const rawTimes=timeAxis(records,recordedTime>0?recordedTime:totalS).map(t=>t*timeScale);
  const speeds=deriveSpeed(records,rawTimes,speedScale);
  const series=records.map((r,i)=>({t:rawTimes[i],speedMph:speeds[i],hr:finite(r.hr)?r.hr:NaN,cadence:finite(r.cadence)?r.cadence:NaN})).filter(r=>finite(r.t));
  const auto=findPrimaryRun(series.map(r=>r.t),series.map(r=>r.speedMph));
  let startS=finite(manualStartS)?Math.max(0,manualStartS):auto.startS;
  let endS=finite(manualEndS)?Math.min(totalS,manualEndS):auto.endS;
  if(!(endS>startS)) {startS=0;endS=totalS;}
  const transitionTrim=auto.detected && !finite(manualStartS) ? Math.min(90,Math.max(30,(endS-startS)*.06)) : 0;
  const analysisStart=Math.min(endS-60,startS+transitionTrim);
  const seg=subset(series,analysisStart,endS);
  const avgSpeed=mean(seg.map(r=>r.speedMph)),avgHr=mean(seg.map(r=>r.hr));
  const drift=calcDrift(seg);
  const fitnessWindow=findStableFitnessWindow(seg);
  const dataQuality=assessDataQuality(fitnessWindow);
  const fitness=fitnessEstimate(fitnessWindow,Number(gradePct)||0,Number(maxHr),Number(restHr),drift,dataQuality);
  const walking=series.filter(r=>r.t<startS);
  const preDistanceMph=mean(walking.map(r=>r.speedMph));
  return {available:true,series,auto,startS,endS,analysisStartS:analysisStart,analysisEndS:endS,segmentDurationS:endS-startS,analysisDurationS:endS-analysisStart,avgSpeedMph:avgSpeed,avgHr,drift,fitness,fitnessWindow,dataQuality,preSegmentDurationS:startS,preSegmentAvgSpeedMph:preDistanceMph};
}
