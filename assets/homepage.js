/* Three industries on mobile, six on larger screens; preserve card order on resize. */
(() => {
 const root=document.querySelector('.industry-carousel');
 if(!root)return;
 const track=root.querySelector('.industry-track'), cards=[...root.querySelectorAll('.industry-card')];
 const mobile=matchMedia('(max-width: 760px)');
 let slides=[],pageSize=mobile.matches?3:6;
 const controls=root.querySelector('.industry-controls'),dots=root.querySelector('.industry-dots'),pause=root.querySelector('.industry-pause');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,paused=!pause||reduce.matches,visible=false,timer;
 function buildSlides(){
  const firstCard=current*pageSize;
  pageSize=mobile.matches?3:6;
  slides=[];
  const fragment=document.createDocumentFragment();
  dots.replaceChildren();
  for(let start=0;start<cards.length;start+=pageSize){
   const slide=document.createElement('div'),i=slides.length;
   slide.className='industry-slide';slide.id=`industry-slide-${i}`;
   slide.setAttribute('role','group');
   slide.setAttribute('aria-label',`Industries ${start+1} to ${Math.min(start+pageSize,cards.length)}`);
   cards.slice(start,start+pageSize).forEach(card=>slide.append(card));
   slides.push(slide);fragment.append(slide);
   const dot=document.createElement('button');dot.type='button';
   dot.setAttribute('aria-label',`Show industry group ${i+1} of ${Math.ceil(cards.length/pageSize)}`);
   dot.setAttribute('aria-controls',slide.id);
   dot.addEventListener('click',()=>{show(i);restart()});dots.append(dot);
  }
  track.replaceChildren(fragment);
  show(Math.floor(firstCard/pageSize));
  restart();
 }
 function show(index){
  current=(index+slides.length)%slides.length;
  slides.forEach((slide,i)=>{slide.hidden=i!==current;slide.inert=i!==current;slide.classList.toggle('is-entering',i===current)});
  [...dots.children].forEach((dot,i)=>dot.setAttribute('aria-current',String(i===current)));
 }
 function restart(){clearInterval(timer);if(!paused&&visible&&!document.hidden&&!root.matches(':hover')&&!root.contains(document.activeElement))timer=setInterval(()=>show(current+1),7000)}
 root.classList.add('is-ready');controls.hidden=false;buildSlides();
 mobile.addEventListener('change',buildSlides);
 if(pause){
  pause.textContent=paused?'Play slides':'Pause slides';
  pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Play slides':'Pause slides';restart()});
 }
 root.querySelector('.industry-prev').addEventListener('click',()=>{show(current-1);restart()});
 root.querySelector('.industry-next').addEventListener('click',()=>{show(current+1);restart()});
 root.addEventListener('mouseenter',()=>clearInterval(timer));root.addEventListener('mouseleave',restart);
 root.addEventListener('focusin',()=>clearInterval(timer));root.addEventListener('focusout',()=>setTimeout(restart,0));
 root.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));dots.children[current].focus()}});
 document.addEventListener('visibilitychange',restart);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restart()},{threshold:.25}).observe(root);
 reduce.addEventListener('change',()=>{paused=!pause||reduce.matches;if(pause)pause.textContent=paused?'Play slides':'Pause slides';restart()});
})();
