import { inspectFit, correctFit } from './fit.js';

const finite = Number.isFinite;

function textOf(node) { return node?.textContent?.trim() ?? ''; }
function numberOf(node) { const t=textOf(node); if (!t) return NaN; const n=Number(t); return finite(n) ? n : NaN; }
function descendants(node, localName) {
  if (!node) return [];
  return Array.from(node.getElementsByTagName('*')).filter(n => n.localName === localName || n.nodeName?.split(':').at(-1) === localName);
}
function firstDesc(node, localName) { return descendants(node, localName)[0] ?? null; }
function directChildren(node, localName) {
  if (!node) return [];
  return Array.from(node.children || []).filter(n => n.localName === localName || n.nodeName?.split(':').at(-1) === localName);
}
function parseTime(value) { const ms = Date.parse(value); return finite(ms) ? ms : NaN; }
function mean(values) { const x=values.filter(finite); return x.length ? x.reduce((a,b)=>a+b,0)/x.length : NaN; }
function max(values) { const x=values.filter(finite); return x.length ? Math.max(...x) : NaN; }
function haversineM(a,b) {
  if (![a.lat,a.lon,b.lat,b.lon].every(finite)) return NaN;
  const R=6371000, rad=Math.PI/180;
  const dLat=(b.lat-a.lat)*rad, dLon=(b.lon-a.lon)*rad;
  const s=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(s)));
}
function deriveDistance(records) {
  const ds=records.map(r=>r.distanceM).filter(finite);
  if (ds.length) {
    const first=ds[0], last=ds.at(-1);
    if (last>first) return last-first;
    if (last>0) return last;
  }
  let total=0, used=0;
  for (let i=1;i<records.length;i++) { const d=haversineM(records[i-1],records[i]); if (finite(d) && d < 2000) { total+=d; used++; } }
  return used ? total : NaN;
}
function deriveDuration(records) {
  const ts=records.map(r=>r.timestampMs).filter(finite);
  return ts.length>=2 && ts.at(-1)>ts[0] ? (ts.at(-1)-ts[0])/1000 : NaN;
}
function finalize(activity) {
  activity.records = (activity.records || []).filter(r => r && Object.values(r).some(v => finite(v)));
  if (!finite(activity.recordedDistanceM) || activity.recordedDistanceM <= 0) activity.recordedDistanceM = deriveDistance(activity.records);
  if (!finite(activity.recordedTimerS) || activity.recordedTimerS <= 0) activity.recordedTimerS = deriveDuration(activity.records);
  if (!finite(activity.recordedElapsedS) || activity.recordedElapsedS <= 0) activity.recordedElapsedS = activity.recordedTimerS;
  if (!finite(activity.avgHr)) activity.avgHr = mean(activity.records.map(r=>r.hr));
  if (!finite(activity.maxHr)) activity.maxHr = max(activity.records.map(r=>r.hr));
  activity.capabilities = {
    distance: finite(activity.recordedDistanceM) && activity.recordedDistanceM > 0,
    duration: finite(activity.recordedTimerS) && activity.recordedTimerS > 0,
    heartRateSummary: finite(activity.avgHr) || finite(activity.maxHr),
    heartRateSamples: activity.records.filter(r=>finite(r.hr)).length >= 5,
    cadenceSamples: activity.records.some(r=>finite(r.cadence)),
    speedSamples: activity.records.some(r=>finite(r.speedMps)),
    gpsTrack: activity.records.some(r=>finite(r.lat)&&finite(r.lon)),
    elevation: activity.records.some(r=>finite(r.elevationM)),
    laps: (activity.laps || []).length > 0,
    correctedFileExport: activity.format === 'FIT'
  };
  return activity;
}

function parseXml(text, label) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const err=descendants(doc,'parsererror')[0];
  if (err) throw new Error(`${label} XML could not be parsed.`);
  return doc;
}

