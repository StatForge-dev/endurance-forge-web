const finite=Number.isFinite;
const mean=a=>{const x=a.filter(finite);return x.length?x.reduce((s,v)=>s+v,0)/x.length:NaN};
const median=a=>{const x=a.filter(finite).sort((a,b)=>a-b);if(!x.length)return NaN;const m=Math.floor(x.length/2);return x.length%2?x[m]:(x[m-1]+x[m])/2};
function interp(series,t,key){let best=null,d=Infinity;for(const r of series){if(!finite(r[key]))continue;const q=Math.abs(r.t-t);if(q<d){d=q;best=r}}return best?.[key]}
function resample(series,start,end,step=5){const out=[];for(let t=start;t<=end;t+=step){const speed=interp(series,t,'speedMph'),hr=interp(series,t,'hr');if(finite(speed)&&speed>1&&finite(hr)&&hr>40)out.push({t,speed,hr,ef:speed/hr})}return out}
function windowMean(x,a,b,key){return mean(x.filter(r=>r.t>=a&&r.t<=b).map(r=>r[key]))}
function linfit(x,key='ef'){if(x.length<3)return null;const mx=mean(x.map(r=>r.t)),my=mean(x.map(r=>r[key]));const den=x.reduce((s,r)=>s+(r.t-mx)**2,0);if(!den)return null;const slope=x.reduce((s,r)=>s+(r.t-mx)*(r[key]-my),0)/den,intercept=my-slope*mx;const sse=x.reduce((s,r)=>s+(r[key]-(intercept+slope*r.t))**2,0);return {slope,intercept,sse}}
function confidence(n,quality=true){return !quality||n<40?'Low':n<100?'Moderate':'High'}
export function experimentalMetrics(analysis){
 const raw=analysis?.series||[]; if(raw.length<30)return {available:false,reason:'Not enough usable time-series data.'};
 const start=analysis.analysisStartS??analysis.startS??raw[0].t,end=analysis.analysisEndS??analysis.endS??raw.at(-1).t,dur=end-start;
 const x=resample(raw,start,end,5); if(x.length<30||dur<600)return {available:false,reason:'Experimental metrics need at least 10 minutes of usable speed and heart-rate data.'};
 const q1=start+.20*dur,q2=start+.40*dur,q3=start+.60*dur,q4=start+.80*dur;
 const early=windowMean(x,q1,q2,'ef'),late=windowMean(x,q3,q4,'ef');
 const di=finite(early)&&early>0&&finite(late)?100*late/early:NaN;
 const durability={value:di,loss:finite(di)?100-di:NaN,early,late,confidence:confidence(x.length,dur>=1200)};
 // Piecewise breakpoint: ignore outer 20%, require meaningful slope deterioration and SSE improvement.
 let best=null; const base=linfit(x); for(let f=.25;f<=.75;f+=.025){const t=start+f*dur,a=x.filter(r=>r.t<=t),b=x.filter(r=>r.t>t);const fa=linfit(a),fb=linfit(b);if(!fa||!fb)continue;const sse=fa.sse+fb.sse;if(!best||sse<best.sse)best={t,f,sse,pre:fa.slope,post:fb.slope}}
 let fip=null;if(best&&base&&base.sse>0){const improve=1-best.sse/base.sse,postPctHr=best.post/(mean(x.map(r=>r.ef))||1)*3600*100,prePctHr=best.pre/(mean(x.map(r=>r.ef))||1)*3600*100;if(improve>.08&&postPctHr<prePctHr-1)fip={timeS:best.t-start,pct:best.f*100,declinePctHr:postPctHr,improvement:improve,confidence:confidence(x.length,improve>.12)}}
 // Hysteresis: normalized shoelace area of speed-HR trajectory.
 const sp=x.map(r=>r.speed),hr=x.map(r=>r.hr),sp5=percentile(sp,.05),sp95=percentile(sp,.95),h5=percentile(hr,.05),h95=percentile(hr,.95);let area=0;for(let i=1;i<x.length;i++)area+=(x[i-1].speed*x[i].hr-x[i].speed*x[i-1].hr)/2;if(x.length>2)area+=(x.at(-1).speed*x[0].hr-x[0].speed*x.at(-1).hr)/2;const denom=(sp95-sp5)*(h95-h5);const variation=sp95-sp5;const phh=denom>0&&variation>=.5?Math.abs(area)/denom:NaN;
 const hysteresis={value:phh,variationMph:variation,confidence:finite(phh)?confidence(x.length,variation>=.8):'Unavailable'};
 // Response lag via correlations of first differences at 5 s resolution, 0..120 s.
 const ds=x.slice(1).map((r,i)=>r.speed-x[i].speed),dh=x.slice(1).map((r,i)=>r.hr-x[i].hr);let lagBest=null;for(let lag=0;lag<=120;lag+=5){const k=lag/5,a=[],b=[];for(let i=0;i<ds.length-k;i++){if(finite(ds[i])&&finite(dh[i+k])){a.push(ds[i]);b.push(dh[i+k])}}const r=corr(a,b);if(finite(r)&&(!lagBest||r>lagBest.r))lagBest={lag,r}}
 const arl=lagBest&&lagBest.r>=.15&&variation>=.5?{seconds:lagBest.lag,correlation:lagBest.r,confidence:confidence(x.length,lagBest.r>=.30&&variation>=.8)}:null;
 // Recovery kinetics: detect >=10 bpm falls after local peaks; estimate HRR60 and exponential tau from normalized decay.
 const rec=[];for(let i=2;i<x.length-14;i++){if(x[i].hr<x[i-1].hr||x[i].hr<x[i+1].hr)continue;const endi=Math.min(x.length-1,i+24),tail=x.slice(i+8,endi+1).map(r=>r.hr),floor=median(tail);if(!finite(floor)||x[i].hr-floor<10)continue;const h60=interp(x,x[i].t+60,'hr'),hrr60=finite(h60)?x[i].hr-h60:NaN;const ys=[];for(let j=i+1;j<=endi;j++){const ratio=(x[j].hr-floor)/(x[i].hr-floor);if(ratio>0&&ratio<1)ys.push({t:x[j].t-x[i].t,y:Math.log(ratio)})}const fit=linfit(ys.map(z=>({t:z.t,ef:z.y})));const tau=fit&&fit.slope<0?-1/fit.slope:NaN;if(finite(tau)&&tau>=5&&tau<=300&&finite(hrr60)&&hrr60>=5){const curve=x.slice(i,endi+1).map(r=>({t:r.t-x[i].t,hr:r.hr,relative:r.hr-x[i].hr}));rec.push({t:x[i].t-start,hrr60,tau,peakHr:x[i].hr,floor,curve});i+=12}}
 const recovery=rec.length?{count:rec.length,hrr60:median(rec.map(r=>r.hrr60)),tau:median(rec.map(r=>r.tau)),events:rec,confidence:rec.length>=3?'High':rec.length===2?'Moderate':'Low'}:null;
 return {available:true,durationS:dur,samples:x.length,series:x,durability,fip,hysteresis,arl,recovery};
}
function percentile(a,p){const x=a.filter(finite).sort((a,b)=>a-b);if(!x.length)return NaN;const z=(x.length-1)*p,l=Math.floor(z),h=Math.ceil(z);return l===h?x[l]:x[l]+(x[h]-x[l])*(z-l)}
function corr(a,b){if(a.length<8||a.length!==b.length)return NaN;const ma=mean(a),mb=mean(b),da=Math.sqrt(a.reduce((s,v)=>s+(v-ma)**2,0)),db=Math.sqrt(b.reduce((s,v)=>s+(v-mb)**2,0));return da&&db?a.reduce((s,v,i)=>s+(v-ma)*(b[i]-mb),0)/(da*db):NaN}
