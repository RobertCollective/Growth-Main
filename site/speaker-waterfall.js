// Reveal entire speaker cards in a descending sequence after the page intro.
(()=>{
 const desktop=matchMedia('(min-width:801px)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const grids=[...document.querySelectorAll('.speaker-lineup')];
 const completed=new Set(),flights=new Set();
 let introReady=!window.growthIntroActive;
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting&&introReady)reveal(entry.target);
 }),{threshold:.12});
 function reveal(grid){
  if(completed.has(grid)||!desktop.matches||reduced.matches)return;
  completed.add(grid);observer.unobserve(grid);
  [...grid.children].forEach((card,index)=>{
   card.classList.remove('waterfall-pending');
   const flight=card.animate([
    {transform:'translate3d(0,-64px,0)',clipPath:'inset(0 0 100% 0 round 12px)'},
    {transform:'translate3d(0,0,0)',clipPath:'inset(0 0 0% 0 round 12px)'}
   ],{duration:850,delay:index*150,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
   flights.add(flight);flight.finished.catch(()=>{}).finally(()=>flights.delete(flight));
  });
 }
 function prepare(){
  if(!desktop.matches||reduced.matches){
   flights.forEach(flight=>flight.cancel());flights.clear();
   grids.forEach(grid=>{observer.unobserve(grid);[...grid.children].forEach(card=>card.classList.remove('waterfall-pending'))});
   return;
  }
  grids.filter(grid=>!completed.has(grid)).forEach(grid=>{
   [...grid.children].forEach(card=>card.classList.add('waterfall-pending'));
   observer.observe(grid);
   const rect=grid.getBoundingClientRect();
   if(introReady&&rect.top<innerHeight*.88&&rect.bottom>0)reveal(grid);
  });
 }
 document.addEventListener('growth-intro-complete',()=>{introReady=true;prepare()},{once:true});
 desktop.addEventListener('change',prepare);reduced.addEventListener('change',prepare);
 window.addEventListener('pageshow',event=>{if(event.persisted){introReady=true;prepare()}});
 prepare();
})();
