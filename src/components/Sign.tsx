import signboardSvg from '../assets/signboard.svg?raw';

export default function Sign() {
  return (
    <div
      data-sign-svg
      className="pointer-events-none absolute bottom-[18vh] rotate-[8deg] left-[64%] z-10 
      w-[24vw] min-w-[68px] max-w-[120px] -translate-x-1/2 sm:bottom-[16vh] sm:left-[62%] sm:max-w-[132px] md:bottom-[18vh] md:left-[60%] md:w-[10vw] md:max-w-[170px]"
    >
      <div
        className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: signboardSvg }}
        aria-hidden
      />
    </div>
  );
}
