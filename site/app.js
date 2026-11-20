const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;document.querySelector('.sound')?.addEventListener('click',e=>{const paused=document.body.classList.toggle('paused');e.currentTarget.setAttribute('aria-pressed',paused);e.currentTarget.setAttribute('aria-label',paused?'Resume ambient animation':'Pause ambient animation')});if(!reduced){document.querySelector('.hero').addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;document.documentElement.style.setProperty('--px',`${(e.clientX/innerWidth-.5)*5}px`);document.documentElement.style.setProperty('--py',`${(e.clientY/innerHeight-.5)*5}px`)});document.querySelectorAll('.card').forEach(c=>{c.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){const r=c.getBoundingClientRect();c.style.setProperty('--tilt',`${(e.clientX-r.left-r.width/2)/r.width*2}deg`)}});c.addEventListener('pointerleave',()=>c.style.setProperty('--tilt','0deg'))})}const speakers=[['mark-cuban.webp','Mark Cuban'],['martha-stewart.webp','Martha Stewart'],['kevin-oleary.webp','Kevin O’Leary'],['alex-rodriguez.webp','Alex Rodriguez'],['andrew-cordle.webp','Andrew Cordle'],['gary-vee.webp','Gary Vee']];
document.querySelectorAll('[data-portrait]').forEach(el=>{const speaker=speakers[+el.dataset.portrait%6];el.innerHTML=`<img src="assets/speakers/${speaker[0]}" alt="${speaker[1]}" class="portrait-image" loading="lazy">`});
document.querySelectorAll('.editorial-image').forEach(el=>{const speaker=speakers[+el.dataset.editorialImage%6];el.innerHTML=`<img src="assets/speakers/cutouts/${speaker[0].replace(/\.[^.]+$/,'.webp')}" alt="" loading="lazy">`});
const editorialResize=new ResizeObserver(entries=>entries.forEach(({target,contentRect})=>{const ink=target.querySelector('.word-ink');target.style.setProperty('--word-scale',contentRect.width/ink.scrollWidth)}));
document.querySelectorAll('.type-word').forEach(el=>editorialResize.observe(el));document.fonts.ready.then(()=>document.querySelectorAll('.type-word').forEach(el=>{const ink=el.querySelector('.word-ink');el.style.setProperty('--word-scale',el.clientWidth/ink.scrollWidth)}));
const panels=[...document.querySelectorAll('.story-panel')];let scrollFrame=0;
function updateStory(){scrollFrame=0;panels.forEach((panel,i)=>{if(reduced||document.body.classList.contains('paused'))return;const next=panels[i+1];const progress=next?Math.max(0,Math.min(1,1-(next.getBoundingClientRect().top-innerHeight*.15)/(innerHeight*.8))):0;panel.style.setProperty('--panel-scale',1-progress*.045);const rect=panel.getBoundingClientRect();const travel=Math.max(-1,Math.min(1,(innerHeight*.5-rect.top)/innerHeight));panel.style.setProperty('--portrait-shift',`${travel*-18}px`);panel.style.setProperty('--marquee-shift',`${travel*-45}px`);panel.style.setProperty('--strip-shift',`${travel*30}px`)});}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateStory)},{passive:true});addEventListener('resize',updateStory);updateStory();
const editorialEntrance=new IntersectionObserver(entries=>entries.forEach(entry=>{entry.target.classList.toggle('in-view',entry.isIntersecting||reduced)}),{threshold:.15});document.querySelectorAll('.editorial-row').forEach(el=>editorialEntrance.observe(el));
const communityEntrance=new IntersectionObserver(entries=>entries.forEach(entry=>{entry.target.classList.toggle('revealed',entry.isIntersecting||reduced)}),{threshold:.12});document.querySelectorAll('.community-card').forEach(el=>communityEntrance.observe(el));
// Bounded scroll movement for the supplied background motifs.
const motifSections=[...document.querySelectorAll('.hero,.story-panel,.editorial,.community-feed,.pop-archive')];let motifFrame=0;
function moveMotifs(){motifFrame=0;if(reduced||document.body.classList.contains('paused'))return;motifSections.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.setProperty('--motif-shift',`${Math.max(-16,Math.min(16,(innerHeight*.5-r.top)*.02))}px`)})}
addEventListener('scroll',()=>{if(!motifFrame)motifFrame=requestAnimationFrame(moveMotifs)},{passive:true});moveMotifs();

