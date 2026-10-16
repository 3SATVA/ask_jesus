import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { unlimitedDailyCap } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms — ASK JESUS",
  description: "Terms for Ask Jesus AI, including the free daily messages and the iOS day pass and subscription.",
};

export default function TermsPage() {
  const cap = unlimitedDailyCap();
  return (
    <LegalPage
      title="Terms"
      lede="Ask Jesus AI is a conversation shaped by the Gospels and the Hebrew scriptures. These terms say what it is, and what an iOS purchase buys."
    >
      <p>
        The voice is an AI. It is not Jesus, not scripture, and not a pastor, doctor, lawyer, or
        counselor. Do not rely on it for medical, legal, or financial decisions. If you may be in
        danger, contact local emergency services or the help lines named in the app.
      </p>
      <p>
        The website and the iOS app include 10 free messages per UTC day on that device. A new
        day starts at midnight UTC. Crisis replies do not use one of those messages.
      </p>
      <p>
        The iOS app can offer Unlimited today and one monthly subscription through Apple In-App
        Purchase. There is no other way to pay inside the iOS app.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Unlimited today is a consumable. It unlocks messages until midnight UTC on the day it is
          bought, up to {cap} messages that day.
        </li>
        <li>
          Monthly is an auto-renewable subscription. It unlocks messages until the paid period
          ends, up to {cap} messages each UTC day.
        </li>
      </ul>
      <p>
        Payment is charged to your Apple ID at confirmation. The subscription renews each month
        unless you cancel it in your Apple ID settings at least 24 hours before the current
        period ends. Apple renews the charge within 24 hours before the period ends. You can
        manage or cancel the subscription in Settings. Unlimited today is used when you buy it
        and is not a subscription. Refunds are handled by Apple.
      </p>
      <p>
        Restoring purchases puts an active subscription back on this device. Unlimited today
        stays on the device that confirmed it, until that UTC day ends.
      </p>
      <p>
        You keep the words on your device. Do not use the app to harm someone, to break the law,
        or to pretend an answer is scripture. The service can change or stop. These terms apply
        to the website and to the iOS app named Ask Jesus AI.
      </p>
    </LegalPage>
  );
}
