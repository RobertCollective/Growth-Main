// Local square accents live behind content on selected black surfaces.
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const colors=['#025ed6','#f6e31a','#ff6aab','#fd0215','#ffffff'];
 const pattern=Array.from({length:18},(_,i)=>[i%2,i]);
 const specs=[
  {selector:'.stop-hero',side:.86,depth:.35},
  {selector:'#experience',side:.12,top:100},
  {selector:'#experience',side:.88,bottom:130},
  {selector:'#faq',side:.86,top:100},
  {selector:'#stop-quote',side:.12,depth:.6},
  {selector:'#founder',side:.86,top:140},
  {selector:'#tickets',side:.12,top:240},
  {selector:'.stop-other-cities',side:.86,depth:.7}
 ];
 const accents=specs.map(spec=>{
  const host=document.querySelector(spec.selector);if(!host)return null;
  host.classList.add('mosaic-host');
  const el=document.createElement('div');el.className='mosaic-cluster';el.setAttribute('aria-hidden','true');host.append(el);
  const blocks=pattern.map(()=>{const block=document.createElement('i');el.append(block);return block});
  return {...spec,host,el,blocks,level:0,target:0,inside:false,drift:0,seed:Math.random()};
 }).filter(Boolean);
 let raf=0,previous=0,lastScroll=-10000,lastY=scrollY;
 function arrange(accent){
  const tile=innerWidth<=800?8:24;
  const left=Math.max(tile*3,Math.min(innerWidth-tile*4,innerWidth*(accent.side+(Math.random()-.5)*.12)));
  const top=accent.top??(accent.bottom?accent.host.offsetHeight-accent.bottom:accent.host.offsetHeight*accent.depth);
  accent.anchor=top;accent.el.style.left='0px';accent.el.style.top=top+'px';
  accent.blocks.forEach((block,i)=>{
   const [col,row]=pattern[(i+Math.floor(accent.seed*pattern.length))%pattern.length];
   const size=tile*[.6,1,1.45,1.8][Math.floor(Math.random()*4)];const edge=Math.random()*innerWidth*.16;block.style.left=(i%2?innerWidth-edge-size:edge)+'px';block.style.top=((Math.random()-.5)*Math.min(440,accent.host.offsetHeight*.8))+'px';block.phase=Math.random()*.4;block.level=0;block.style.opacity='0';block.style.transform='scale(0)';
   block.style.width=size*(Math.random()>.85?2:1)+'px';block.style.height=size+'px';
   block.style.background=colors[Math.floor(Math.random()*colors.length)];
   block.style.display=innerWidth<=800&&i>7?'none':'block';
  });
 }
 function locate(){
  accents.forEach(accent=>{
   const y=accent.host.getBoundingClientRect().top+accent.anchor;
   const progress=(innerHeight*.9-y)/(innerHeight*.8);
   const inside=progress>0&&progress<1;
   if(inside&&!accent.inside){accent.seed=Math.random();arrange(accent)}
   accent.inside=inside;
   accent.target=inside?Math.sin(progress*Math.PI)*.85:0;
   accent.progress=Math.max(0,Math.min(1,progress));accent.drift=(accent.progress-.5)*20;
  });
 }
 function clear(){accents.forEach(a=>{a.level=0;a.target=0;a.el.style.opacity='0';a.blocks.forEach(b=>{b.level=0;b.style.opacity='0'})})}
 function draw(time){
  raf=0;
  if(preference.matches||document.hidden||document.body.classList.contains('paused')){clear();return}
  const dt=Math.min(64,time-(previous||time));previous=time;
  let moving=false;
  accents.forEach(a=>{
   const idle=time-lastScroll;
   const desired=idle>700?0:a.target;
   a.level=desired;
   a.el.style.opacity='1';
   a.blocks.forEach(block=>{
    const phase=((a.progress||0)-block.phase)*1.7;
    const on=desired>0&&phase>.035&&phase<.94&&idle<500+block.phase*140;
    block.level=on?Math.min(1,block.level+dt/180):Math.max(0,block.level-dt/180);
    const scale=block.level*block.level*(3-2*block.level);
    block.style.opacity=block.level>0?'1':'0';block.style.transform=`scale(${scale})`;
    if(block.level>0)moving=true;
   });
   a.el.style.transform='none';
   if(desired)moving=true;
  });
  if(moving)raf=requestAnimationFrame(draw);else previous=0;
 }
 const start=()=>{if(!raf)raf=requestAnimationFrame(draw)};
 addEventListener('scroll',()=>{
  const distance=Math.abs(scrollY-lastY);lastY=scrollY;
  if(!distance||preference.matches||document.body.classList.contains('paused'))return;
  lastScroll=performance.now();locate();if(accents.some(a=>a.level||a.target))start();
 },{passive:true});
 addEventListener('resize',()=>{accents.forEach(arrange);locate();if(accents.some(a=>a.level))start()},{passive:true});
 preference.addEventListener('change',clear);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});
 accents.forEach(arrange);
})();