// Coordinated entrances, followed by restrained ambient movement.
const motionTargets=[...document.querySelectorAll('.growth-logo,.hero-city,.story-intro h2,.story-panel h3,.benefit-row,.event-shot,.testimonial-placeholder,.community-feed h2,.community-feed>p,.founder-copy h2,.founder-portrait')];
if(!reduced){
  motionTargets.forEach((el,i)=>{el.classList.add('motion-reveal');el.style.setProperty('--reveal-delay',`${(i%3)*90}ms`)});
  const motionEntrance=new IntersectionObserver(entries=>entries.forEach(entry=>{entry.target.classList.toggle('motion-visible',entry.isIntersecting)}),{threshold:.08});
  motionTargets.forEach(el=>motionEntrance.observe(el));
  document.querySelectorAll('.speaker-name,.story-panel h3,.story-intro h2').forEach(title=>{
    [...title.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim()).forEach((node,i)=>{const span=document.createElement('span');span.className='motion-text-line';span.textContent=node.textContent;span.style.setProperty('--line-delay',`${i*100}ms`);node.replaceWith(span)});
  });

}

// A touch-native mobile stage. Rotation rests while browsing, offscreen, or paused.
(()=>{
 const hero=document.querySelector('.speaker-hero');
 const lineup=hero.querySelector('.speaker-lineup');
 const slides=[...lineup.querySelectorAll('.speaker-column')];
 const preview=slides[0].cloneNode(true);preview.classList.add('speaker-preview');preview.removeAttribute('id');preview.setAttribute('aria-hidden','true');preview.querySelector('img').alt='';preview.querySelector('img').loading='lazy';lineup.append(preview);
 const mobile=matchMedia('(max-width:800px)');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const controls=document.createElement('nav');
 controls.className='mobile-speaker-controls';
 controls.setAttribute('aria-label','Choose a featured speaker');
 slides.forEach((slide,i)=>{
  const button=document.createElement('button');
  button.type='button';
  button.setAttribute('aria-label',slide.querySelector('img').alt);
  button.setAttribute('aria-controls',`featured-speaker-${i}`);
  slide.id=`featured-speaker-${i}`;
  button.addEventListener('click',()=>{restUntil=Date.now()+12000;go(i)});
  controls.append(button);
 });
 lineup.after(controls);
 const buttons=[...controls.children];
 let current=0,visible=true,restUntil=0,timer=0,frame=0;
 function select(i){
  current=i;
  slides.forEach((slide,j)=>slide.classList.toggle('is-current',j===i));
  buttons.forEach((button,j)=>button.setAttribute('aria-current',String(j===i)));
 }
 function go(i){
  if(mobile.matches&&lineup.classList.contains('stacked-mobile')){select(i);return}
  const x=slides[i].offsetLeft-slides[0].offsetLeft;
  lineup.scrollTo({left:x,behavior:motion.matches||i===0?'instant':'smooth'});
  if(Math.abs(lineup.scrollLeft-x)<1)select(i);
 }
 function sync(){frame=0;if(!mobile.matches||lineup.classList.contains('stacked-mobile'))return;const width=slides[0].getBoundingClientRect().width;select(Math.max(0,Math.min(slides.length-1,Math.round(lineup.scrollLeft/width))))}
 lineup.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(sync)},{passive:true});
 const rest=()=>{restUntil=Date.now()+12000};
 lineup.addEventListener('pointerdown',rest,{passive:true});
 lineup.addEventListener('touchstart',rest,{passive:true});
 lineup.addEventListener('wheel',rest,{passive:true});
 hero.addEventListener('focusin',rest);
 function configure(){
  clearInterval(timer);
  if(!mobile.matches){lineup.scrollLeft=0;return}
  select(current);
  if(motion.matches||lineup.classList.contains('stacked-mobile'))return;
  timer=setInterval(()=>{
   if(!visible||document.hidden||document.body.classList.contains('paused')||Date.now()<restUntil||(controls.contains(document.activeElement)||lineup.contains(document.activeElement)))return;
   go((current+1)%slides.length);
  },5000);
 }
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{threshold:.35}).observe(hero);
 mobile.addEventListener('change',configure);
 motion.addEventListener('change',configure);
 addEventListener('resize',()=>{if(mobile.matches&&!lineup.classList.contains('stacked-mobile')){lineup.scrollTo({left:slides[current].offsetLeft-slides[0].offsetLeft,behavior:'instant'})}});
 select(0);configure();
 const stackedEntrance=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('speaker-in-view',entry.isIntersecting)),{threshold:.2});slides.forEach(slide=>stackedEntrance.observe(slide));
})();



