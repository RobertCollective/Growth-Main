// Reveal mobile content in cohesive groups, with a soft settling motion.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches)return;
 const targets=document.querySelectorAll('.benefit-row,.event-shot,.testimonial-placeholder,.founder-bio,.founder-portrait,.city-ticket-link,.faq-item,.stop-benefits article,.stop-event-collage img,.stop-founder-copy,.stop-founder-stage,.stop-event-ticket,.stop-arrival-grid figure,.stop-skyline');
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-soft-visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px 40px 0px'});
 targets.forEach((el,i)=>{el.classList.add('mobile-soft-reveal');el.style.setProperty('--soft-delay',(i%3)*65+'ms');observer.observe(el)});
 reduced.addEventListener('change',()=>{if(reduced.matches){targets.forEach(el=>el.classList.add('is-soft-visible'));observer.disconnect()}});
})();
