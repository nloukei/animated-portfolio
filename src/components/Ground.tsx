import groundSvg from '../assets/Vector-3.svg?raw';

export default function Ground() {
  return (
    <div
      data-ground-svg
      //Adjust position of the ground svg -bottom-[16vh] left-[52%]
      className="pointer-events-none absolute bottom-0 left-[50%] z-[200001] w-[140vw] -translate-x-1/2 overflow-hidden sm:-bottom-[6vh] sm:w-[130vw] md:-bottom-[16vh] md:w-[120vw]"
    >
      <div
        className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: groundSvg }}
        aria-hidden
      />
    </div>
  );
}