function tcxToActivity(text, fileName) {
  const doc=parseXml(text,'TCX');
  const activityNode=descendants(doc,'Activity')[0];
  if (!activityNode) throw new Error('No Activity element was found in the TCX file.');
  const lapNodes=descendants(activityNode,'Lap');
  const laps=lapNodes.map(l=>({
    distanceM:numberOf(firstDesc(l,'DistanceMeters')),
    timerS:numberOf(firstDesc(l,'TotalTimeSeconds')),
    avgHr:numberOf(firstDesc(firstDesc(l,'AverageHeartRateBpm'),'Value')),
    maxHr:numberOf(firstDesc(firstDesc(l,'MaximumHeartRateBpm'),'Value'))
  }));
  const trackpoints=descendants(activityNode,'Trackpoint');
  const records=trackpoints.map(tp=>{
    const pos=firstDesc(tp,'Position');
    const hrNode=firstDesc(tp,'HeartRateBpm');
    const speedCandidates=descendants(tp,'Speed').map(numberOf).filter(finite);
    return {
      timestampMs:parseTime(textOf(firstDesc(tp,'Time'))),
      distanceM:numberOf(firstDesc(tp,'DistanceMeters')),
      hr:numberOf(firstDesc(hrNode,'Value')),
      cadence:numberOf(firstDesc(tp,'Cadence')),
      speedMps:speedCandidates[0] ?? NaN,
      elevationM:numberOf(firstDesc(tp,'AltitudeMeters')),
      lat:numberOf(firstDesc(pos,'LatitudeDegrees')),
      lon:numberOf(firstDesc(pos,'LongitudeDegrees'))
    };
  });
  const lapDistance=laps.map(x=>x.distanceM).filter(finite).reduce((a,b)=>a+b,0);
  const lapTime=laps.map(x=>x.timerS).filter(finite).reduce((a,b)=>a+b,0);
  return finalize({
    format:'TCX', fileName, sourceLabel:'TCX activity', sport:activityNode.getAttribute('Sport') || 'Unknown',
    recordedDistanceM:lapDistance>0?lapDistance:NaN, recordedTimerS:lapTime>0?lapTime:NaN, recordedElapsedS:lapTime>0?lapTime:NaN,
    avgHr:mean(laps.map(x=>x.avgHr)), maxHr:max(laps.map(x=>x.maxHr)), laps, records, rawText:text
  });
}

function gpxToActivity(text, fileName) {
  const doc=parseXml(text,'GPX');
  const trk=descendants(doc,'trk')[0];
  const rte=descendants(doc,'rte')[0];
  const pointNodes=trk ? descendants(trk,'trkpt') : (rte ? descendants(rte,'rtept') : descendants(doc,'wpt'));
  if (!pointNodes.length) throw new Error('No track, route, or waypoint points were found in the GPX file.');
  const records=pointNodes.map(p=>{
    const all=Array.from(p.getElementsByTagName('*'));
    const byLocal=(names)=>all.find(n=>names.includes((n.localName || n.nodeName.split(':').at(-1)).toLowerCase()));
    const hr=byLocal(['hr','heartrate','heart_rate']);
    const cad=byLocal(['cad','cadence']);
    const speed=byLocal(['speed']);
    const dist=byLocal(['distance','distancemeters']);
    return {
      timestampMs:parseTime(textOf(firstDesc(p,'time'))),
      distanceM:numberOf(dist), hr:numberOf(hr), cadence:numberOf(cad), speedMps:numberOf(speed),
      elevationM:numberOf(firstDesc(p,'ele')), lat:Number(p.getAttribute('lat')), lon:Number(p.getAttribute('lon'))
    };
  });
  return finalize({
    format:'GPX', fileName, sourceLabel:'GPX activity', sport:'Running', recordedDistanceM:NaN, recordedTimerS:NaN, recordedElapsedS:NaN,
    avgHr:NaN, maxHr:NaN, laps:[], records, rawText:text
  });
}

function fitToActivity(bytes,fileName) {
  const x=inspectFit(bytes);
  const records=x.records.map(r=>({timestampMs:finite(r.timestamp)?(r.timestamp+631065600)*1000:NaN, distanceM:r.distanceM, hr:r.hr, cadence:r.cadence, speedMps:r.speedMps, elevationM:NaN, lat:NaN, lon:NaN}));
  return finalize({format:'FIT',fileName,sourceLabel:'FIT activity',sport:'Running',recordedDistanceM:x.originalDistanceM,recordedTimerS:x.originalTimerS,recordedElapsedS:x.originalElapsedS,avgHr:x.avgHr,maxHr:x.maxHr,laps:x.laps,records,rawBytes:bytes,fitInfo:x});
}

export function detectFormat(fileName='') {
  const ext=fileName.split('.').pop()?.toLowerCase();
  if (ext==='fit') return 'FIT'; if (ext==='tcx') return 'TCX'; if (ext==='gpx') return 'GPX'; return null;
}

export async function importActivity(file) {
  const format=detectFormat(file.name);
  if (!format) throw new Error('Unsupported file type. Choose a FIT, TCX, or GPX activity file.');
  if (format==='FIT') return fitToActivity(new Uint8Array(await file.arrayBuffer()),file.name);
  const text=await file.text();
  return format==='TCX' ? tcxToActivity(text,file.name) : gpxToActivity(text,file.name);
}

export function correctActivityFile(activity,targetDistanceM,targetTimerS) {
  if (activity.format!=='FIT') throw new Error(`Corrected ${activity.format} export is not implemented yet. Analysis and treadmill overrides still work for this format.`);
  return correctFit(activity.rawBytes,targetDistanceM,targetTimerS);
}

export function capabilityRows(a) {
  return [
    ['Distance',a.capabilities.distance],['Duration',a.capabilities.duration],['Heart-rate summary',a.capabilities.heartRateSummary],
    ['Heart-rate samples',a.capabilities.heartRateSamples],['Cadence samples',a.capabilities.cadenceSamples],['Speed samples',a.capabilities.speedSamples],
    ['GPS track',a.capabilities.gpsTrack],['Elevation',a.capabilities.elevation],['Laps',a.capabilities.laps]
  ];
}
