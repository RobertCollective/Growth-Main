// Sections settle from a slightly smaller scale as scrolling brings them into place.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const selector=document.body.classList.contains('stop-page')?'main>section':'.story-intro,.story-panel,body>.editorial,body>.founder-section,body>.community-feed,body>.pop-archive,body>.growth-faq';
 const sections=[...document.querySelectorAll(selector)].map(el=>({el,top:0,current:1,target:1}));
 let frame=0,previous=0;
 function measure(){
  sections.forEach(item=>{let node=item.el,top=0;while(node){top+=node.offsetTop;node=node.offsetParent}item.top=top});
 }
 function targets(){
  const height=innerHeight;
  sections.forEach(item=>{
   const progress=Math.max(0,Math.min(1,(height-(item.top-scrollY))/(height*.75)));
   const ease=progress*progress*(3-2*progress);
   item.target=reduced.matches?1:.945+.055*ease;
  });
 }
 function draw(now){
  frame=0;if(document.hidden)return;
  const dt=Math.min(50,now-(previous||now-16));previous=now;targets();let moving=false;
  const amount=1-Math.exp(-dt/85);
  sections.forEach(item=>{
   const delta=item.target-item.current;
   if(Math.abs(delta)>.0001){item.current+=delta*amount;moving=true}else item.current=item.target;
   item.el.style.setProperty('--section-scale',String(item.current));
   item.el.classList.toggle('is-settling',Math.abs(item.target-item.current)>.0003);
  });
  if(moving)frame=requestAnimationFrame(draw);else previous=0;
 }
 function start(){if(!frame)frame=requestAnimationFrame(draw)}
 function refresh(){measure();targets();start()}
 sections.forEach(item=>item.el.classList.add('scroll-settle'));
 addEventListener('scroll',start,{passive:true});addEventListener('resize',refresh,{passive:true});
 addEventListener('load',refresh,{once:true});document.fonts.ready.then(refresh);
 new ResizeObserver(refresh).observe(document.body);
 reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(frame);frame=0;sections.forEach(item=>{item.current=item.target=1;item.el.style.setProperty('--section-scale','1');item.el.classList.remove('is-settling')})}else refresh()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=0}else refresh()});
 refresh();
})();
