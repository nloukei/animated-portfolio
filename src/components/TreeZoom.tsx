import { type ReactNode, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import treeSvg from '../assets/tree.svg?raw';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SCROLL_ZOOM_DISTANCE = 1000;

const MAX_SCALE = 300; // Increased slightly for a deeper "feel"
const ORIGIN_X = '45%';
const ORIGIN_Y = '55%';
const FADE_START_PROGRESS = 0.82; // Start fading near the end of the zoom
const FADE_END_PROGRESS = 1; // Fully faded at max zoom

const WHEEL_TICKS_TO_UNLOCK = 3;
const WHEEL_RESET_DELAY_MS = 700;
const WHEEL_PREVIEW_SCALE = 1.09;
const WHEEL_PREVIEW_DURATION = 0.3;

const GROUND_ORIGIN_X = '50%'; // Horizontal
const GROUND_ORIGIN_Y = '-40%';// Vertical
const GROUND_DROP_Y_PERCENT = 2000; // Positive moves the ground downward while zooming

const FOREST_ORIGIN_X = '50%';
const FOREST_ORIGIN_Y = '60%';
const FOREST_SCALE = 1.8; // Forest zooms only a little
const FOREST_SHIFT_X_PERCENT = -12; // Negative moves forest left

const FOREST2_ORIGIN_X = '50%';
const FOREST2_ORIGIN_Y = '60%';
const FOREST2_SCALE = 1.15; // Slight zoom for back layer
const FOREST2_SHIFT_X_PERCENT = 8; // Positive moves Forest2 right


// // ── Forest (mid-ground — slower zoom + slight left drift for parallax) ───────
// const FOREST_SCALE = 1.8;
// const FOREST_ORIGIN_X = '50%';
// const FOREST_ORIGIN_Y = '60%';
// const FOREST_SHIFT_X = -12;

// // ── Forest2 (background — slowest zoom + slight right drift for parallax) ────
// const FOREST2_SCALE = 1.15;
// const FOREST2_ORIGIN_X = '50%';
// const FOREST2_ORIGIN_Y = '60%';
// const FOREST2_SHIFT_X = 8;

// // ── Fade-out (tree + ground dissolve near end of zoom) ───────────────────────
// const FADE_START_PROGRESS = 0.78;
// const FADE_END_PROGRESS = 0.95;

// // ── Wheel gate (rollback on first taps before committing to zoom) ────────────
// const WHEEL_TICKS_TO_UNLOCK = 3;
// const WHEEL_RESET_DELAY_MS = 700;
// const WHEEL_PREVIEW_SCALE = 1.06;
// const WHEEL_PREVIEW_DURATION = 0.25;


type TreeZoomProps = {
  children?: ReactNode;
};

export default function TreeZoom({ children }: TreeZoomProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const treeLayerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const treeLayer = treeLayerRef.current;
    const treeSvg = treeLayer?.querySelector<SVGSVGElement>('svg');
    if (!section || !treeSvg) return;
    const groundSvgs = Array.from(
      section.querySelectorAll<SVGSVGElement>('[data-ground-svg] svg')
    );
    const forestSvgs = Array.from(
      section.querySelectorAll<SVGSVGElement>('[data-forest-svg] svg')
    );
    const forest2Svgs = Array.from(
      section.querySelectorAll<SVGSVGElement>('[data-forest2-svg] svg')
    );
    const previewTargets = [treeSvg, ...groundSvgs, ...forestSvgs, ...forest2Svgs];
    const fadeTargets = [treeSvg, ...groundSvgs];
    let previewTween: gsap.core.Tween | null = null;

    const ctx = gsap.context(() => {
      // Scale the <svg> itself, not a wrapper. Scaling a div promotes a GPU layer that gets
      // rasterized at ~screen size, so extreme zoom looks blurry; the SVG stays vector this way.
      gsap.set(treeSvg, {
        transformOrigin: `${ORIGIN_X} ${ORIGIN_Y}`,
        force3D: false,
      });

      if (groundSvgs.length > 0) {
        gsap.set(groundSvgs, {
          transformOrigin: `${GROUND_ORIGIN_X} ${GROUND_ORIGIN_Y}`,
          force3D: false,
        });
      }

      if (forestSvgs.length > 0) {
        gsap.set(forestSvgs, {
          transformOrigin: `${FOREST_ORIGIN_X} ${FOREST_ORIGIN_Y}`,
          force3D: false,
        });
      }

      if (forest2Svgs.length > 0) {
        gsap.set(forest2Svgs, {
          transformOrigin: `${FOREST2_ORIGIN_X} ${FOREST2_ORIGIN_Y}`,
          force3D: false,
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${SCROLL_ZOOM_DISTANCE}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        treeSvg,
        { scale: MAX_SCALE, duration: 1, ease: 'none', force3D: false },
        0
      );

      if (groundSvgs.length > 0) {
        tl.to(
          groundSvgs,
          {
            scale: MAX_SCALE,
            yPercent: GROUND_DROP_Y_PERCENT,
            duration: 1,
            ease: 'none',
            force3D: false,
          },
          0
        );
      }

      if (forestSvgs.length > 0) {
        tl.to(
          forestSvgs,
          {
            scale: FOREST_SCALE,
            xPercent: FOREST_SHIFT_X_PERCENT,
            duration: 1,
            ease: 'none',
            force3D: false,
          },
          0
        );
      }

      if (forest2Svgs.length > 0) {
        tl.to(
          forest2Svgs,
          {
            scale: FOREST2_SCALE,
            xPercent: FOREST2_SHIFT_X_PERCENT,
            duration: 1,
            ease: 'none',
            force3D: false,
          },
          0
        );
      }

      // Fade out only tree + ground as zoom reaches the end, and fade back in on reverse scroll.
      tl.to(
        fadeTargets,
        {
          opacity: 0,
          duration: FADE_END_PROGRESS - FADE_START_PROGRESS,
          ease: 'none',
        },
        FADE_START_PROGRESS
      );
    }, section);

    // Astro-specific: Wait for fonts/layout to settle then refresh
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);

    // Wheel gate: first 1-2 bumps rollback to section start, 3rd bump unlocks zoom scroll.
    let wheelTickCount = 0;
    let unlocked = false;
    let resetTimer: number | undefined;

    const resetWheelGate = () => {
      wheelTickCount = 0;
      unlocked = false;
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = undefined;
    };

    const onWheel = (event: WheelEvent) => {
      if (!sectionRef.current) return;

      const sectionTop = sectionRef.current.offsetTop;
      const sectionBottom = sectionTop + sectionRef.current.offsetHeight;
      const inSectionRange = window.scrollY >= sectionTop && window.scrollY < sectionBottom;
      const nearSectionStart = Math.abs(window.scrollY - sectionTop) < 40;
      const scrollingDown = event.deltaY > 0;

      // Reset lock when user is above this section again.
      if (!inSectionRange && window.scrollY < sectionTop - 40) {
        resetWheelGate();
      }

      if (!inSectionRange || !nearSectionStart || !scrollingDown || unlocked) {
        return;
      }

      wheelTickCount += 1;
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        resetWheelGate();
      }, WHEEL_RESET_DELAY_MS);

      if (wheelTickCount < WHEEL_TICKS_TO_UNLOCK) {
        event.preventDefault();
        if (wheelTickCount === 1) {
          previewTween?.kill();
          previewTween = gsap.fromTo(
            previewTargets,
            { scale: 1 },
            {
              scale: WHEEL_PREVIEW_SCALE,
              duration: WHEEL_PREVIEW_DURATION,
              yoyo: true,
              repeat: 1,
              ease: 'power1.out',
              force3D: false,
              overwrite: false,
            }
          );
        }
        window.scrollTo({ top: sectionTop, behavior: 'auto' });
        return;
      }

      previewTween?.kill();
      previewTween = null;
      gsap.set(previewTargets, { clearProps: 'scale' });
      ScrollTrigger.refresh();
      unlocked = true;
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('load', refresh);
      window.removeEventListener('wheel', onWheel);
      if (resetTimer) window.clearTimeout(resetTimer);
      previewTween?.kill();
      ctx.revert(); // This kills the ScrollTrigger and the animation
    };
  }, []);

  return (
    // Used h-[100svh] to prevent mobile jumping
    <section ref={sectionRef} className="relative h-[100svh] w-full bg-white">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          ref={treeLayerRef}
          //Size of the tree svg
          className="relative z-10 [&>svg]:block [&>svg]:h-[50vh] [&>svg]:w-auto [&>svg]:text-black [&>svg]:[transform-box:fill-box]"
          dangerouslySetInnerHTML={{ __html: treeSvg }}
          aria-hidden
        />
        {children}
      </div>
      
      {/* Pro Tip: Add an empty div at the bottom of the section 
         to act as the "Trigger" for your content fade-in 
      */}
    </section>
  );
}