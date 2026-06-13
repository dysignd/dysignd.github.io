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

  payoffLine.style.opacity  = '1';
  payoffLine.style.transform = 'translateY(0)';
  subPayoff.style.opacity   = '1';
  subPayoff.style.transform  = 'translateY(0)';
  heroActions.style.opacity  = '1';
  heroActions.style.transform = 'translateY(0)';

  if (scrollHint) scrollHint.classList.add('is-hidden');
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
