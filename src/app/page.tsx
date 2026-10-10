import { AskPanel } from "@/components/ask-panel";
import { JesusScene } from "@/components/jesus-scene";
import { dailyLimit, supportUrl } from "@/lib/config";

export default function Home() {
  return (
    <main className="relative h-dvh overflow-hidden">
      <JesusScene />
      <div className="relative z-10 flex h-dvh min-h-0 flex-col">
        <h1 className="ask-title pointer-events-none shrink-0 px-4 pt-[max(0.85rem,env(safe-area-inset-top))] text-center font-cinzel text-[clamp(1.7rem,6.2vw,3.5rem)] leading-none font-semibold tracking-[0.16em] sm:tracking-[0.22em]">
          ASK JESUS
        </h1>
        <AskPanel supportUrl={supportUrl()} initialLimit={dailyLimit()} />
      </div>
    </main>
  );
}
