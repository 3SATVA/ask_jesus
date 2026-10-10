import Image from "next/image";

const WISPS = [
  { className: "left-[8%] top-[22%] h-40 w-40", delay: "0s" },
  { className: "right-[6%] top-[18%] h-52 w-52", delay: "1.4s" },
  { className: "left-[2%] top-[46%] h-36 w-44", delay: "2.2s" },
  { className: "right-[4%] top-[42%] h-44 w-36", delay: "0.8s" },
  { className: "left-[28%] top-[12%] h-28 w-56", delay: "1.8s" },
  { className: "right-[22%] top-[58%] h-32 w-40", delay: "2.8s" },
];

/**
 * Original illustration (not a known painting) with animated light around it.
 * The heart of the figure sits near 40% of the portrait, which is where the title rests.
 */
export function JesusScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07090f]">
      <div className="absolute inset-0 hidden md:block">
        <Image
          src="/jesus.jpg"
          alt=""
          fill
          sizes="100vw"
          className="scale-110 object-cover opacity-50 blur-3xl"
        />
        <div className="absolute inset-0 bg-[#07090f]/55" />
      </div>

      <div className="absolute inset-y-0 left-1/2 h-full w-[min(100vw,calc(100dvh*9/16))] -translate-x-1/2">
        <Image
          src="/jesus.jpg"
          alt="An original illustration of Jesus, arms open, with a golden light at his heart."
          fill
          priority
          sizes="(max-width: 768px) 100vw, 56vh"
          className="object-cover object-center"
        />
        <div className="scene-vignette absolute inset-0" />
        <div className="heart-glow" />
        {WISPS.map((wisp) => (
          <span
            key={wisp.className}
            className={`wisp ${wisp.className}`}
            style={{ animationDelay: wisp.delay }}
          />
        ))}
      </div>

      <div className="absolute inset-0 hidden md:block">
        <span className="wisp top-[20%] left-[8%] h-56 w-56" />
        <span
          className="wisp top-[30%] right-[6%] h-64 w-64"
          style={{ animationDelay: "1.6s" }}
        />
        <span
          className="wisp bottom-[12%] left-[14%] h-40 w-72"
          style={{ animationDelay: "2.4s" }}
        />
      </div>
    </div>
  );
}