// Mobile speaker tiles exchange real grid positions with horizontal and vertical moves.
(()=>{
 const grid=document.querySelector('.speaker-lineup.stacked-mobile');
 const mobile=matchMedia('(max-width:600px)'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let order=[...grid.querySelectorAll('.speaker-column:not(.speaker-preview)')];
 const preview=grid.querySelector('.speaker-preview');if(preview)preview.remove();
 const originalOrder=[...order];
 // Keep each speaker's brand color while their position changes.
 order.forEach(tile=>{const style=getComputedStyle(tile);tile.style.background=style.backgroundColor;tile.style.color=style.color});
 let visible=false,busy=false,step=0,restUntil=0;
 function layout(){
  grid.dataset.bento=String(step%2);
  if(mobile.matches){
   const featured=step%2===0?0:1;
   const andrew=order.findIndex(tile=>tile.querySelector('img')?.getAttribute('src').includes('andrew-cordle'));
   if(andrew>=0&&andrew!==featured)[order[andrew],order[featured]]=[order[featured],order[andrew]];
   order.forEach(tile=>grid.append(tile));
    }else{
     order=[...originalOrder];order.forEach(tile=>grid.append(tile));
  }
  order.forEach((tile,i)=>{tile.style.gridArea=mobile.matches?String.fromCharCode(97+i):'';tile.classList.toggle('bento-narrow',mobile.matches&&(step%2===0?i>=4:i===2||i===3))});
 }
 layout();
 const flights=new Set();
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{threshold:.08}).observe(grid);
 grid.addEventListener('pointerdown',()=>{restUntil=Date.now()+1800},{passive:true});
 addEventListener('scroll',()=>{restUntil=Date.now()+400},{passive:true});
 function swap(){
  if(!mobile.matches||motion.matches||!visible||document.hidden||busy||Date.now()<restUntil)return;
  busy=true;
  const before=new Map(order.map(tile=>[tile,tile.getBoundingClientRect()]));
  const phase=step++%4;
  if(phase===0){const row=Math.floor(Math.random()*3)*2;[order[row],order[row+1]]=[order[row+1],order[row]]}
  if(phase===1){const col=Math.floor(Math.random()*2);[order[col],order[col+2]]=[order[col+2],order[col]]}
  if(phase===2){const col=Math.floor(Math.random()*2),bottom=order[col+4];order[col+4]=order[col+2];order[col+2]=order[col];order[col]=bottom}
  if(phase===3){const row=Math.floor(Math.random()*3)*2;[order[row],order[row+1]]=[order[row+1],order[row]]}
  order.forEach(tile=>grid.append(tile));
  layout();
  const moving=[];
  order.forEach(tile=>{
   const old=before.get(tile),next=tile.getBoundingClientRect(),dx=old.left-next.left,dy=old.top-next.top;
   const sx=old.width/next.width,sy=old.height/next.height;
   if(Math.abs(dx)+Math.abs(dy)+Math.abs(sx-1)+Math.abs(sy-1)<.01)return;
   const animation=tile.animate([
    {transform:`translate3d(${dx}px,${dy}px,0)`,width:old.width+'px',height:old.height+'px',zIndex:8},
    {transform:'translate3d(0,0,0)',width:next.width+'px',height:next.height+'px',zIndex:8}
   ],{duration:1050,easing:'cubic-bezier(.22,1,.36,1)'});
   flights.add(animation);
   moving.push(animation.finished.catch(()=>{}).finally(()=>flights.delete(animation)));
  });
  Promise.all(moving).finally(()=>{busy=false});
 }
 setInterval(swap,4200);
 function settle(){flights.forEach(animation=>animation.cancel());flights.clear();busy=false}
 mobile.addEventListener('change',()=>{settle();layout()});motion.addEventListener('change',settle);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)settle()});
})();


