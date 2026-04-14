import forest2Svg from '../assets/Vector.svg?raw';

export default function Forest2() {
  return (
    <div
      data-forest2-svg
      className="pointer-events-none absolute inset-0 z-0 flex items-end justify-center overflow-hidden"
    >
      <div
        className="[&>svg]:block [&>svg]:h-[min(65vh,100%)] [&>svg]:w-full [&>svg]:max-w-none [&>svg]:object-cover [&>svg]:object-bottom [&>svg]:translate-x-10"
        dangerouslySetInnerHTML={{ __html: forest2Svg }}
        aria-hidden
      />
    </div>
  );
}
