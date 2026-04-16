import billboardSvg from '../assets/billboard1.svg?raw';

export default function Billboard() {
  return (
    <div
      data-billboard-svg
      className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
    >
      <div
        className="relative w-[92vw] max-w-none sm:w-[90vw] md:w-[88vw]"
      >
        <div
          className="[&>svg]:block [&>svg]:h-auto [&>svg]:max-h-[96vh] [&>svg]:w-full [&>svg]:origin-bottom [&>svg]:text-black [&>svg]:[transform-box:fill-box]"
          dangerouslySetInnerHTML={{ __html: billboardSvg }}
          aria-hidden
        />
        <p
          data-billboard-line="1"
          className="absolute left-1/2 top-[36%] m-0 w-[70%] -translate-x-1/2 -translate-y-1/2 text-center font-['Georgia',serif] text-[clamp(0.8rem,2vw,2.1rem)] leading-tight text-[#111]"
        >
          Hi! I'm Keith 
        </p>
        <p
          data-billboard-line="2"
          className="absolute left-1/2 top-[36%] m-0 w-[70%] -translate-x-1/2 -translate-y-1/2 text-center font-['Georgia',serif] text-[clamp(0.8rem,2vw,2.1rem)] leading-tight text-[#111]"
        >
            I do web application development as a full-stack developer. 
        </p>
        <p
          data-billboard-line="3"
          className="absolute left-1/2 top-[36%] m-0 w-[70%] -translate-x-1/2 -translate-y-1/2 text-center font-['Georgia',serif] text-[clamp(0.8rem,2vw,2.1rem)] leading-tight text-[#111]"
        >
             I’m a DOST-SEI Scholar and a final-year IT student.
        </p>
      </div>
    </div>
  );
}
