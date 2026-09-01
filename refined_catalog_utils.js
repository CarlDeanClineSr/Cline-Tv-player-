// ============================================================
// CLINE CLASSIC TV - REFINED MEGA CATALOG UTILITIES
// Data selected from the 5,306-entry Mega Harvester V2 pool.
// Every stored file passed the ranged-GET media test before refinement.
// ============================================================
function archiveStrictComponent(value){
  return encodeURIComponent(String(value)).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
}
function archiveVerifiedUrl(identifier,filename){
  return 'https://archive.org/download/'+archiveStrictComponent(identifier)+'/'+String(filename).split('/').map(archiveStrictComponent).join('/');
}
function archiveDisplayName(filename,prefix=''){
  let n=String(filename).split('/').pop();
  n=n.replace(/\.(mp3|m4a|aac|ogg|oga|wav|flac|opus|mp4|m4v|webm|ogv|mov)$/i,'');
  n=n.replace(/[_]+/g,' ').replace(/\s+/g,' ').trim();
  n=n.replace(/\.(480p|576p|720p|1080p|AMZN|WEB-DL|DD|x264|RTN)(?:\.|$).*/i,'');
  return prefix && !n.toLowerCase().startsWith(prefix.toLowerCase()) ? prefix+' - '+n : n;
}
function appendArchiveFiles(target,identifier,prefix,files){
  for(const f of files) target.push({n:archiveDisplayName(f,prefix),u:archiveVerifiedUrl(identifier,f)});
}
const REFINED_OTR_MYSTERY=[];
const REFINED_OTR_WESTERN=[];
const REFINED_WWII_HISTORY=[];
const REFINED_INTERNATIONAL_AUDIO=[];
const REFINED_CLASSIC_TV=[];
const REFINED_SCIENCE_EDUCATION=[];
const REFINED_SHOCK_DRIVE_IN=[];
const REFINED_HOLIDAY=[];
const REFINED_VINTAGE_AUTO_ADS=[];
