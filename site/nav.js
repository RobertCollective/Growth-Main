// Shared site navigation: the kinetic full-screen menu, its Menu toggle, and the
// floating Tickets/Menu buttons that lift above the footer. Loaded on every page.
// Kinetic full-screen menu.
(()=>{
  const toggle=document.querySelector('.growth-menu-toggle');
  const menu=document.querySelector('.growth-kinetic-menu');
  const closeButton=document.querySelector('.growth-menu-close');
  if(!toggle||!menu||!closeButton)return;

  let previousFocus=null;
  function openMenu(){
    previousFocus=document.activeElement;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden','false');
    toggle.setAttribute('aria-expanded','true');
    document.body.classList.add('growth-menu-open');
    closeButton.focus();
  }
  function closeMenu(){
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden','true');
    toggle.setAttribute('aria-expanded','false');
    document.body.classList.remove('growth-menu-open');
    if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus();
  }

  toggle.addEventListener('click',()=>menu.classList.contains('is-open')?closeMenu():openMenu());
  closeButton.addEventListener('click',closeMenu);
  menu.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',closeMenu));
  addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.classList.contains('is-open'))closeMenu()});
})();

// Lift the floating Tickets/Menu buttons so they rest above the footer instead of covering it.
(()=>{
  const footer=document.querySelector('.growth-footer');if(!footer)return;
  const root=document.documentElement;let frame=0;
  function lift(){frame=0;root.style.setProperty('--footer-lift',Math.max(0,innerHeight-footer.getBoundingClientRect().top)+'px')}
  const queue=()=>{if(!frame)frame=requestAnimationFrame(lift)};
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);lift();
})();
