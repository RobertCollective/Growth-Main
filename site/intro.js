// The same sliding mosaic closes one page and opens the next.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches)return;
 const referrer=document.referrer ? new URL(document.referrer) : null;
 const isFirstLoad=!referrer || referrer.origin !== location.origin;
 if(isFirstLoad)return;
 const layer=document.createElement('div');layer.className='growth-intro';
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
 const skip=document.createElement('button');skip.className='intro-skip';skip.textContent='Skip intro';layer.append(canvas,skip);
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const palette=['#050405','#025ed6','#f6e31a','#ff6aab','#fd0215','#ffffff'];
 let seed=(Date.now()>>>0)||1;
 try{const next=sessionStorage.getItem('growth-transition-seed');if(next)seed=Number(next);sessionStorage.removeItem('growth-transition-seed')}catch{}
 let state=seed,cells=[],frame,timer,done=false,closing=false,destination=null,start=performance.now();
 function random(){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296}
 function layout(){
  state=seed;const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
  const columns=w<700?12:24,size=w/columns,rows=Math.ceil(h/size);cells=[];
  for(let col=0;col<columns;col++){
   let color=palette[Math.floor(random()*palette.length)],remaining=0;
   for(let row=0;row<rows;row++){
    if(!remaining){color=palette[Math.floor(random()*palette.length)];remaining=3+Math.floor(random()*19)}remaining--;
    const check=Math.abs(row-Math.floor(rows*.28))<2&&col>5,accent=random()<.075;
    cells.push({x:col*size,y:row*size,size,color:check?((col+row)%2?'#ffffff':'#050405'):accent?palette[Math.floor(random()*palette.length)]:color,
     delay:check?30+(row%3)*65:150+(col%5)*44+(accent?90:0),tx:check?(row%2?1:-1)*(w+size*2):0,ty:check?0:(col%2?1:-1)*(h+size*2)});
   }
  }
 }
 function finish(){
  if(done)return;done=true;cancelAnimationFrame(frame);clearTimeout(timer);
  if(closing&&destination){location.assign(destination);return}
  layer.remove();window.growthIntroActive=false;document.dispatchEvent(new Event('growth-intro-complete'));
 }
 function draw(now){
  if(done)return;const elapsed=now-start;ctx.clearRect(0,0,innerWidth,innerHeight);
  cells.forEach(cell=>{
   const p=closing?1-Math.min(1,Math.max(0,(elapsed-cell.delay*.3)/550)):Math.min(1,Math.max(0,(elapsed-380-cell.delay)/780));
   if(p===1)return;const eased=p*p*(3-2*p);
   ctx.save();ctx.translate(cell.x+cell.size/2+cell.tx*eased,cell.y+cell.size/2+cell.ty*eased);ctx.fillStyle=cell.color;ctx.fillRect(-cell.size/2-.5,-cell.size/2-.5,cell.size+1,cell.size+1);ctx.restore();
  });
  if(elapsed>(closing?720:1600))finish();else frame=requestAnimationFrame(draw);
 }
 function begin(close=false,url=null){
  cancelAnimationFrame(frame);clearTimeout(timer);done=false;closing=close;destination=url;start=performance.now();window.growthIntroActive=true;
  layer.classList.toggle('is-closing',close);document.body.prepend(layer);layout();draw(start);timer=setTimeout(finish,close?850:1800);
 }
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduced.matches)return;
  const link=event.target.closest('a[href]');if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||url.pathname===location.pathname||!(/\.html$/.test(url.pathname)||url.pathname.endsWith('/')))return;
  event.preventDefault();if(closing)return;
  try{sessionStorage.setItem('growth-transition-seed',String(seed))}catch{}
  begin(true,url.href);
 });
 skip.addEventListener('click',finish);document.addEventListener('keydown',event=>{if(event.key==='Escape')finish()});
 addEventListener('resize',()=>{if(!done)layout()});
 addEventListener('pageshow',event=>{if(event.persisted){cancelAnimationFrame(frame);clearTimeout(timer);layer.remove();done=true;closing=false;window.growthIntroActive=false;document.dispatchEvent(new Event('growth-intro-complete'))}});
 reduced.addEventListener('change',()=>{if(reduced.matches)finish()});begin();
})();
