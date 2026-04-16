import bigsignSvg from '../assets/bigsign.svg?raw';

export default function BigSign() {
  return (
    <div
      data-bigsign-svg 
                                                    //Adjust position of the big sign svg -bottom-0 left-0                    
      className="pointer-events-none absolute bottom-[-20px] left-[0%] 
      z-[70] w-[min(48vw,300px)] sm:w-[min(40vw,280px)] md:w-[min(32vw,360px)]"
    >
      <div
        className="[&>svg]:block [&>svg]:h-auto [&>svg]:max-h-[26vh] //
        [&>svg]:w-full [&>svg]:origin-bottom-left [&>svg]:text-black [&>svg]:[transform-box:fill-box]"
        dangerouslySetInnerHTML={{ __html: bigsignSvg }}
        aria-hidden
      />
    </div>
  );
}
