import { type ReactNode, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import treeSvg from '../assets/tree.svg?raw';
import {
  ABOUT_ACTIVE_PROGRESS,
  FADE_END_PROGRESS,
  FADE_START_PROGRESS,
  FOREST2_ORIGIN_X,
  FOREST2_ORIGIN_Y,
  FOREST2_SCALE,
  FOREST2_SHIFT_X_PERCENT,
  FOREST_ORIGIN_X,
  FOREST_ORIGIN_Y,
  FOREST_SCALE,
  FOREST_SHIFT_X_PERCENT,
  GROUND_DROP_Y_PERCENT,
  GROUND_ORIGIN_X,
  GROUND_ORIGIN_Y,
  HEADING_FADE_END_PROGRESS,
  HEADING_FADE_START_PROGRESS,
  MAX_SCALE,
  ORIGIN_X,
  ORIGIN_Y,
  SCROLL_ZOOM_DISTANCE,
  SIGN_DROP_Y_PERCENT,
  SIGN_ORIGIN_X,
  SIGN_ORIGIN_Y,
  SIGN_SCALE,
  BIG_SIGN_DROP_Y_PERCENT,
  BIG_SIGN_ORIGIN_X,
  BIG_SIGN_ORIGIN_Y,
  BIG_SIGN_SCALE,
  BIG_SIGN_SHIFT_X_PERCENT,
  BILLBOARD_END_Y_PERCENT,
  BILLBOARD_ORIGIN_X,
  BILLBOARD_ORIGIN_Y,
  BILLBOARD_RISE_END_PROGRESS,
  BILLBOARD_START_Y_PERCENT,
  FOREST2_INTRO_DELAY,
  FOREST2_INTRO_DURATION,
  FOREST_INTRO_DELAY,
  FOREST_INTRO_DURATION,
  GROUND_INTRO_DELAY,
  GROUND_INTRO_DURATION,
  TREE_HANDOFF_DELAY,
  TREE_HANDOFF_DURATION,
  WHEEL_PREVIEW_DURATION,
  WHEEL_PREVIEW_SCALE,
  WHEEL_RESET_DELAY_MS,
  WHEEL_TICKS_TO_UNLOCK,
} from './treeZoomSettings';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type TreeZoomProps = {
  children?: ReactNode;
};

export default function TreeZoom({ children }: TreeZoomProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const treeLayerRef = useRef<HTMLDivElement>(null);

  // ── Effect 1: Signal scene-ready with hero tree bounding rect for FLIP ──────
  useLayoutEffect(() => {
    let raf = 0;
    const tryReady = () => {
      const svg = treeLayerRef.current?.querySelector<SVGSVGElement>('svg');
      if (svg) {
        const r = svg.getBoundingClientRect();
        window.dispatchEvent(
          new CustomEvent('app:scene-ready', {
            detail: { top: r.top, left: r.left, width: r.width, height: r.height },
          })
        );
        return;
      }
      raf = requestAnimationFrame(tryReady);
    };
    tryReady();
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Effect 2: Scene animation — deferred until intro FLIP is complete ────────
  useLayoutEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const section = sectionRef.current;
    const treeLayer = treeLayerRef.current;
    const treeSvg = treeLayer?.querySelector<SVGSVGElement>('svg');
    if (!section || !treeSvg) return;

    // ── Gather elements ────────────────────────────────────────────────────────
    const groundSvgs = Array.from(
      section.querySelectorAll<SVGSVGElement>('[data-ground-svg] svg')
    );
    const forestSvgs = Array.from(
      section.querySelectorAll<SVGSVGElement>('[data-forest-svg] svg')
    );
    const forestPaths = forestSvgs.flatMap((svg) =>
      Array.from(svg.querySelectorAll<SVGPathElement>('path'))
    );
    const forest2Svgs = Array.from(
      section.querySelectorAll<SVGSVGElement>('[data-forest2-svg] svg')
    );
    const forest2Paths = forest2Svgs.flatMap((svg) =>
      Array.from(svg.querySelectorAll<SVGPathElement>('path'))
    );
    const signSvgs = Array.from(
      section.querySelectorAll<SVGSVGElement>('[data-sign-svg] svg')
    );
    const bigSignSvgs = Array.from(
      section.querySelectorAll<SVGSVGElement>('[data-bigsign-svg] svg')
    );
    const billboardLayers = Array.from(
      section.querySelectorAll<HTMLDivElement>('[data-billboard-svg]')
    );
    const billboardTextLines = Array.from(
      section.querySelectorAll<HTMLElement>('[data-billboard-line]')
    );
    const heroHeading = section.querySelector<HTMLElement>('[data-hero-heading]');

    const sortedBillboardLines = billboardTextLines
      .slice()
      .sort(
        (a, b) =>
          Number(a.dataset.billboardLine ?? '0') - Number(b.dataset.billboardLine ?? '0')
      );

    // ── Hide everything while FLIP plays ──────────────────────────────────────
    gsap.set(
      [treeSvg, ...groundSvgs, ...forestSvgs, ...forest2Svgs,
        ...signSvgs, ...bigSignSvgs, ...billboardLayers],
      { opacity: 0 }
    );
    if (heroHeading) gsap.set(heroHeading, { opacity: 0 });

    // ── Background intro animations — fire on 'app:flip-start' ─────────────────
    // Elements slide in from their respective off-screen edges while the FLIP
    // clone is still in flight. clearProps removes the temporary pixel offset so
    // the scroll-animation transforms compose cleanly afterwards.
    const onFlipStart = () => {
      // Ground: up from below the viewport
      if (groundSvgs.length > 0) {
        gsap.set(groundSvgs, { opacity: 1, y: window.innerHeight });
        gsap.to(groundSvgs, {
          y: 0,
          delay: GROUND_INTRO_DELAY,
          duration: GROUND_INTRO_DURATION,
          ease: 'power3.out',
          onComplete: () => gsap.set(groundSvgs, { clearProps: 'y' }),
        });
      }

      // Forest: in from the left edge — use xPercent so it shares the same
      // GSAP property as the scroll animation (avoids a snap when clearProps fires).
      if (forestSvgs.length > 0) {
        gsap.set(forestSvgs, { opacity: 1, xPercent: -110 });
        gsap.to(forestSvgs, {
          xPercent: 0,
          delay: FOREST_INTRO_DELAY,
          duration: FOREST_INTRO_DURATION,
          ease: 'power3.out',
        });
      }

      // Forest2: in from the right edge — same reasoning.
      if (forest2Svgs.length > 0) {
        gsap.set(forest2Svgs, { opacity: 1, xPercent: 110 });
        gsap.to(forest2Svgs, {
          xPercent: 0,
          delay: FOREST2_INTRO_DELAY,
          duration: FOREST2_INTRO_DURATION,
          ease: 'power3.out',
        });
      }

      // Billboard is intentionally excluded from the intro sequence.
      // It stays hidden (opacity: 0) and is revealed by the scroll animation
      // only after the user reaches the About section.
    };

    // ── Animation-state variables (hoisted so cleanup can reference them) ──────
    const previewTargets = [
      treeSvg, ...groundSvgs, ...forestSvgs, ...forest2Svgs,
      ...signSvgs, ...bigSignSvgs,
    ];
    const fadeTargets = [treeSvg, ...groundSvgs];
    let previewTween: gsap.core.Tween | null = null;
    let zoomTimeline: gsap.core.Timeline | null = null;
    let wheelTickCount = 3;
    let billboardWheelTickCount = 0;
    let billboardLineIndex = 0;
    let unlocked = false;
    let resetTimer: number | undefined;
    let mainCtx: gsap.Context | null = null;

    // ── Billboard helpers ──────────────────────────────────────────────────────
    const setBillboardLine = (index: number, animate: boolean) => {
      if (sortedBillboardLines.length === 0) return;
      const clamped = Math.max(0, Math.min(index, sortedBillboardLines.length - 1));
      const previousIndex = billboardLineIndex;
      const previousLine = sortedBillboardLines[previousIndex];
      const nextLine = sortedBillboardLines[clamped];
      billboardLineIndex = clamped;

      if (!animate || previousIndex === clamped) {
        sortedBillboardLines.forEach((line, i) => {
          gsap.set(line, { opacity: i === clamped ? 1 : 0, yPercent: i === clamped ? 0 : 100 });
        });
        return;
      }

      const movingForward = clamped > previousIndex;
      sortedBillboardLines.forEach((line, i) => {
        if (i !== previousIndex && i !== clamped)
          gsap.set(line, { opacity: 0, yPercent: 100 });
      });

      gsap.killTweensOf([previousLine, nextLine]);
      gsap.to(previousLine, {
        yPercent: movingForward ? -100 : 100,
        opacity: 0, duration: 0.35, ease: 'power1.out', overwrite: true,
      });
      gsap.fromTo(
        nextLine,
        { yPercent: movingForward ? 100 : -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power1.out', overwrite: true }
      );
    };

    // ── Wheel / nav handlers ───────────────────────────────────────────────────
    const refresh = () => ScrollTrigger.refresh();

    const resetWheelGate = () => {
      wheelTickCount = 0;
      billboardWheelTickCount = 0;
      setBillboardLine(0, true);
      unlocked = false;
      window.dispatchEvent(
        new CustomEvent('treezoom:about-active', { detail: { active: false } })
      );
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
      const scrollProgress = zoomTimeline?.scrollTrigger?.progress ?? 0;
      const billboardCanAdvance = scrollProgress >= BILLBOARD_RISE_END_PROGRESS;

      if (!inSectionRange && window.scrollY < sectionTop - 40) resetWheelGate();

      if (
        scrollingDown && unlocked && billboardCanAdvance &&
        sortedBillboardLines.length > 0 &&
        billboardLineIndex < sortedBillboardLines.length - 1
      ) {
        event.preventDefault();
        billboardWheelTickCount += 1;
        if (billboardWheelTickCount >= 5) {
          billboardWheelTickCount = 0;
          setBillboardLine(billboardLineIndex + 1, true);
        }
        return;
      }

      if (!inSectionRange || !nearSectionStart || !scrollingDown || unlocked) return;

      wheelTickCount += 1;
      billboardWheelTickCount = 0;
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(resetWheelGate, WHEEL_RESET_DELAY_MS);

      if (wheelTickCount < WHEEL_TICKS_TO_UNLOCK) {
        event.preventDefault();
        if (wheelTickCount === 1) {
          previewTween?.kill();
          previewTween = gsap.fromTo(
            previewTargets, { scale: 1 },
            {
              scale: WHEEL_PREVIEW_SCALE, duration: WHEEL_PREVIEW_DURATION,
              yoyo: true, repeat: 1, ease: 'power1.out', force3D: false, overwrite: false,
            }
          );
        }
        window.scrollTo({ top: sectionTop, behavior: 'auto' });
        return;
      }

      previewTween?.kill();
      previewTween = null;
      gsap.set(previewTargets, { clearProps: 'scale' });
      if (resetTimer) { window.clearTimeout(resetTimer); resetTimer = undefined; }
      ScrollTrigger.refresh();
      unlocked = true;
    };

    const onGoAbout = () => {
      const s = sectionRef.current;
      if (!s) return;
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = undefined;
      wheelTickCount = WHEEL_TICKS_TO_UNLOCK;
      unlocked = true;
      previewTween?.kill();
      previewTween = null;
      gsap.set(previewTargets, { clearProps: 'scale' });
      ScrollTrigger.refresh();
      window.scrollTo({ top: s.offsetTop + SCROLL_ZOOM_DISTANCE * ABOUT_ACTIVE_PROGRESS, behavior: 'smooth' });
    };

    const onGoHome = () => {
      const s = sectionRef.current;
      if (!s) return;
      previewTween?.kill();
      previewTween = null;
      gsap.set(previewTargets, { clearProps: 'scale' });
      resetWheelGate();
      ScrollTrigger.refresh();
      window.scrollTo({ top: s.offsetTop, behavior: 'smooth' });
    };

    // ── revealScene: called after FLIP completes ───────────────────────────────
    // Hero tree is now at the exact position the FLIP clone just vacated.
    // Reveal it instantly, then stagger the background layers in.
    const revealScene = () => {
      gsap.set(treeSvg, { opacity: 1 });
      if (heroHeading) gsap.set(heroHeading, { opacity: 1 });

      // Ground, Forest, Forest2 handled by onFlipStart slide-in animations.
      // Signs fade in after the tree lands.
      if (signSvgs.length > 0)
        gsap.to(signSvgs, { opacity: 1, duration: 0.45, delay: 0.15, ease: 'power2.out' });
      if (bigSignSvgs.length > 0)
        gsap.to(bigSignSvgs, { opacity: 1, duration: 0.45, delay: 0.15, ease: 'power2.out' });
      // Billboard: push it off-screen immediately so it never flashes at its
      // natural CSS position before the delayedCall sets up the scroll timeline.
      if (billboardLayers.length > 0)
        gsap.set(billboardLayers, { opacity: 1, yPercent: BILLBOARD_START_Y_PERCENT });

      // ScrollTrigger only created on desktop and only AFTER the intro is done
      if (!isDesktop) return;

      // Delay scroll setup until the last forest intro finishes so that the
      // transformOrigin gsap.set calls and the initial ScrollTrigger refresh
      // don't interrupt the sliding-in animations and cause a stutter.
      const maxForestEnd = Math.max(
        FOREST_INTRO_DELAY + FOREST_INTRO_DURATION,
        FOREST2_INTRO_DELAY + FOREST2_INTRO_DURATION,
      );
      const handoffDone = TREE_HANDOFF_DELAY + TREE_HANDOFF_DURATION;
      const scrollInitDelay = Math.max(0, maxForestEnd - handoffDone);

      gsap.delayedCall(scrollInitDelay, () => {
      mainCtx = gsap.context(() => {
        gsap.set(treeSvg, { transformOrigin: `${ORIGIN_X} ${ORIGIN_Y}`, force3D: false });

        if (groundSvgs.length > 0)
          gsap.set(groundSvgs, { transformOrigin: `${GROUND_ORIGIN_X} ${GROUND_ORIGIN_Y}`, force3D: false });
        if (signSvgs.length > 0)
          gsap.set(signSvgs, { transformOrigin: `${SIGN_ORIGIN_X} ${SIGN_ORIGIN_Y}`, force3D: false });
        if (bigSignSvgs.length > 0)
          gsap.set(bigSignSvgs, { transformOrigin: `${BIG_SIGN_ORIGIN_X} ${BIG_SIGN_ORIGIN_Y}`, force3D: false });
        if (forestSvgs.length > 0)
          gsap.set(forestSvgs, { transformOrigin: `${FOREST_ORIGIN_X} ${FOREST_ORIGIN_Y}`, force3D: false });
        if (forest2Svgs.length > 0)
          gsap.set(forest2Svgs, { transformOrigin: `${FOREST2_ORIGIN_X} ${FOREST2_ORIGIN_Y}`, force3D: false });
        if (billboardLayers.length > 0)
          gsap.set(billboardLayers, {
            transformOrigin: `${BILLBOARD_ORIGIN_X} ${BILLBOARD_ORIGIN_Y}`,
            yPercent: BILLBOARD_START_Y_PERCENT, // 110% — fully below the viewport
            force3D: false,
          });
        if (billboardTextLines.length > 0) {
          gsap.set(billboardTextLines, { opacity: 0 });
          setBillboardLine(0, false);
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${SCROLL_ZOOM_DISTANCE}`,
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const reachedAbout = unlocked && self.progress >= ABOUT_ACTIVE_PROGRESS;
              window.dispatchEvent(
                new CustomEvent('treezoom:about-active', { detail: { active: reachedAbout } })
              );
            },
          },
        });
        zoomTimeline = tl;

        tl.to(treeSvg, { scale: MAX_SCALE, duration: 1, ease: 'none', force3D: false }, 0);

        if (groundSvgs.length > 0)
          tl.to(groundSvgs, { scale: MAX_SCALE, yPercent: GROUND_DROP_Y_PERCENT, duration: 1, ease: 'none', force3D: false }, 0);
        if (signSvgs.length > 0)
          tl.to(signSvgs, { scale: SIGN_SCALE, yPercent: SIGN_DROP_Y_PERCENT, duration: 1, ease: 'none', force3D: false }, 0);
        if (bigSignSvgs.length > 0)
          tl.to(bigSignSvgs, { scale: BIG_SIGN_SCALE, yPercent: BIG_SIGN_DROP_Y_PERCENT, xPercent: BIG_SIGN_SHIFT_X_PERCENT, duration: 1, ease: 'none', force3D: false }, 0);
        // Billboard rises from off-screen only after the user reaches the About section.
        // fromTo pins the start value so scrubbing backwards also works correctly.
        if (billboardLayers.length > 0)
          tl.fromTo(
            billboardLayers,
            { yPercent: BILLBOARD_START_Y_PERCENT },
            { yPercent: BILLBOARD_END_Y_PERCENT, duration: 1 - ABOUT_ACTIVE_PROGRESS, ease: 'none', force3D: false },
            ABOUT_ACTIVE_PROGRESS
          );
        // fromTo pins xPercent: 0 as the explicit scroll-start state, so even if
        // the intro tween is still running when the user first scrolls, there is
        // no snap — GSAP always interpolates from 0 to SHIFT_X_PERCENT.
        if (forestSvgs.length > 0)
          tl.fromTo(forestSvgs,
            { xPercent: 0, scale: 1, immediateRender: false },
            { xPercent: FOREST_SHIFT_X_PERCENT, scale: FOREST_SCALE, duration: 1, ease: 'none', force3D: false },
            0);
        if (forestPaths.length > 0)
          tl.to(forestPaths, { attr: { fill: '#696969' }, duration: 1, ease: 'none' }, 0);
        if (forest2Svgs.length > 0)
          tl.fromTo(forest2Svgs,
            { xPercent: 0, scale: 1, immediateRender: false },
            { xPercent: FOREST2_SHIFT_X_PERCENT, scale: FOREST2_SCALE, duration: 1, ease: 'none', force3D: false },
            0);
        if (forest2Paths.length > 0)
          tl.to(forest2Paths, { attr: { fill: '#C1C1C1' }, duration: 1, ease: 'none' }, 0);

        tl.to(fadeTargets, { opacity: 0, duration: FADE_END_PROGRESS - FADE_START_PROGRESS, ease: 'none' }, FADE_START_PROGRESS);
        if (heroHeading)
          tl.to(heroHeading, { opacity: 0, duration: HEADING_FADE_END_PROGRESS - HEADING_FADE_START_PROGRESS, ease: 'none' }, HEADING_FADE_START_PROGRESS);
      }, section);
      }); // end gsap.delayedCall

      window.addEventListener('load', refresh);
      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('treezoom:go-about', onGoAbout);
      window.addEventListener('treezoom:go-home', onGoHome);
    };

    // Fire immediately if no loading screen is present (e.g. hard refresh mid-page),
    // otherwise wait for the ground slide-up (flip-start) and FLIP handoff (intro-complete).
    if (!document.getElementById('app-loading')) {
      // No loading screen — reveal all background elements immediately, no slide animations.
      gsap.set([...groundSvgs, ...forestSvgs, ...forest2Svgs, ...billboardLayers], { opacity: 1 });
      revealScene();
    } else {
      window.addEventListener('app:flip-start', onFlipStart, { once: true });
      window.addEventListener('app:intro-complete', revealScene, { once: true });
    }

    return () => {
      window.removeEventListener('app:flip-start', onFlipStart);
      window.removeEventListener('app:intro-complete', revealScene);
      window.removeEventListener('load', refresh);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('treezoom:go-about', onGoAbout);
      window.removeEventListener('treezoom:go-home', onGoHome);
      if (resetTimer) window.clearTimeout(resetTimer);
      previewTween?.kill();
      mainCtx?.revert();
    };
  }, []);

  return (
    // Used h-[100svh] to prevent mobile jumping
    <section ref={sectionRef} className="relative h-[100svh] w-full bg-white">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          ref={treeLayerRef}
          //Size of the tree svg
          className="relative z-[20] translate-y-[25vh] sm:translate-y-[5vh] md:translate-y-0 [&>svg]:block [&>svg]:h-[30vh] sm:[&>svg]:h-[44vh] md:[&>svg]:h-[50vh] [&>svg]:w-auto [&>svg]:text-black [&>svg]:[transform-box:fill-box]"
          dangerouslySetInnerHTML={{ __html: treeSvg }}
          aria-hidden
        />
        {children}
      </div>
    </section>
  );
}
