import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import treeSvg from '../assets/tree.svg?raw';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SCROLL_ZOOM_DISTANCE = 3200;
const MAX_SCALE = 15; // Increased slightly for a deeper "feel"
const ORIGIN_X = '50%';
const ORIGIN_Y = '85%';

export default function TreeZoom() {
  const sectionRef = useRef<HTMLElement>(null);
  const treeLayerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const treeLayer = treeLayerRef.current;
    const svg = treeLayer?.querySelector<SVGSVGElement>('svg');
    if (!section || !svg) return;

    const ctx = gsap.context(() => {
      // Scale the <svg> itself, not a wrapper. Scaling a div promotes a GPU layer that gets
      // rasterized at ~screen size, so extreme zoom looks blurry; the SVG stays vector this way.
      gsap.set(svg, {
        transformOrigin: `${ORIGIN_X} ${ORIGIN_Y}`,
        force3D: false,
      });

      gsap.to(svg, {
        scale: MAX_SCALE,
        ease: 'none',
        force3D: false,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${SCROLL_ZOOM_DISTANCE}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    // Astro-specific: Wait for fonts/layout to settle then refresh
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);

    return () => {
      window.removeEventListener('load', refresh);
      ctx.revert(); // This kills the ScrollTrigger and the animation
    };
  }, []);

  return (
    // Used h-[100svh] to prevent mobile jumping
    <section ref={sectionRef} className="relative h-[100svh] w-full bg-white">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          ref={treeLayerRef}
          className="[&>svg]:block [&>svg]:h-[80vh] [&>svg]:w-auto [&>svg]:text-black [&>svg]:[transform-box:fill-box]"
          dangerouslySetInnerHTML={{ __html: treeSvg }}
          aria-hidden
        />
      </div>
      
      {/* Pro Tip: Add an empty div at the bottom of the section 
         to act as the "Trigger" for your content fade-in 
      */}
    </section>
  );
}