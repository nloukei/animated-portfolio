export default function HeroHeading() {
  return (
    <div
      data-hero-heading
      className="pointer-events-none absolute inset-x-0 top-[12vh] z-20 flex flex-col items-center gap-2 px-6 text-center"
    >
      {/* Mobile now uses: text-[clamp(1.4rem,6vw,2.2rem)] */}
      <h1 className="bg-[linear-gradient(to_top_left,#ce66a4,#669dde)] bg-clip-text font-['Georgia',serif] text-[clamp(1.4rem,6vw,2.2rem)] md:text-[clamp(1.1rem,3.2vw,2.2rem)] font-normal leading-snug tracking-tight text-transparent">
        Rooted in Logic.
        <br />
        Branching into Design.
      </h1>
    </div>
  );
}
