/* PS Boost — smoothness layer. Additive, no dependencies. 2026-11-01. */
(function(){
  "use strict";
  // Reveal-on-scroll for .ps-reveal elements
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add("is-visible");io.unobserve(e.target);}
      });
    },{rootMargin:"0px 0px -40px 0px",threshold:0.08});
    document.querySelectorAll(".ps-reveal").forEach(function(el){io.observe(el);});
  }else{
    document.querySelectorAll(".ps-reveal").forEach(function(el){el.classList.add("is-visible");});
  }
  // Smooth in-page anchor scroll (respects reduced motion via CSS media query)
  document.addEventListener("click",function(ev){
    var a=ev.target.closest&&ev.target.closest("a[href^='#']");
    if(!a||a.classList.contains("skip-link"))return;
    var id=a.getAttribute("href");
    if(id.length<2)return;
    var el=document.querySelector(id);
    if(!el)return;
    ev.preventDefault();
    var calm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({behavior:calm?"auto":"smooth",block:"start"});
    history.replaceState(null,"",id);
  });
})();
