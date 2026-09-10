gsap.registerPlugin(ScrollTrigger);

/* ---- loader + hero reveal (only runs if hero exists) ---- */
window.addEventListener('load', () => {
  const tl = gsap.timeline();
  tl.to('#loader span', {opacity:0, duration:.4, delay:.2})
    .to('#loader', {opacity:0, duration:.5, pointerEvents:'none'}, '-=.2');

  if(document.querySelector('.hero h1 .line span')){
    tl.to('.hero h1 .line span', {y:'0%', duration:1, stagger:0.12, ease:'power4.out'}, '-=.3')
      .to('.hero-sub', {opacity:1, duration:.8, ease:'power2.out'}, '-=.5')
      .to('.hero-cta', {opacity:1, duration:.8, ease:'power2.out'}, '-=.6')
      .call(startHeroRotation);
  } else if(document.querySelector('.detail-hero')){
    tl.from('.detail-title', {opacity:0, y:24, duration:.9, ease:'power2.out'}, '-=.2')
      .from('.detail-tagline', {opacity:0, y:16, duration:.8, ease:'power2.out'}, '-=.6')
      .from('.detail-meta', {opacity:0, y:16, duration:.8, ease:'power2.out'}, '-=.6');
  }
});

/* ---- hero background gallery: auto-crossfades on a timer, not tied to scroll ----
   the headline text (role title) and primary CTA crossfade/update in sync with
   each image change. Rotation only starts once the intro reveal has finished, and
   is force-reset to slide 0 / role 0 (Software Engineer) at that moment — so what
   the visitor sees first is always "Software Engineer", never whichever role the
   timeline happened to land on while images were still loading. ---- */
