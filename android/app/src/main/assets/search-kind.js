// The native Windows popup can ignore page colors. Keep the select as the form
// value and render its choices using the same themed controls on both platforms.
export function setupSearchKind(select){
 const host=document.createElement('div');host.className='search-kind';select.before(host);host.append(select);select.hidden=true;
 const button=document.createElement('button');button.type='button';button.className='search-kind-button';button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',select.getAttribute('aria-label'));
 const menu=document.createElement('div');menu.className='search-kind-menu';menu.id='search-kind-options';menu.role='listbox';menu.hidden=true;button.setAttribute('aria-controls',menu.id);host.append(button,menu);
 const close=()=>{menu.hidden=true;button.setAttribute('aria-expanded','false');};
 const sync=()=>{button.textContent=select.selectedOptions[0].text+' ▾';[...menu.children].forEach((b,i)=>b.setAttribute('aria-selected',String(i===select.selectedIndex)));};
 for(const option of select.options){const b=document.createElement('button');b.type='button';b.role='option';b.textContent=option.text;b.onclick=()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync();close();button.focus();};menu.append(b);}
 button.onclick=()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));sync();if(!menu.hidden)menu.children[select.selectedIndex].focus();};
 host.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();close();button.focus();}if(!menu.hidden&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const rows=[...menu.children],at=rows.indexOf(document.activeElement),i=e.key==='Home'?0:e.key==='End'?rows.length-1:(at+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length;rows[i].focus();}};
 document.addEventListener('pointerdown',e=>{if(!host.contains(e.target))close();});host.addEventListener('focusout',e=>{if(!host.contains(e.relatedTarget))close();});select.addEventListener('change',sync);sync();
}
