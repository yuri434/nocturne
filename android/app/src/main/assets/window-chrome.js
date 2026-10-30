export function setupWindowChrome(call){
 const controls=document.createElement('div');controls.id='window-controls';controls.hidden=true;controls.setAttribute('aria-label','Controles da janela');
 const invoke=action=>call({op:'window-command',action}).then(update).catch(()=>{});
 for(const [action,label,icon]of [['minimize','Minimizar','—'],['maximize','Maximizar','□'],['close','Fechar','×']]){const b=document.createElement('button');b.type='button';b.dataset.windowAction=action;b.setAttribute('aria-label',label);b.title=label;b.textContent=icon;b.onclick=()=>invoke(action);controls.append(b);}document.body.append(controls);
 const grip=document.createElement('div');grip.id='window-grips';grip.hidden=true;for(const edge of ['top','bottom','left','right','top-left','top-right','bottom-left','bottom-right']){const el=document.createElement('div');el.dataset.edge=edge;el.addEventListener('pointerdown',e=>{if(e.button===0){e.preventDefault();invoke('resize-'+edge);}});grip.append(el);}document.body.append(grip);
 const header=document.querySelector('header');header.addEventListener('mousedown',e=>{if(!document.body.classList.contains('desktop-chrome')||e.button!==0||e.target.closest('button,input,select,form,a'))return;e.preventDefault();invoke(e.detail===2?'maximize':'drag');});
 function update(state){if(!state?.chrome)return;controls.hidden=false;grip.hidden=!!state.maximized;document.body.classList.add('desktop-chrome');document.body.classList.toggle('window-maximized',!!state.maximized);const b=controls.querySelector('[data-window-action=maximize]');b.textContent=state.maximized?'❐':'□';b.title=state.maximized?'Restaurar':'Maximizar';b.setAttribute('aria-label',b.title);}
 return {update};
}
