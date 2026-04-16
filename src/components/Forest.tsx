import forestSvg from '../assets/Vector-1.svg?raw';

export default function Forest() {
  return (
    <div
      data-forest-svg
      className="pointer-events-none absolute inset-x-0 bottom-[-5%] 
      z-[2] flex items-end justify-center overflow-hidden"
    >
      <div
        className="w-[125vw] [&>svg]:block 
        [&>svg]:h-[min(92vh,100%)] 
        [&>svg]:w-[160vw] [&>svg]:max-w-none [&>svg]:object-cover [&>svg]:object-bottom"
        dangerouslySetInnerHTML={{ __html: forestSvg }}
        aria-hidden
      />
    </div>
  );
}
