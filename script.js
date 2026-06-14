// ── Drift-in reveal ───────────────────────────────────────
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // Stagger siblings that share the same parent container
  const seen = new Map();
  els.forEach(el => {
    const key = el.parentElement;
    seen.set(key, (seen.get(key) || 0) + 1);
    el.style.transitionDelay = `${(seen.get(key) - 1) * 80}ms`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();

// ── Process step: click to expand on touch/tablet ─────────
document.querySelectorAll('.process-step').forEach(step => {
  step.addEventListener('click', () => {
    const isOpen = step.classList.contains('is-open');
    document.querySelectorAll('.process-step').forEach(s => s.classList.remove('is-open'));
    if (!isOpen) step.classList.add('is-open');
  });
});

// ── Service cards: scroll-driven 3D flip (touch devices only) ─────────
if (window.matchMedia('(hover: none)').matches) {
  const serviceCards = Array.from(document.querySelectorAll('.service-card'));

  function updateCardFlips() {
    const screenCentre = window.innerHeight / 2;
    const flipRange    = window.innerHeight * 0.32; // scroll distance = full flip

    serviceCards.forEach(card => {
      const inner = card.querySelector('.sc-inner');
      const back  = card.querySelector('.sc-back');
      if (!inner) return;

      const rect       = card.getBoundingClientRect();
      const cardCentre = rect.top + rect.height / 2;
      const dist       = Math.abs(cardCentre - screenCentre);
      const t          = Math.max(0, 1 - dist / flipRange);
      const rotation   = t * 180;

      inner.style.transform = `rotateY(${rotation}deg)`;
      if (back) back.style.pointerEvents = rotation > 90 ? 'auto' : 'none';
    });
  }

  window.addEventListener('scroll', updateCardFlips, { passive: true });
  updateCardFlips();
}

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
const clientsStrip = document.getElementById('clients'); // may be null if removed
const scrollHint   = document.querySelector('.hero-scroll-hint');
const heroIllus    = document.querySelector('.illus-hero');

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

let lastScrollY    = window.scrollY;
let mobileRevealed = false;
let illusRevealed  = false;

function isMobile() { return window.innerWidth <= 600; }

function revealIllus() {
  if (illusRevealed || !heroIllus) return;
  illusRevealed = true;
  heroIllus.classList.add('is-revealed');
}

function revealFull() {
  if (mobileRevealed) return;
  mobileRevealed = true;

  payoffLine.style.transition  = 'opacity 0.85s ease, transform 0.85s ease';
  subPayoff.style.transition   = 'opacity 0.85s ease 0.15s, transform 0.85s ease 0.15s';
  heroActions.style.transition = 'opacity 0.85s ease 0.3s, transform 0.85s ease 0.3s';

  payoffLine.style.opacity    = '1';
  payoffLine.style.transform  = 'translateY(0)';
  subPayoff.style.opacity     = '1';
  subPayoff.style.transform   = 'translateY(0)';
  heroActions.style.opacity   = '1';
  heroActions.style.transform = 'translateY(0)';

  if (scrollHint) scrollHint.classList.add('is-hidden');
  revealIllus();
}

function onScroll() {
  const scrolled   = window.scrollY;
  const heroTop    = heroWrapper.offsetTop;
  const scrollRoom = heroWrapper.offsetHeight - window.innerHeight;
  const raw        = Math.min(1, Math.max(0, (scrolled - heroTop) / scrollRoom));

  if (isMobile()) {
    if (!mobileRevealed && scrolled > 20) revealFull();
    lastScrollY = scrolled;
    return;
  }

  if (raw > 0.28) revealIllus();
  if (scrollHint) scrollHint.classList.add('is-hidden');

  const payoffT  = easeOut(Math.min(1, Math.max(0, (raw - 0.30) / 0.35)));
  payoffLine.style.opacity   = payoffT;
  payoffLine.style.transform = `translateY(${(1 - payoffT) * 22}px)`;

  const subT = easeOut(Math.min(1, Math.max(0, (raw - 0.45) / 0.25)));
  subPayoff.style.opacity   = subT;
  subPayoff.style.transform = `translateY(${(1 - subT) * 16}px)`;

  const actionsT = easeOut(Math.min(1, Math.max(0, (raw - 0.55) / 0.30)));
  heroActions.style.opacity   = actionsT;
  heroActions.style.transform = `translateY(${(1 - actionsT) * 12}px)`;

  if (clientsStrip) {
    const pastHero = scrolled > heroWrapper.offsetTop + heroWrapper.offsetHeight;
    if (pastHero && scrolled < lastScrollY) clientsStrip.classList.add('is-visible');
    else clientsStrip.classList.remove('is-visible');
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

  const SPEED = 0.38;
  let pos      = 0;
  let copyW    = 0;   // width of one copy; measured lazily
  let dragging = false;
  let lastX    = 0;

  function tick() {
    // Measure lazily each frame until layout settles and font loads
    if (!copyW) copyW = track.children[0].offsetWidth;

    if (copyW && !dragging) {
      pos -= SPEED;
      if (pos <= -copyW) pos += copyW; // seamless loop
    }

    track.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(tick);
  }

  function clamp(p) {
    if (!copyW) return p;
    while (p > 0)      p -= copyW;
    while (p < -copyW) p += copyW;
    return p;
  }

  function scrubMove(x) {
    if (!dragging) return;
    pos = clamp(pos + (x - lastX));
    lastX = x;
    track.style.transform = `translateX(${pos}px)`;
  }

  // Mouse scrub
  wrapper.addEventListener('mousedown', e => { dragging = true; lastX = e.clientX; });
  window.addEventListener('mousemove',  e => scrubMove(e.clientX));
  window.addEventListener('mouseup',   () => { dragging = false; });

  // Trackpad horizontal swipe
  wrapper.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      pos = clamp(pos - e.deltaX);
      track.style.transform = `translateX(${pos}px)`;
    }
  }, { passive: false });

  // Touch: horizontal gesture scrubs, vertical scrolls the page
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

  // Start immediately — copyW will be set on the first frame with a non-zero measurement
  requestAnimationFrame(tick);
})();
