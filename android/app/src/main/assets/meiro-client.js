// Shared Meiro GPLv3 client. Native code injects credentials; JS never receives them.
let wasmReady;
function initialize(){if(!wasmReady)wasmReady=(async()=>{const go=new Go();const bytes=await (await fetch('meiro.wasm')).arrayBuffer();const instance=await WebAssembly.instantiate(bytes,go.importObject);go.run(instance.instance).catch(()=>{});for(let n=0;n<200&&!window.nocturneYouTube;n++)await new Promise(r=>setTimeout(r,25));if(!window.nocturneYouTube)throw Error('O cliente YouTube Music não iniciou.');})();return wasmReady;}
export function createMeiroClient(nativeCall){
 let authenticated=false,checked=false;
 window.nocturneHttp=async text=>JSON.stringify(await nativeCall({op:'yt-http',...JSON.parse(text)}));
 async function auth(){const state=await nativeCall({op:'yt-auth'});authenticated=!!state.connected;checked=true;return state;}
 async function run(body){await initialize();if(!checked)await auth();const result=JSON.parse(await window.nocturneYouTube(JSON.stringify({...body,authenticated})));if(result.error)throw Error(result.error);return result;}
 return {auth,ready:initialize,async call(body){if(body.op==='search'&&!body.params){let data=await run(body);const labels={songs:/^(músicas|musicas|songs)$/i,albums:/^(álbuns|albuns|albums)$/i,artists:/^(artistas|artists)$/i,playlists:/playlists/i,podcasts:/podcasts/i};const filter=data.filters?.find(f=>labels[body.kind]?.test(f.label));if(filter?.params)data=await run({...body,params:filter.params});return data;}
 if(body.op==='stream'){const data=await run(body);if(!data.url)throw Error('O YouTube não disponibilizou áudio para esta faixa.');return {...data,...await nativeCall({op:'yt-proxy',url:data.url})};}
 return run(body);}};
}
