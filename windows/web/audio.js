import {nextIndex} from './model.js';
export class Player {
 constructor(elements,{resolve,changed,progress,error,settings}) {
  Object.assign(this,{elements,resolve,changed,progress,error,settings});
  this.queue=[];this.index=-1;this.slot=0;this.loading=false;this.generation=0;this.graphs=[];
  this.prepared=null;this.prefetching=null;this.prefetchEpoch=0;this.transition=null;this.fadeEpoch=0;this.mix=null;
  this.norm=1;this.muted=false;this.wantPlaying=false;this.loadedKeys=[null,null];this.loadTask=null;
  elements.forEach((audio,slot)=>{
   audio.crossOrigin='anonymous';
   audio.addEventListener('timeupdate',()=>{if(slot===this.slot)this.tick();});
   audio.addEventListener('ended',()=>{if(slot===this.slot&&!this.mix&&!this.transition)this.next(true);});
   for(const event of ['play','pause'])audio.addEventListener(event,()=>{if(slot===this.slot)this.changed('state');});
   audio.addEventListener('error',()=>{if(slot===this.slot&&audio.getAttribute('src')&&!this.loading){this.loadedKeys[slot]=null;this.error(Error('Áudio indisponível ou endereço expirado. Selecione a faixa novamente.'));this.changed('state');}});
  });
 }
 get audio(){return this.elements[this.slot];}
 get current(){return this.queue[this.index];}
 clear(slot){const audio=this.elements[slot];this.loadedKeys[slot]=null;audio.pause();audio.removeAttribute('src');audio.load();}
 async graph(){if(!this.context){this.context=new AudioContext();const context=this.context;this.master=context.createGain();this.analyser=context.createAnalyser();this.analyser.fftSize=1024;this.leveler=context.createDynamicsCompressor();this.analyser.connect(this.leveler);this.leveler.connect(this.master);this.master.connect(context.destination);this.buffer=new Float32Array(1024);for(const audio of this.elements){const source=context.createMediaElementSource(audio),gain=context.createGain(),filters=[60,230,910,3600,14000].map((frequency,i)=>{const f=context.createBiquadFilter();f.type=i===0?'lowshelf':i===4?'highshelf':'peaking';f.frequency.value=frequency;f.Q.value=.7;return f;});let last=source;for(const filter of filters){last.connect(filter);last=filter;}last.connect(gain);gain.connect(this.analyser);this.graphs.push({gain,filters});}this.graphs[1].gain.gain.value=0;this.update();}await this.context.resume();}
 update(){const settings=this.settings();if(this.leveler){const t=this.context.currentTime;for(const [key,value] of Object.entries({threshold:settings.normalize?-18:0,knee:12,ratio:settings.normalize?3:1,attack:.015,release:.35}))this.leveler[key].setTargetAtTime(value,t,.06);}if(this.master){this.elements.forEach(audio=>audio.volume=1);this.master.gain.setTargetAtTime(this.muted?0:settings.volume*this.norm,this.context.currentTime,.06);}else this.elements.forEach(audio=>audio.volume=this.muted?0:settings.volume);this.graphs.forEach(graph=>graph.filters.forEach((filter,i)=>filter.gain.setTargetAtTime(settings.eq[i],this.context.currentTime,.04)));}
 cancelMix(){this.fadeEpoch++;this.transition=null;if(this.mix!==null){clearInterval(this.mix);this.mix=null;}if(this.context)this.graphs.forEach((graph,i)=>{graph.gain.gain.cancelScheduledValues(this.context.currentTime);graph.gain.gain.value=i===this.slot?1:0;});this.elements.forEach((audio,i)=>{if(i!==this.slot)audio.pause();});}
 invalidatePrefetch(){this.prefetchEpoch++;this.prefetching=null;this.prepared=null;this.cancelMix();this.clear(1-this.slot);}
 play(index){
  if(index<0||index>=this.queue.length)return Promise.resolve();
  const generation=++this.generation;this.invalidatePrefetch();this.loading=true;this.wantPlaying=true;this.index=index;
  const track=this.current,slot=this.slot;this.clear(slot);this.changed('track');
  this.loadTask=(async()=>{try{
   await this.graph();
   for(let retry=0;retry<2;retry++){try{
    const value=await this.resolve(track);if(generation!==this.generation)return;
    this.audio.src=value.url;this.loadedKeys[slot]=track.key;this.audio.load();
    if(this.wantPlaying){await this.audio.play();if(generation!==this.generation)return;if(!this.wantPlaying)this.audio.pause();}
    break;
   }catch(error){if(retry||generation!==this.generation)throw error;this.clear(slot);await new Promise(resolve=>setTimeout(resolve,500));}}
   if(generation!==this.generation)return;this.loading=false;this.changed(this.wantPlaying&&!this.audio.paused?'started':'state');
  }catch(error){if(generation===this.generation){this.clear(slot);this.loading=false;this.wantPlaying=false;this.error(error.name==='NotSupportedError'?Error('O servidor recusou o áudio. Tente selecionar a faixa novamente.'):error);this.changed('state');}}})();
  return this.loadTask;
 }
 setQueue(list,index=0){this.queue=list.map(track=>({...track,key:crypto.randomUUID()}));if(!this.queue.length){this.generation++;this.loading=false;this.wantPlaying=false;this.invalidatePrefetch();this.clear(this.slot);this.index=-1;this.changed('state');return Promise.resolve();}return this.play(index);}
 async resume(){this.wantPlaying=true;if(this.loading)return this.loadTask;if(!this.current){if(this.queue.length)return this.play(0);return;}if(this.loadedKeys[this.slot]!==this.current.key||!this.audio.getAttribute('src'))return this.play(this.index);try{await this.context?.resume();if(!this.wantPlaying)return;await this.audio.play();if(!this.wantPlaying)this.audio.pause();}catch(error){this.error(error);}}
 pause(){this.wantPlaying=false;this.cancelMix();this.audio.pause();this.changed('state');}
 toggle(){if(this.loading||!this.audio.paused){this.pause();return Promise.resolve();}return this.resume();}
 next(ended=false){if(this.loading)return;const index=nextIndex(this.queue.length,this.index,this.settings(),ended);if(index>=0)return this.play(index);this.pause();}
 previous(){if(this.audio.currentTime>3){this.cancelMix();this.audio.currentTime=0;return;}if(!this.loading)return this.play(Math.max(0,this.index-1));}
 async tick(){
  const audio=this.audio;this.progress(audio);if(!this.current||this.loading||audio.paused||!Number.isFinite(audio.duration))return;
  const remaining=audio.duration-audio.currentTime,settings=this.settings();

  if(!settings.crossfade||settings.repeat==='one'||this.queue.length<2||this.mix!==null||this.transition)return;
  const next=nextIndex(this.queue.length,this.index,settings);if(next<0)return;
  if(remaining<settings.crossfade+18&&!this.prepared&&!this.prefetching){
   const token={generation:this.generation,epoch:this.prefetchEpoch,key:this.queue[next].key};this.prefetching=token;
   try{const resolved=await this.resolve(this.queue[next]);if(this.prefetching===token&&token.generation===this.generation&&token.epoch===this.prefetchEpoch&&this.queue[next]?.key===token.key){const slot=1-this.slot;this.elements[slot].src=resolved.url;this.loadedKeys[slot]=token.key;this.elements[slot].load();this.prepared={index:next,key:token.key};}}catch{}finally{if(this.prefetching===token)this.prefetching=null;}
  }
  if(this.mix!==null||this.transition||audio!==this.audio||audio.paused||!this.prepared)return;
  if(audio.duration-audio.currentTime>settings.crossfade||this.elements[1-this.slot].readyState<3)return;
  const prepared=this.prepared;if(this.queue[prepared.index]?.key!==prepared.key){this.prepared=null;return;}
  const transition={generation:this.generation,epoch:this.fadeEpoch,from:this.slot,to:1-this.slot,key:prepared.key,index:prepared.index};
  this.transition=transition;
  try{
   await this.elements[transition.to].play();
   if(this.transition!==transition||transition.generation!==this.generation||transition.epoch!==this.fadeEpoch||!this.wantPlaying){if(this.slot!==transition.to&&this.loadedKeys[transition.to]===transition.key)this.elements[transition.to].pause();return;}
   this.slot=transition.to;this.index=transition.index;this.prepared=null;
   const start=this.context.currentTime,seconds=Math.max(.05,Math.min(settings.crossfade,audio.duration-audio.currentTime));
   this.graphs[transition.from].gain.gain.setValueAtTime(1,start);this.graphs[transition.from].gain.gain.linearRampToValueAtTime(0,start+seconds);
   this.graphs[transition.to].gain.gain.setValueAtTime(0,start);this.graphs[transition.to].gain.gain.linearRampToValueAtTime(1,start+seconds);
   const timer=setInterval(()=>{
    if(this.transition!==transition||transition.epoch!==this.fadeEpoch){clearInterval(timer);if(this.mix===timer)this.mix=null;return;}
    if(this.context.currentTime>=start+seconds){clearInterval(timer);if(this.mix===timer)this.mix=null;this.transition=null;this.clear(transition.from);}
   },150);
   this.mix=timer;this.changed('started');
  }catch{if(this.transition===transition){this.transition=null;this.prepared=null;}}
 }
}
