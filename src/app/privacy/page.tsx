import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy — ASK JESUS",
  description: "How Ask Jesus AI handles the words you type, the daily limit, and App Store purchases.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      lede="Ask Jesus AI does not ask you to make an account. This page says what leaves your device, and what stays."
    >
      <p>
        The words you type are sent to this app’s server so a reply can be written. The server
        sends that conversation to OpenAI to produce the answer. It does not keep a copy of the
        chat after the reply is streamed back. The conversation you see is stored on your device.
      </p>
      <p>
        If a message looks like you may be in danger, the server answers with public help lines
        and does not send that message to the model. Those help lines are the 988 Suicide &
        Crisis Lifeline, the National Domestic Violence Hotline, Childhelp, and local emergency
        numbers.
      </p>
      <p>
        A small cookie named ask_jesus_quota remembers how many free messages this browser has
        used today. The free allowance is 10 messages per UTC day. The cookie is not an account.
      </p>
      <p>
        On the iOS app, gifts and the monthly subscription are processed by Apple. This app does
        not receive your card number. After Apple returns a signed transaction, the server checks
        it with Apple and, if it is valid, sets a cookie named ask_jesus_unlock. That cookie says
        how long unlimited messages last: until the end of the UTC day for a gift, or until the
        subscription period ends. The website does not sell those gifts. If a giving page is
        configured, it is only shown on the website.
      </p>
      <p>
        The app does not use advertising identifiers, and it does not sell personal information.
        It is not directed to children under 13.
      </p>
      <p>Questions about privacy can be sent through the contact on the App Store listing for Ask Jesus AI.</p>
    </LegalPage>
  );
}