function startHeroRotation(){
  const heroSlides = Array.from(document.querySelectorAll('.hero-bg-slide'));
  const heroRoles = [
    { lines: ['SOFTWARE', 'ENGINEER.'], href: '#work', cta: 'View my work' },
    { lines: ['VIDEO', 'EDITOR.'], href: '#video', cta: 'View my edits' },
    { lines: ['SYSTEMS', 'ADMIN.'], href: '#systems', cta: 'View systems work' },
    { lines: ['IT', 'SUPPORT.'], href: '#systems', cta: 'View systems work' }
  ];
  const heroTitleLines = document.querySelectorAll('.hero h1 .line span');
  const heroCta = document.getElementById('heroCta');
  if(heroSlides.length < 2) return;

  const HOLD = 5;   // seconds each slide/role stays fully visible before swapping
  const FADE = 1.2; // seconds the crossfade itself takes
  const heroFadeEls = heroCta ? [...heroTitleLines, heroCta] : [...heroTitleLines];
  let current = 0;

  function setRole(role){
    if(heroTitleLines.length !== 2) return;
    heroTitleLines[0].textContent = role.lines[0];
    heroTitleLines[1].textContent = role.lines[1];
    if(heroCta){ heroCta.textContent = role.cta; heroCta.setAttribute('href', role.href); }
  }

  /* clean starting state: slide 0 visible, everything else hidden, role 0 text
     already in place — untouched, so it doesn't flash, and it gets the same
     fixed HOLD before its first transition as every slide after it. */
  heroSlides.forEach((s, i) => gsap.set(s, {opacity: i === 0 ? 1 : 0, scale: 1}));
  gsap.set(heroFadeEls, {opacity:1, y:0});
  setRole(heroRoles[0]);

  function advance(){
    const next = (current + 1) % heroSlides.length;
    const nextRole = heroRoles[next % heroRoles.length];

    gsap.to(heroSlides[current], {opacity:0, duration:FADE, ease:'power1.inOut'});
    gsap.to(heroSlides[next], {opacity:1, duration:FADE, ease:'power1.inOut'});
    gsap.fromTo(heroSlides[next], {scale:1.03}, {scale:1, duration:HOLD+FADE, ease:'none'});

    if(heroTitleLines.length === 2 && nextRole){
      gsap.to(heroFadeEls, {opacity:0, y:-14, duration:.45, ease:'power2.in', onComplete: () => {
        setRole(nextRole);
        gsap.fromTo(heroFadeEls, {opacity:0, y:14}, {opacity:1, y:0, duration:.6, ease:'power2.out'});
      }});
    }

    current = next;
  }

  setInterval(advance, HOLD * 1000);
}
const canvas = document.getElementById('hero-grid');
if(canvas){
  const ctx = canvas.getContext('2d');
  let mx = -999, my = -999;
  function resize(){ canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
  });
  function drawGrid(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const gap = 44;
    for(let x=0;x<canvas.width;x+=gap){
      for(let y=0;y<canvas.height;y+=gap){
        const d = Math.hypot(x-mx, y-my);
        const glow = Math.max(0, 1 - d/240);
        ctx.fillStyle = glow > 0 ? `rgba(200,255,77,${0.06+glow*0.5})` : 'rgba(255,255,255,0.035)';
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
    requestAnimationFrame(drawGrid);
  }
  drawGrid();
}

/* ---- stat counters ---- */
document.querySelectorAll('.stat-num').forEach(el => {
  const target = +el.dataset.count;
  ScrollTrigger.create({
    trigger: el, start:'top 85%', once:true,
    onEnter: () => {
      let obj = {v:0};
      gsap.to(obj, {v:target, duration:1.4, ease:'power2.out', onUpdate: () => el.textContent = Math.round(obj.v)});
    }
  });
});

/* ---- generic section reveals ---- */
gsap.utils.toArray('.section-title, .project, .projects-grid-card, .video-card, .principle, .service, .step, .gallery-item, .overview-grid, .diagram').forEach(el => {
  gsap.fromTo(el, {opacity:0, y:24}, {
    opacity:1, y:0, duration:0.9, ease:'power2.out',
    scrollTrigger:{trigger:el, start:'top 90%'}
  });
});

/* ---- rule line draw ---- */
gsap.utils.toArray('.rule').forEach(el=>{
  gsap.fromTo(el,{scaleX:0},{scaleX:1,duration:1,ease:'power2.out', scrollTrigger:{trigger:el,start:'top 90%'}});
});

/* ---- live demo modal ---- */
function openDemo(url, name){
  const modal = document.getElementById('demoModal');
  if(!modal) return;
  const body = document.getElementById('demoModalBody');
  const title = document.getElementById('demoModalTitle');
  const openLink = document.getElementById('demoModalOpen');
  title.textContent = name ? name + ' — Live demo' : 'Live demo';
  if(url){
    body.innerHTML = '<iframe src="' + url + '" loading="lazy" referrerpolicy="no-referrer"></iframe>';
    openLink.href = url;
    openLink.style.display = 'inline-flex';
  } else {
    body.innerHTML = '<div class="demo-unavailable"><div class="tag-soon">Demo coming soon</div>' +
      '<p>An interactive live demo for this project isn\'t public yet.</p>' +
      '<p>Get in touch and I can walk you through it directly.</p></div>';
    openLink.style.display = 'none';
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDemo(){
  const modal = document.getElementById('demoModal');
  if(!modal) return;
  modal.classList.remove('open');
  document.getElementById('demoModalBody').innerHTML = '';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeDemo(); });
const demoModalEl = document.getElementById('demoModal');
if(demoModalEl){
  demoModalEl.addEventListener('click', e => { if(e.target === demoModalEl) closeDemo(); });
}

/* ---- detail-page showcase video: poster shows instantly, video file only
   loads once the visual scrolls near view, so nothing extra is downloaded
   on first paint. Excludes video-card grid items (video-editing.html),
   which use hover-to-preview instead — see below. ---- */
const showcaseVideos = Array.from(document.querySelectorAll('.detail-video[data-src]'))
  .filter(v => !v.closest('.video-card-media'));
if(showcaseVideos.length){
  const loadVideo = video => {
    if(video.dataset.loaded) return;
    video.dataset.loaded = 'true';
    const src = document.createElement('source');
    src.src = video.dataset.src;
    src.type = 'video/mp4';
    video.appendChild(src);
    video.load();
    video.play().catch(() => {});
  };
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          loadVideo(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, {rootMargin:'200px'});
    showcaseVideos.forEach(v => io.observe(v));
  } else {
    showcaseVideos.forEach(loadVideo);
  }
}

/* ---- video card grid: hover to preview (video-editing.html) ----
   the clip only loads on first hover, so nothing extra downloads on page
   load; it plays muted/looped while the cursor is over the card, and
   pauses + resets on mouse-out so the next hover starts from the top.
   Falls back to tap-to-toggle on touch devices, since there's no hover. ---- */
document.querySelectorAll('.video-card').forEach(card => {
  const media = card.querySelector('.video-card-media');
  const video = card.querySelector('.detail-video[data-src]');
  if(!media || !video) return;

  const loadVideo = () => {
    if(video.dataset.loaded) return;
    video.dataset.loaded = 'true';
    const src = document.createElement('source');
    src.src = video.dataset.src;
    src.type = 'video/mp4';
    video.appendChild(src);
    video.load();
  };

  const play = () => {
    loadVideo();
    video.play().then(() => media.classList.add('is-playing')).catch(() => {});
  };
  const stop = () => {
    video.pause();
    video.currentTime = 0;
    media.classList.remove('is-playing');
  };

  card.addEventListener('mouseenter', play);
  card.addEventListener('mouseleave', stop);
  card.addEventListener('focusin', play);
  card.addEventListener('focusout', stop);
  card.addEventListener('touchstart', () => {
    if(media.classList.contains('is-playing')) stop(); else play();
  }, {passive:true});
});

/* ---- timeline accordion ---- */
document.querySelectorAll('.tl-item').forEach(item=>{
  item.addEventListener('click', ()=>{
    document.querySelectorAll('.tl-item').forEach(i=>{if(i!==item)i.classList.remove('open');});
    item.classList.toggle('open');
  });
});
