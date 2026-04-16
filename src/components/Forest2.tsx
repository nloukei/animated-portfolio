import forest2Svg from '../assets/Vector.svg?raw';

export default function Forest2() {
  return (
    <div
      data-forest2-svg
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex items-end justify-center overflow-hidden"
    >
      <div
        className="w-[120vw] [&>svg]:block [&>svg]:h-[min(65vh,100%)] [&>svg]:w-[140vw] [&>svg]:max-w-none [&>svg]:object-cover [&>svg]:object-bottom"
        dangerouslySetInnerHTML={{ __html: forest2Svg }}
        aria-hidden
      />
    </div>
  );
}