(()=>{
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const logo=document.querySelector('.header-logo-video');if(logo&&!motion.matches){const play=()=>logo.play().catch(()=>{});if(window.growthIntroActive)document.addEventListener('growth-intro-complete',play,{once:true});else play()}
 if(!motion.matches){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('stop-typed');observer.unobserve(entry.target)}}),{threshold:.12});
  document.querySelectorAll('[data-type-title]').forEach(title=>{
   const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT);const nodes=[];let n;while(n=walker.nextNode())nodes.push(n);
   const total=nodes.reduce((sum,n)=>sum+Array.from(n.textContent).length,0);let index=0;
   nodes.forEach(node=>{const fragment=document.createDocumentFragment();Array.from(node.textContent).forEach(char=>{const span=document.createElement('span');span.className='stop-letter';span.textContent=char;span.style.setProperty('--letter-delay',`${index++*Math.min(18,800/total)}ms`);fragment.append(span)});node.replaceWith(fragment)});observer.observe(title);
  });
 }
 motion.addEventListener('change',()=>{if(motion.matches){logo?.pause();document.querySelectorAll('[data-type-title]').forEach(title=>title.classList.add('stop-typed'))}});
})();

// Close the compact menu after choosing a section or another page.
(()=>{
 const menu=document.querySelector('.stop-mobile-menu');if(!menu)return;
 menu.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')menu.open=false});
})();

// Ticket selection and a local order review; checkout stays closed until connected.
(()=>{
 const form=document.querySelector('.registration-form');if(!form)return;
 const tier=form.elements.tier,quantity=form.elements.quantity,subtotal=form.elements.subtotal;
 const summary=form.querySelector('.registration-summary');
 const currency=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
 function update(){
  subtotal.value=currency.format(Number(tier.selectedOptions[0].dataset.price)*Number(quantity.value));
  summary.hidden=true;
  document.querySelectorAll('[data-select-tier]').forEach(link=>{
   const selected=link.dataset.selectTier===tier.value;
   link.classList.toggle('is-selected',selected);
   link.textContent=selected?'SELECTED':'SELECT TICKET';
  });
 }
 document.querySelectorAll('[data-select-tier]').forEach(link=>link.addEventListener('click',()=>{
  tier.value=link.dataset.selectTier;update();
  setTimeout(()=>form.elements.firstName.focus({preventScroll:true}),300);
 }));
 form.addEventListener('input',update);
 form.addEventListener('change',update);
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  form.querySelector('.registration-order-details').textContent=`${quantity.value} × ${tier.selectedOptions[0].textContent.split(' — ')[0]} · ${subtotal.value}`;
  form.querySelector('.registration-attendee').textContent=`${form.elements.firstName.value.trim()} ${form.elements.lastName.value.trim()} · ${form.elements.email.value.trim()}`;
  summary.hidden=false;summary.focus({preventScroll:true});
  summary.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
 });
 update();
})();
