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
const heroActions  = document.querySelector('.hero-actions');

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function onScroll() {
  const scrolled    = window.scrollY;
  const heroTop     = heroWrapper.offsetTop;
  const scrollRoom  = heroWrapper.offsetHeight - window.innerHeight;
  const raw         = Math.min(1, Math.max(0, (scrolled - heroTop) / scrollRoom));

  // Payoff line: starts appearing at 30% scroll, fully in at 65%
  const payoffT  = easeOut(Math.min(1, Math.max(0, (raw - 0.30) / 0.35)));
  payoffLine.style.opacity   = payoffT;
  payoffLine.style.transform = `translateY(${(1 - payoffT) * 22}px)`;

  // CTAs: follow slightly behind, 50% to 80%
  const actionsT = easeOut(Math.min(1, Math.max(0, (raw - 0.50) / 0.30)));
  heroActions.style.opacity   = actionsT;
  heroActions.style.transform = `translateY(${(1 - actionsT) * 12}px)`;
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load in case page is already scrolled
