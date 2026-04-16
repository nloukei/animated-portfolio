import { gsap } from 'gsap';
import {
  TREE_HANDOFF_DELAY,
  TREE_HANDOFF_DURATION,
} from '../components/treeZoomSettings';

const MIN_LOAD_MS = 2000;

let loaded = false;
let scene = false;
let minElapsed = false;
let growComplete = false;
let heroRect: { top: number; left: number; width: number; height: number } | null = null;

// ── Tree grow animation ───────────────────────────────────────────────────────
// Phase 1 (inset 100%→72%): trunk base
// Phase 2 (72%→30%):        main branches
// Phase 3 (30%→0%):         tips + twigs
const loadingTreeSvg = document.querySelector<SVGSVGElement>('#app-loading-tree svg');
if (loadingTreeSvg) {
  gsap.set(loadingTreeSvg, { clipPath: 'inset(100% 0% 0% 0%)', transformOrigin: 'bottom center' });

  gsap.timeline({
    delay: 0.15,
    onComplete: () => { growComplete = true; tryFlip(); },
  })
    .to(loadingTreeSvg, { clipPath: 'inset(72% 0% 0% 0%)', duration: 0.35, ease: 'power2.out' })
    .to(loadingTreeSvg, { clipPath: 'inset(30% 0% 0% 0%)', duration: 0.55, ease: 'power2.out' })
    .to(loadingTreeSvg, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.60, ease: 'back.out(1.4)' });
} else {
  growComplete = true;
}

// ── FLIP: animate loading tree → hero tree position ───────────────────────────
// All five gates must be true before the FLIP starts.
function tryFlip() {
  if (!loaded || !scene || !minElapsed || !growComplete || !heroRect) return;
  doFlip();
}

function doFlip() {
  // Signal TreeZoom to begin the ground / forest slide-in animations.
  window.dispatchEvent(new CustomEvent('app:flip-start'));

  const overlay = document.getElementById('app-loading');
  if (!loadingTreeSvg || !overlay || overlay.dataset.done === '1') {
    overlay?.remove();
    document.body.classList.remove('app-loading-active');
    window.dispatchEvent(new CustomEvent('app:intro-complete'));
    return;
  }
  overlay.dataset.done = '1';

  const loadingRect = loadingTreeSvg.getBoundingClientRect();
  const hr = heroRect!;

  // Clone the loading SVG and fix it at its current viewport position.
  // The original is hidden; the clone does the flying.
  const flying = loadingTreeSvg.cloneNode(true) as SVGSVGElement;
  Object.assign(flying.style, {
    position: 'fixed',
    top: `${loadingRect.top}px`,
    left: `${loadingRect.left}px`,
    width: `${loadingRect.width}px`,
    height: `${loadingRect.height}px`,
    maxHeight: 'none',
    margin: '0',
    zIndex: '100000',
    pointerEvents: 'none',
    display: 'block',
  });
  document.body.appendChild(flying);
  loadingTreeSvg.style.opacity = '0';

  // Fade the overlay background while the clone is in flight.
  gsap.to(overlay, {
    opacity: 0,
    duration: 0.35,
    ease: 'power2.in',
    onComplete: () => {
      overlay.remove();
      document.body.classList.remove('app-loading-active');
    },
  });

  // FLIP: translate + scale clone from loading position to hero position.
  const dx = hr.left - loadingRect.left;
  const dy = hr.top  - loadingRect.top;
  const sx = hr.width  / loadingRect.width;
  const sy = hr.height / loadingRect.height;

  gsap.to(flying, {
    x: dx,
    y: dy,
    scaleX: sx,
    scaleY: sy,
    transformOrigin: '0 0',
    delay: TREE_HANDOFF_DELAY,
    duration: TREE_HANDOFF_DURATION,
    ease: 'power3.inOut',
    onComplete: () => {
      flying.remove();
      // Hero tree is now at this exact position. Tell TreeZoom to reveal the
      // scene and initialise ScrollTrigger.
      window.dispatchEvent(new CustomEvent('app:intro-complete'));
    },
  });
}

// ── Gate listeners ────────────────────────────────────────────────────────────
setTimeout(() => { minElapsed = true; tryFlip(); }, MIN_LOAD_MS);

window.addEventListener('load', () => { loaded = true; tryFlip(); }, { once: true });
if (document.readyState === 'complete') { loaded = true; }

window.addEventListener('app:scene-ready', (e) => {
  const d = (e as CustomEvent<typeof heroRect>).detail;
  if (d?.width) heroRect = d;
  scene = true;
  tryFlip();
}, { once: true });

// Safety net — never stick forever.
setTimeout(() => {
  loaded = true; scene = true; minElapsed = true; growComplete = true;
  if (!heroRect) heroRect = { top: 0, left: 0, width: 100, height: 100 };
  tryFlip();
}, 12000);