// Local square accents live behind content on selected black surfaces.
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const colors=['#025ed6','#f6e31a','#ff6aab','#fd0215','#ffffff'];
 const pattern=Array.from({length:18},(_,i)=>[i%2,i]);
 const specs=[
  {selector:'.hero-city',side:.86,depth:.35},
  {selector:'#growth-world',side:.12,top:100},
  {selector:'#growth-world',side:.88,bottom:130},
  {selector:'#faq',side:.86,top:100},
  {selector:'#editorial',side:.12,depth:.6},
  {selector:'#founder',side:.86,top:140},
  {selector:'#tour',side:.12,top:240}
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

// Five unique celebrity blurbs, shuffled on entry and replaced one at a time.
(()=>{
 const pool=[{"name": "Kevin O’Leary", "photo": "kevin-oleary.webp", "quote": "Andrew is one of the top thought leaders in financial literacy for business."}, {"name": "Mark Cuban", "photo": "mark-cuban.webp", "quote": "Andrew does a great job of helping entrepreneurs reach their goals."}, {"name": "Martha Stewart", "photo": "martha-stewart.webp", "quote": "Andrew's a great interviewer."}, {"name": "Alex Rodriguez", "photo": "alex-rodriguez.webp", "quote": "Andrew and I have great chemistry, so that's great. We jam out."}, {"name": "Gary Vee", "photo": "gary-vee.webp", "quote": "What I appreciate about people like Andrew is there's not a lot of practitioners and operators out there."}, {"name": "Mike Tyson", "photo": "mike-tyson.webp", "quote": "Andrew is extremely genuine and just very real."}, {"name": "Tim Tebow", "photo": "tim-tebow.webp", "quote": "It's real, it's from his heart, and he truly cares."}, {"name": "Kendra Scott", "photo": "kendra-scott.webp", "quote": "Andrew is amazing, I felt like I was talking with one of my best friends!"}];
 const section=document.querySelector('#founder');
 const slots=[...section.querySelectorAll('[data-blurb-slot]')];
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let chosen=[],visible=false,nextSlot=0,initialized=false;
 function fill(slot,entry){
  const image=slot.querySelector('img');image.src='assets/speakers/'+entry.photo;image.alt=entry.name;
  slot.querySelector('blockquote').textContent='“'+entry.quote+'”';
  slot.querySelector('.blurb-name').textContent=entry.name;
  slot.style.setProperty('--blurb-tilt',((Math.random()-.5)*4)+'deg');
  slot.style.setProperty('--blurb-duration',(5+Math.random()*3)+'s');
  slot.style.setProperty('--blurb-delay',(-Math.random()*6)+'s');
 }
 function shuffle(){
  const indices=pool.map((_,i)=>i);
  for(let i=indices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]]}
  chosen=indices.slice(0,5);chosen.forEach((index,i)=>fill(slots[i],pool[index]));
 }
 shuffle();
 new IntersectionObserver(entries=>{
  const wasVisible=visible;visible=entries[0].isIntersecting;
  if(visible&&!wasVisible){if(initialized)shuffle();initialized=true}
 },{threshold:.12}).observe(section);
 setInterval(()=>{
  if(!visible||document.hidden||motion.matches||document.body.classList.contains('paused')||section.matches(':hover')||section.contains(document.activeElement))return;
  const available=pool.map((_,i)=>i).filter(i=>!chosen.includes(i));
  const index=available[Math.floor(Math.random()*available.length)];
  const activeSlots=innerWidth<=600?slots.slice(0,3):slots;
  const slotIndex=nextSlot++%activeSlots.length,slot=activeSlots[slotIndex];
  slot.classList.add('blurb-changing');
  setTimeout(()=>{chosen[slotIndex]=index;fill(slot,pool[index]);slot.classList.remove('blurb-changing')},350);
 },9000);
})();

