import type { Metadata } from "next";
import Link from "next/link";
import { JesusScene } from "@/components/jesus-scene";

export const metadata: Metadata = {
  title: "About — ASK JESUS",
  description:
    "ASK JESUS is an AI shaped by the four Gospels. When it quotes scripture, it quotes the Hebrew scriptures. It is not Jesus, and it is not scripture.",
};

const HELP = [
  {
    title: "Thoughts of suicide or self-harm",
    body: "In the United States, call or text 988 (Suicide & Crisis Lifeline). Outside the United States, the International Association for Suicide Prevention lists local help.",
    links: [
      { href: "https://988lifeline.org", label: "988lifeline.org" },
      {
        href: "https://www.iasp.info/suicidalthoughts/",
        label: "Help outside the United States",
      },
    ],
  },
  {
    title: "If someone is hurting you",
    body: "In the United States, the National Domestic Violence Hotline is 1-800-799-7233. If a child is in danger, tell a trusted adult or contact local emergency services, or call or text Childhelp at 1-800-422-4453.",
    links: [{ href: "https://www.thehotline.org", label: "thehotline.org" }],
  },
  {
    title: "A medical emergency",
    body: "Call 911, or your local emergency number, now. This page cannot diagnose or treat an illness.",
    links: [],
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-dvh">
      <JesusScene />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[#071018]/78" />

      <article className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-12">
        <p className="text-center">
          <Link
            href="/"
            className="font-display text-sm tracking-[0.28em] text-[#f0d48a] hover:text-[#fff6d8]"
          >
            ASK JESUS
          </Link>
        </p>

        <header className="glass-panel rounded-3xl px-5 py-7 sm:px-8">
          <h1 className="font-display text-4xl font-semibold tracking-wide text-[#fff8e8] sm:text-5xl">
            About
          </h1>
          <p className="mt-4 font-display text-xl leading-8 text-[#f7f1e4] italic">
            A quiet conversation, drawn from Scripture, of what Jesus might say.
          </p>
          <div className="mt-5 space-y-4 text-[0.98rem] leading-7 text-[#f6efe2]">
            <p>
              ASK JESUS is an AI. You talk with it, and it answers in a
              first-person voice, doing its best to estimate what Jesus might
              say. The four Gospels — Matthew, Mark, Luke, and John — shape
              that voice: his character, the way he speaks, his parables, and
              his teachings. He may say his own Gospel words naturally in the
              conversation.
            </p>
            <p>
              When he quotes scripture, he quotes the Hebrew scriptures, the
              way he does in the Gospels. The Psalms especially, and also
              Isaiah, Deuteronomy, Proverbs, and the other books of the Law
              and the Prophets. Those quotations are the ones set apart in
              gold italic type. He does not quote Acts, the letters, or
              Revelation as his own scripture, because they were written
              later. He does not use books outside the Gospels and the Hebrew
              scriptures. There is no Gospel of Thomas here, and no other
              apocrypha.
            </p>
            <p>
              The hope is a tone of welcome: caring, forgiving, and full of
              mercy. It is an interpretation offered with affection. It is not
              a new revelation.
            </p>
          </div>
        </header>

        <section className="glass-panel rounded-3xl px-5 py-7 sm:px-8" aria-labelledby="disclaimer-heading">
          <h2
            id="disclaimer-heading"
            className="font-display text-3xl font-semibold text-[#f0d48a]"
          >
            Please read this
          </h2>
          <ul className="mt-5 space-y-4 text-[0.98rem] leading-7 text-[#f6efe2]">
            <li>
              <strong className="font-medium text-[#fff8e8]">This is not Jesus.</strong>{" "}
              No program can be him. The voice is an estimate, not a presence.
            </li>
            <li>
              <strong className="font-medium text-[#fff8e8]">This is not scripture.</strong>{" "}
              Nothing written here is the Bible, and nothing here should be
              treated as a new verse.
            </li>
            <li>
              <strong className="font-medium text-[#fff8e8]">
                This is not a substitute for pastoral, medical, legal, or mental
                health advice.
              </strong>{" "}
              It cannot sit with you the way a pastor can, and it cannot
              diagnose, treat, or represent you.
            </li>
            <li>
              <strong className="font-medium text-[#fff8e8]">Answers may be imperfect.</strong>{" "}
              A citation can be mistaken. A sentence can miss what you meant.
              When that happens, let Scripture itself be the measure, especially the Gospels.
            </li>
            <li>
              <strong className="font-medium text-[#fff8e8]">
                Read the Bible, and talk with trusted spiritual leaders.
              </strong>{" "}
              A pastor, a priest, or a wise friend in your community can walk
              with you in a way these words cannot, especially when a question
              is heavy.
            </li>
          </ul>
        </section>

        <section className="glass-panel rounded-3xl px-5 py-7 sm:px-8" aria-labelledby="help-heading">
          <h2 id="help-heading" className="font-display text-3xl font-semibold text-[#f0d48a]">
            If you are in danger
          </h2>
          <p className="mt-4 text-[0.98rem] leading-7 text-[#f6efe2]">
            Please reach a real person. If you are thinking about suicide, if
            someone is hurting you, or if this is a medical emergency, use the
            help below. In the United States, 988 is there day and night.
          </p>
          <ul className="mt-5 space-y-5">
            {HELP.map((item) => (
              <li key={item.title}>
                <h3 className="font-medium text-[#fff8e8]">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#f6efe2]/90">{item.body}</p>
                {item.links.length > 0 ? (
                  <p className="mt-1 flex flex-col gap-1">
                    {item.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#f0d48a] underline decoration-[rgba(240,212,138,0.45)] underline-offset-4"
                      >
                        {link.label}
                      </a>
                    ))}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm">
          <Link
            href="/"
            className="text-[#f0d48a] underline decoration-[rgba(240,212,138,0.45)] underline-offset-4"
          >
            Return to ask
          </Link>
          <Link
            href="/privacy"
            className="text-[#f0d48a] underline decoration-[rgba(240,212,138,0.45)] underline-offset-4"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-[#f0d48a] underline decoration-[rgba(240,212,138,0.45)] underline-offset-4"
          >
            Terms
          </Link>
        </p>
      </article>
    </main>
  );
}
