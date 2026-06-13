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

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

let lastScrollY = window.scrollY;

function onScroll() {
  const scrolled    = window.scrollY;
  const heroTop     = heroWrapper.offsetTop;
  const scrollRoom  = heroWrapper.offsetHeight - window.innerHeight;
  const raw         = Math.min(1, Math.max(0, (scrolled - heroTop) / scrollRoom));

  // Payoff line: starts appearing at 30% scroll, fully in at 65%
  const payoffT  = easeOut(Math.min(1, Math.max(0, (raw - 0.30) / 0.35)));
  payoffLine.style.opacity   = payoffT;
  payoffLine.style.transform = `translateY(${(1 - payoffT) * 22}px)`;

  // Sub-payoff: follows payoff, 45% to 70%
  const subT = easeOut(Math.min(1, Math.max(0, (raw - 0.45) / 0.25)));
  subPayoff.style.opacity   = subT;
  subPayoff.style.transform = `translateY(${(1 - subT) * 16}px)`;

  // CTAs: follow slightly behind, 55% to 85%
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

// Hide scroll hint once user starts scrolling
const scrollHint = document.querySelector('.hero-scroll-hint');
if (scrollHint) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) scrollHint.classList.add('is-hidden');
  }, { passive: true, once: false });
}