// Mobile speaker tiles exchange real grid positions with horizontal and vertical moves.
(()=>{
 const grid=document.querySelector('.speaker-lineup.stacked-mobile');
 const mobile=matchMedia('(max-width:800px)'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let order=[...grid.querySelectorAll('.speaker-column:not(.speaker-preview)')];
 const preview=grid.querySelector('.speaker-preview');if(preview)preview.remove();
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

// Text reveals in discrete character steps, while keeping its final layout intact.
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const selector='.hero-city,.story-intro h2,.story-panel h3,.benefit-row h4,.editorial-heading,.tour-intro h2,.tour-card h3,.pop-archive h2,.growth-faq h2';
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){if(window.growthIntroActive)entry.target.dataset.typePending='true';else entry.target.classList.add('is-typed');observer.unobserve(entry.target)}
 }),{threshold:.08});
 function typeText(el,immediate=false){
  if(preference.matches)return;
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  const nodes=[];let node;
  while(node=walker.nextNode()){
   if(node.parentElement.closest('.typed-char,svg,[aria-hidden="true"]'))continue;
   if(node.textContent)nodes.push(node);
  }
  const total=nodes.reduce((n,node)=>n+Array.from(node.textContent).length,0);
  const step=Math.min(18,900/Math.max(1,total));let index=0;
  el.classList.remove('is-typed');
  nodes.forEach(node=>{
   const fragment=document.createDocumentFragment();
   Array.from(node.textContent).forEach(char=>{
    const span=document.createElement('span');span.className='typed-char';span.textContent=char;
    span.style.setProperty('--char-delay',`${index++*step}ms`);fragment.append(span);
   });node.replaceWith(fragment);
  });
  el.classList.add('typed-text');
  if(immediate)requestAnimationFrame(()=>el.classList.add('is-typed'));else observer.observe(el);
 }
 document.addEventListener('growth-intro-complete',()=>document.querySelectorAll('[data-type-pending]').forEach(el=>{el.classList.add('is-typed');delete el.dataset.typePending}));
 document.querySelectorAll(selector).forEach(el=>typeText(el));
 preference.addEventListener('change',()=>{if(preference.matches)document.querySelectorAll('.typed-text').forEach(el=>el.classList.add('is-typed'))});
})();

// Play the supplied logo once the opening curtain has cleared.
(()=>{
 const logo=document.querySelector('.header-logo-video');if(!logo)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 function play(){if(!motion.matches&&!document.hidden){logo.currentTime=0;logo.play().catch(()=>{})}}
 if(window.growthIntroActive)document.addEventListener('growth-intro-complete',play,{once:true});else play();
 motion.addEventListener('change',()=>{if(motion.matches)logo.pause();else play()});
})();
