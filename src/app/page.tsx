import { AskPanel } from "@/components/ask-panel";
import { JesusScene } from "@/components/jesus-scene";
import { dailyLimit, supportUrl } from "@/lib/config";

export default function Home() {
  return (
    <main className="relative h-dvh overflow-hidden">
      <JesusScene />
      <h1 className="ask-title pointer-events-none text-center font-cinzel font-semibold">
        ASK JESUS
      </h1>
      <div className="chat-dock">
        <AskPanel supportUrl={supportUrl()} initialLimit={dailyLimit()} />
      </div>
    </main>
  );
}
