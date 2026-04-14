import groundSvg from '../assets/Vector-3.svg?raw';

export default function Ground() {
  return (
    <div
      data-ground-svg
      //Adjust position of the ground svg -bottom-[16vh] left-[52%]
      className="pointer-events-none absolute -bottom-[16vh] left-[50%] z-10 w-[120vw] -translate-x-1/2 overflow-hidden"
    >
      <div
        className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: groundSvg }}
        aria-hidden
      />
    </div>
  );
}
