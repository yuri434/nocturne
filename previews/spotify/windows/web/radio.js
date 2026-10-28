export function relatedTracks(items,queue,random=Math.random){const ids=new Set(queue.map(s=>s.id)),tracks=[];for(const item of items){if(item&&/^[-\w]{11}$/.test(item.id)&&!ids.has(item.id)){ids.add(item.id);tracks.push(item);}}for(let i=tracks.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[tracks[i],tracks[j]]=[tracks[j],tracks[i]];}return tracks.slice(0,15);}
export function setupRadio({player,settings,call,changed,notice}){
 let task=null,lastAttempt=0,attemptQueue=null;
 async function fill(){if(String(player.current?.id||'').startsWith('sp_'))return false;if(!settings().autoRadio||player.queueMode==='album'||settings().repeat!=='off'||!player.current)return false;if(task){await task;if(player.queue!==attemptQueue)return fill();return false;}if(player.queue===attemptQueue&&Date.now()-lastAttempt<30000)return false;attemptQueue=player.queue;lastAttempt=Date.now();const queue=player.queue,seed=player.current.id;
 task=(async()=>{try{const data=await call({op:'radio',id:seed});if(player.queue!==queue||player.queueMode==='album'||!settings().autoRadio||settings().repeat!=='off')return false;const tracks=relatedTracks(data.songs||[],queue);if(!tracks.length)return false;queue.push(...tracks.map(s=>({...s,key:crypto.randomUUID()})));changed();return true;}catch{notice('Não foi possível buscar músicas parecidas agora. Sua fila continua disponível.');return false;}finally{task=null;}})();return task;}
 function maybe(){if(player.queue.length-player.index<=3)fill();}
 return {fill,maybe};
}
