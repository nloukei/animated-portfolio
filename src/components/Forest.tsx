import forestSvg from '../assets/Vector-1.svg?raw';

export default function Forest() {
  return (
    <div
      data-forest-svg
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex items-end justify-center overflow-hidden"
    >
      <div
        className="w-screen [&>svg]:block [&>svg]:h-[min(70vh,100%)] [&>svg]:w-screen [&>svg]:max-w-none [&>svg]:object-cover [&>svg]:object-bottom"
        dangerouslySetInnerHTML={{ __html: forestSvg }}
        aria-hidden
      />
    </div>
  );
}
