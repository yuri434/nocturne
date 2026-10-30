import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Player} from '../web/audio.js';
class AudioStub{
 constructor(){this.src='';this.paused=true;this.currentTime=0;this.duration=10;this.readyState=4;this.listeners={};this.played=[];}
 addEventListener(name,handler){this.listeners[name]=handler;}
 getAttribute(name){return name==='src'?this.src||null:null;}
 removeAttribute(name){if(name==='src')this.src='';}
 pause(){this.paused=true;}
 load(){}
 async play(){this.paused=false;this.played.push(this.src);}
}
const settings=()=>({volume:.8,eq:[0,0,0,0,0],normalize:false,crossfade:2,repeat:'off',shuffle:false});
test('failed track must not resume the previous audio under the new title',async()=>{
 const elements=[new AudioStub(),new AudioStub()];elements[0].src='previous-track-audio';elements[0].paused=false;
 const player=new Player(elements,{resolve:async()=>{throw Error('network unavailable');},changed:()=>{},progress:()=>{},error:()=>{},settings});player.graph=async()=>{};
 player.queue=[{id:'old',key:'old'},{id:'new',key:'new'}];player.index=0;
 await player.play(1);await player.toggle();
 assert.equal(player.current.id,'new');
 assert.equal(elements[0].played.includes('previous-track-audio'),false,'Old audio resumed while metadata points to the new track');
});
test('overlapping crossfade ticks must leave no orphaned transition timers',async()=>{
 const elements=[new AudioStub(),new AudioStub()];elements[0].paused=false;elements[0].currentTime=9.5;
 const completions=[];elements[1].play=()=>new Promise(resolve=>completions.push(resolve));
 const player=new Player(elements,{resolve:async()=>({url:'next'}),changed:()=>{},progress:()=>{},error:()=>{},settings});
 player.queue=[{id:'old',key:'old'},{id:'new',key:'new'}];player.index=0;player.prepared={index:1,key:'new'};
 player.wantPlaying=true;player.context={currentTime:0};player.graphs=[0,1].map(()=>({gain:{gain:{setValueAtTime(){},linearRampToValueAtTime(){}}}}));
 const timers=new Map();let id=0;const originalSet=globalThis.setInterval,originalClear=globalThis.clearInterval;
 try{globalThis.setInterval=fn=>{timers.set(++id,fn);return id;};globalThis.clearInterval=id=>timers.delete(id);
  const first=player.tick(),second=player.tick();for(const finish of completions)finish();await Promise.all([first,second]);
  assert.equal(player.index,1,'The transition must actually reach the next track');player.context.currentTime=1;for(const [id,fn]of [...timers])if(timers.has(id))fn();
  assert.equal(timers.size,0,'A transition timer keeps running after the fade has finished');
 }finally{globalThis.setInterval=originalSet;globalThis.clearInterval=originalClear;}
});
test('explicit play and pause commands are safe to repeat',async()=>{
 const elements=[new AudioStub(),new AudioStub()];
 const player=new Player(elements,{resolve:async()=>({url:'selected-track'}),changed:()=>{},progress:()=>{},error:()=>{},settings});
 player.queue=[{id:'track',key:'track'}];player.index=0;player.loadedKeys[0]='track';elements[0].src='selected-track';
 await player.resume();await player.resume();assert.equal(elements[0].paused,false);
 player.pause();player.pause();assert.equal(elements[0].paused,true);
});
test('pause during track loading prevents an automatic restart after resolution',async()=>{
 const elements=[new AudioStub(),new AudioStub()];let resolveTrack;
 const player=new Player(elements,{resolve:()=>new Promise(resolve=>{resolveTrack=resolve;}),changed:()=>{},progress:()=>{},error:()=>{},settings});player.graph=async()=>{};player.queue=[{id:'track',key:'track'}];
 const load=player.play(0);await Promise.resolve();player.pause();resolveTrack({url:'selected-track'});await load;
 assert.equal(elements[0].paused,true);assert.equal(elements[0].played.length,0);
});
test('Web Audio applies volume only once and resets the old element attenuation',()=>{
 const elements=[new AudioStub(),new AudioStub()];let gain;
 const player=new Player(elements,{settings,changed:()=>{},progress:()=>{},error:()=>{}});
 player.update();assert.equal(elements[0].volume,.8);
 player.context={currentTime:0};player.master={gain:{setTargetAtTime(value){gain=value;}}};
 player.update();assert.equal(elements[0].volume,1);assert.equal(elements[1].volume,1);assert.equal(gain,.8);
 player.muted=true;player.update();assert.equal(gain,0);assert.equal(elements[0].volume,1);
});
test('normalization does not chase each short-term RMS change',async()=>{
 const elements=[new AudioStub(),new AudioStub()];elements[0].paused=false;
 const player=new Player(elements,{settings:()=>({...settings(),normalize:true,crossfade:0}),changed:()=>{},progress:()=>{},error:()=>{}});
 player.queue=[{key:'track'}];player.index=0;player.analyser={getFloatTimeDomainData(){throw Error('Short-term RMS must not control gain')}};
 for(let i=0;i<50;i++)await player.tick();assert.equal(player.norm,1);
});
