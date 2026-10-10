import { AskPanel } from "@/components/ask-panel";
import { JesusScene } from "@/components/jesus-scene";
import { ViewportShell } from "@/components/viewport-shell";
import { dailyLimit, supportUrl } from "@/lib/config";

export default function Home() {
  return (
    <ViewportShell>
      <JesusScene contained />
      <h1 className="ask-title pointer-events-none text-center font-cinzel font-semibold">
        ASK JESUS
      </h1>
      <div className="chat-dock">
        <AskPanel supportUrl={supportUrl()} initialLimit={dailyLimit()} />
      </div>
    </ViewportShell>
  );
}
