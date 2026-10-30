export const headNames={creeper:'Nocturne'};
const sources=new Map();
function sourceFor(head){if(!sources.has(head))sources.set(head,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{sources.delete(head);reject(Error('Cabeça indisponível'));};image.src='mascot.png';}));return sources.get(head);}
export async function headData(head,color,original=false){
 head=Object.hasOwn(headNames,head)?head:'creeper';const source=await sourceFor(head);const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.drawImage(source,0,0,96,96);
 if(!original&&/^#[0-9a-f]{6}$/i.test(color)){const data=ctx.getImageData(0,0,96,96),rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));let maximum=1;for(let i=0;i<data.data.length;i+=4)maximum=Math.max(maximum,...data.data.slice(i,i+3));for(let i=0;i<data.data.length;i+=4){const scale=Math.max(...data.data.slice(i,i+3))/maximum;if(i/4/96>96*.62&&data.data[i]>data.data[i+1]*1.3&&data.data[i]>data.data[i+2]*1.2)for(let c=0;c<3;c++)data.data[i+c]=Math.round(rgb[c]*scale);}ctx.putImageData(data,0,0);}
 return canvas.toDataURL('image/png');
}
export class ThemeLogo{
 constructor(image){this.image=image;this.revision=0;}
 async paint(color,head='creeper',original=false){const key=head+color+original;if(key===this.key)return;this.key=key;const revision=++this.revision;try{const data=await headData(head,color,original);if(revision===this.revision){this.image.src=data;this.image.alt=headNames[head]||'Nocturne';}}catch{this.key=null;}}
}
export function setupHeadPicker({getSettings,save}){
 const $=id=>document.getElementById(id),dialog=$('head-picker');let revision=0;
 async function refresh(){const ticket=++revision,s=getSettings(),color=s.logoMode==='custom'?s.logoColor:getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),original=s.logoMode==='original';$('head-mode').value=s.logoMode;$('head-color').value=s.logoColor;$('head-custom-label').hidden=s.logoMode!=='custom';for(const b of $('head-options').children){const head=b.dataset.head;b.setAttribute('aria-pressed',String(head===s.logoHead));const data=await headData(head,color,original);if(ticket!==revision)return;b.querySelector('img').src=data;}}
 for(const [id,name]of Object.entries(headNames)){const b=document.createElement('button');b.type='button';b.dataset.head=id;b.setAttribute('aria-pressed','false');const img=new Image();img.alt='';const label=document.createElement('span');label.textContent=name;b.append(img,label);b.onclick=()=>{save('logoHead',id);refresh();};$('head-options').append(b);}
 $('brand-button').onclick=()=>{refresh();dialog.showModal();};$('head-settings-open').onclick=()=>{refresh();dialog.showModal();};$('head-close').onclick=()=>dialog.close();$('head-mode').onchange=e=>{save('logoMode',e.target.value);refresh();};$('head-color').oninput=e=>{save('logoColor',e.target.value);refresh();};return {refresh};
}
