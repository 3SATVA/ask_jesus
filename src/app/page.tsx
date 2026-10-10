import { AskPanel } from "@/components/ask-panel";
import { JesusScene } from "@/components/jesus-scene";
import { dailyLimit, supportUrl } from "@/lib/config";

export default function Home() {
  return (
    <main className="relative h-dvh overflow-hidden">
      <JesusScene />
      <div className="art-frame z-10">
        <h1 className="ask-title hero-title pointer-events-none left-1/2 w-max -translate-x-1/2 text-center font-cinzel text-[clamp(2rem,7.4vw,4.6rem)] leading-none font-semibold tracking-[0.16em] sm:tracking-[0.22em]">
          ASK JESUS
        </h1>
        <div className="hero-prompt absolute left-1/2 -translate-x-1/2">
          <AskPanel supportUrl={supportUrl()} initialLimit={dailyLimit()} />
        </div>
      </div>
    </main>
  );
}
