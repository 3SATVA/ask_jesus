import { AskPanel } from "@/components/ask-panel";
import { JesusScene } from "@/components/jesus-scene";
import { dailyLimit, supportUrl } from "@/lib/config";

export default function Home() {
  return (
    <main className="relative min-h-dvh">
      <JesusScene />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4">
        <div className="flex h-[40vh] items-end justify-center">
          <h1 className="ask-title translate-y-1/2 text-center font-display text-[clamp(1.85rem,6.4vw,3.35rem)] leading-none font-semibold tracking-[0.2em] sm:tracking-[0.28em]">
            ASK JESUS
          </h1>
        </div>
        <AskPanel supportUrl={supportUrl()} initialLimit={dailyLimit()} />
      </div>
    </main>
  );
}
