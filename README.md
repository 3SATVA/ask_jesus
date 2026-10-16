# ASK JESUS

A single-screen place for a Christian to talk with AI Jesus. He answers in the first person, short and tender, curious about the person in front of him, and he does not step out of that voice to hedge or to disclaim himself. If someone asks what he is, he says he is AI Jesus. The four Gospels shape how he speaks. When he quotes scripture, he quotes the Hebrew scriptures — the Psalms, Isaiah, Deuteronomy, Proverbs, and the other books he quotes in the Gospels. He does not quote Acts, the letters, or Revelation as his own scripture. Answers stream from OpenAI through the [AI SDK](https://ai-sdk.dev) (`@ai-sdk/openai`).

His personality is the plain text in `JESUS_PROMPT.md`, at the root of this repo. Edit that file to change how he speaks. You do not need to change any code. The note at the top of the file is for the editor and is not sent to the model. A new build and deploy picks up the edit. Crisis detection, and the replies that name 988, the abuse hotlines, or 911, stay in the server code.

The About page (`/about`), linked from the main screen, keeps the disclaimer: this is not Jesus, not scripture, and not a substitute for pastoral, medical, legal, or mental health care. That disclaimer stays off the conversation itself.

The full-screen background is the supplied portrait of Jesus, arms open, light behind him, with a dark fade below. It is positioned so the top of his hair meets the top of the screen. It is served as responsive AVIF and WebP from `public/art`.

## Run locally

Node.js 22 or later.

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and set `OPENAI_API_KEY`. Then:

```bash
npm run dev
```

Open [http://localhost:43123](http://localhost:43123).

Without that key, the page still loads. Asking a question returns a clear message naming `OPENAI_API_KEY`. Crisis questions (self-harm, abuse, a medical emergency) still reply with real help lines, including 988 in the United States, and do not use the model.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Authenticates the server to OpenAI. The [AI SDK](https://ai-sdk.dev) OpenAI provider reads this variable. Do not expose it to the browser. |
| `OPENAI_MODEL` | No | OpenAI model ID. Defaults to `gpt-6-luna`, a small, current, low-cost chat model. Pick an ID from the [OpenAI models](https://developers.openai.com/api/docs/models) list. |
| `DAILY_QUESTION_LIMIT` | No | Free questions per browser per UTC day. Defaults to `10`. Stored in an httpOnly cookie named `ask_jesus_quota`. This is a simple per-browser stub, not an account. |
| `UNLIMITED_DAILY_CAP` | No | Fair-use cap for a verified day pass or monthly subscription, per UTC day. Defaults to `300`. The same quota cookie counts these messages. Crisis replies do not count. |
| `MAX_OUTPUT_TOKENS` | No | Hard cap on tokens generated for one reply. Defaults to `420`. Values outside 64–2000 are ignored. |
| `NEXT_PUBLIC_SUPPORT_URL` | No | Destination for the “Support this ministry” link on the website. Leave it unset and the link explains that a giving page can be connected. The iOS and Android apps do not open this link. The website has no checkout and does not use Stripe. |
| `NEXT_PUBLIC_SITE_URL` | No | Absolute site URL for link previews. On Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is used when this is unset. Otherwise the URL is `https://ask-jesus-lake.vercel.app`. |
| `APPLE_IAP_KEY_ID` | No | Optional App Store Server API key ID. StoreKit receipts are verified locally without it. |
| `APPLE_IAP_ISSUER_ID` | No | Issuer ID for that optional key. |
| `APPLE_IAP_PRIVATE_KEY` | No | The `.p8` contents for that optional key. Newlines may be written as `\n`. |
| `APPLE_BUNDLE_ID` | No | Defaults to `com.starseedsquad.askjesus`. |
| `APPLE_APP_APPLE_ID` | For production purchases | Numeric Apple ID of the App Store app Ask AI Jesus (`6823414587`). Sandbox and TestFlight receipts can be checked without it. |
| `APPLE_IAP_ONLINE_CHECKS` | No | Set to `true` to also check Apple’s certificate revocation. |
| `UNLOCK_COOKIE_SECRET` | For app purchases | Signs the unlock token and cookie that remember a verified day pass or subscription. Purchases cannot be remembered until this is set on the server. |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | For Android purchases | Service account JSON for the Google Play Developer API. Raw JSON or base64. The same JSON can be the GitHub secret used to upload an Android App Bundle. |
| `GOOGLE_PLAY_PACKAGE_NAME` | No | Defaults to `com.starseedsquad.askjesus`. |

The iOS shell, product IDs, GitHub secrets, and the App Store Connect checklist are in `store-assets/APP_STORE.md`. The Android shell and Play Console checklist are in `store-assets/PLAY_STORE.md`.

Changing `NEXT_PUBLIC_*` values requires a new build. The paywall, terms, and privacy pages also show `UNLIMITED_DAILY_CAP` from the build. The API enforces that cap, and `MAX_OUTPUT_TOKENS`, on each request.

## How a question is answered

`POST /api/ask` checks the question, then:

1. If it sounds like someone is in danger, it streams a short compassionate reply with real help (988, the National Domestic Violence Hotline, Childhelp, or 911). That reply does not count against the daily limit.
2. If the daily limit is used up, it returns a friendly note and the support link. A verified iOS or Android purchase skips that free limit: Unlimited today lasts until the end of that UTC day, and the monthly subscription lasts until the store says it expires. Either purchase still stops at `UNLIMITED_DAILY_CAP` messages in that UTC day (default 300). The reply asks them to rest until tomorrow. The website never offers those purchases and does not use Stripe.
3. If `OPENAI_API_KEY` is not configured, it returns a clear error.
4. Otherwise it streams a reply with `streamText` from the AI SDK and the OpenAI provider. Each reply is limited to `MAX_OUTPUT_TOKENS` (default 420). The recent conversation is sent with the new question, so the reply can remember what was already said. Only the new question counts against the daily limit. The browser keeps the current conversation in `localStorage`. GPT-6 models, including the default, do not accept a temperature setting, so the request does not send one.

A scripture quotation is marked on its own line as `> Exact words. (Book 1:1)`. The chat renders that line in italic gold, with the reference beside it. Those marked quotations are from the Hebrew scriptures. Gospel sentences stay in his own voice and are not marked that way.

`GET /api/ask` returns how many questions are left today.

## Deploy on Vercel

1. Push this project to a Git repository and import it in Vercel. Framework preset: Next.js. No extra build settings.
2. Add `OPENAI_API_KEY` in Project Settings → Environment Variables. Create the key in the [OpenAI API keys](https://platform.openai.com/api-keys) dashboard.
3. Optionally set `OPENAI_MODEL`, `DAILY_QUESTION_LIMIT`, `UNLIMITED_DAILY_CAP`, `MAX_OUTPUT_TOKENS`, `NEXT_PUBLIC_SUPPORT_URL`, and `NEXT_PUBLIC_SITE_URL`.
4. Deploy. Streaming runs on the default Node.js runtime.

## Scripts

```bash
npm run dev    # http://localhost:43123
npm run build
npm run start
npm run lint
npm test
```
