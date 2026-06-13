// ── Process step: click to expand on touch/tablet ─────────
document.querySelectorAll('.process-step').forEach(step => {
  step.addEventListener('click', () => {
    const isOpen = step.classList.contains('is-open');
    document.querySelectorAll('.process-step').forEach(s => s.classList.remove('is-open'));
    if (!isOpen) step.classList.add('is-open');
  });
});

// ── Word cycling ──────────────────────────────
const words = ['logo', 'video', 'post', 'brochure', 'pamphlet', 'sign'];
let idx = 0;
const cycleEl = document.querySelector('.cycle-word');

function cycleWord() {
  cycleEl.classList.add('fading');
  setTimeout(() => {
    idx = (idx + 1) % words.length;
    cycleEl.textContent = words[idx];
    cycleEl.classList.remove('fading');
  }, 320);
}
setTimeout(() => setInterval(cycleWord, 2200), 1800);

// ── Scroll reveal: payoff line + CTAs ─────────
const heroWrapper  = document.getElementById('hero');
const payoffLine   = document.querySelector('.hero-payoff-line');
const subPayoff    = document.querySelector('.hero-sub-payoff');
const heroActions  = document.querySelector('.hero-actions');
const clientsStrip = document.getElementById('clients');
const scrollHint   = document.querySelector('.hero-scroll-hint');

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

let lastScrollY = window.scrollY;
let mobileRevealed = false;

function revealFull() {
  if (mobileRevealed) return;
  mobileRevealed = true;

  // Set transitions before animating so the reveal is smooth
  payoffLine.style.transition  = 'opacity 0.85s ease, transform 0.85s ease';
  subPayoff.style.transition   = 'opacity 0.85s ease 0.15s, transform 0.85s ease 0.15s';
  heroActions.style.transition = 'opacity 0.85s ease 0.3s, transform 0.85s ease 0.3s';

  payoffLine.style.opacity   = '1';
  payoffLine.style.transform = 'translateY(0)';
  subPayoff.style.opacity    = '1';
  subPayoff.style.transform  = 'translateY(0)';
  heroActions.style.opacity  = '1';
  heroActions.style.transform = 'translateY(0)';

  if (scrollHint) scrollHint.classList.add('is-hidden');

  // Freeze scroll while the animation plays so iOS momentum can't fly past the payoff.
  // iOS-safe technique: fix body at current scroll position, restore after animation completes.
  const y = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top      = `-${y}px`;
  document.body.style.width    = '100%';
  setTimeout(() => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    window.scrollTo(0, y);
  }, 1200);
}

function isMobile() { return window.innerWidth <= 600; }

function onScroll() {
  const scrolled = window.scrollY;

  // On mobile, a tiny scroll triggers full auto-reveal; after that skip the
  // incremental logic so the transition styles set by revealFull() aren't overridden
  if (isMobile()) {
    if (!mobileRevealed && scrolled > 20) revealFull();
    lastScrollY = scrolled;
    return;
  }

  const heroTop    = heroWrapper.offsetTop;
  const scrollRoom = heroWrapper.offsetHeight - window.innerHeight;
  const raw        = Math.min(1, Math.max(0, (scrolled - heroTop) / scrollRoom));

  const payoffT  = easeOut(Math.min(1, Math.max(0, (raw - 0.30) / 0.35)));
  payoffLine.style.opacity   = payoffT;
  payoffLine.style.transform = `translateY(${(1 - payoffT) * 22}px)`;

  const subT = easeOut(Math.min(1, Math.max(0, (raw - 0.45) / 0.25)));
  subPayoff.style.opacity   = subT;
  subPayoff.style.transform = `translateY(${(1 - subT) * 16}px)`;

  const actionsT = easeOut(Math.min(1, Math.max(0, (raw - 0.55) / 0.30)));
  heroActions.style.opacity   = actionsT;
  heroActions.style.transform = `translateY(${(1 - actionsT) * 12}px)`;

  // Clients strip: show on scroll up (past hero), hide on scroll down
  const pastHero = scrolled > heroWrapper.offsetTop + heroWrapper.offsetHeight;
  if (pastHero && scrolled < lastScrollY) {
    clientsStrip.classList.add('is-visible');
  } else {
    clientsStrip.classList.remove('is-visible');
  }
  lastScrollY = scrolled;
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Ticker: rAF loop (no jump) + scrub ─────────
(function () {
  const wrapper = document.querySelector('.ticker-wrapper');
  const track   = document.querySelector('.ticker-track');
  if (!track || !wrapper) return;

  const SPEED = 0.38; // px per frame — matches original CSS 35s pace
  let pos      = 0;
  let dragging = false;
  let lastX    = 0;

  // Measure the first span directly — avoids divide-by-2 rounding and
  // survives font-load reflows; guard against zero before fonts settle.
  function half() {
    const w = track.children[0].offsetWidth;
    return w > 0 ? w : track.scrollWidth / 2;
  }

  function norm(p) {
    const h = half();
    if (!h) return p;        // not yet laid out — hold position
    p = p % h;
    if (p > 0) p -= h;
    return p;
  }

  function tick() {
    if (!dragging) pos = norm(pos - SPEED);
    track.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(tick);
  }

  function scrubMove(x) {
    if (!dragging) return;
    pos = norm(pos + (x - lastX));
    lastX = x;
    track.style.transform = `translateX(${pos}px)`;
  }

  // Mouse scrub
  wrapper.addEventListener('mousedown', e => { dragging = true; lastX = e.clientX; });
  window.addEventListener('mousemove',  e => scrubMove(e.clientX));
  window.addEventListener('mouseup',   () => { dragging = false; });

  // Trackpad horizontal swipe (wheel deltaX)
  wrapper.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      pos = norm(pos - e.deltaX);
      track.style.transform = `translateX(${pos}px)`;
    }
  }, { passive: false });

  // Touch: only hijack horizontal gestures — vertical still scrolls the page
  let tx0 = 0, ty0 = 0, dir = null;
  wrapper.addEventListener('touchstart', e => {
    tx0 = e.touches[0].clientX;
    ty0 = e.touches[0].clientY;
    lastX = tx0;
    dir = null;
  }, { passive: true });
  wrapper.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - tx0);
    const dy = Math.abs(e.touches[0].clientY - ty0);
    if (!dir && (dx > 5 || dy > 5)) {
      dir = dx > dy ? 'h' : 'v';
      if (dir === 'h') dragging = true;
    }
    if (dir === 'h') {
      e.preventDefault();
      scrubMove(e.touches[0].clientX);
    }
  }, { passive: false });
  wrapper.addEventListener('touchend', () => { dragging = false; dir = null; });

  // Wait for fonts before starting so offsetWidth is accurate
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    requestAnimationFrame(tick);
  });
})();
