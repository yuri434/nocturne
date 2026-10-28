// Ask the original image CDN for a larger rendition; retain the original as fallback.
export function artworkUrl(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||!(/\.(googleusercontent|ggpht)\.com$/i.test(u.hostname)))return value;
 u.pathname=u.pathname.replace(/=w\d+(?:-h\d+)?(?=-|$)/,'=w768-h768').replace(/=s\d+(?=-|$)/,'=s768');return u.href;
 }catch{return value;}
}
export function trackSeconds(value){const parts=String(value||'').trim().split(':');if(parts.length<2||parts.length>3||parts.some(p=>!/^\d+$/.test(p)))return 0;return parts.reduce((a,p)=>a*60+Number(p),0);}
export function presenceTiming(track,audio,loaded=true){
 const duration=loaded&&Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:trackSeconds(track?.duration);
 const position=loaded&&Number.isFinite(audio.currentTime)?Math.max(0,audio.currentTime):0;
 return {duration:Number.isFinite(duration)&&duration>0?duration:0,position:duration>0?Math.min(position,duration):position};
}
