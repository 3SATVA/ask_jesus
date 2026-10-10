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
| `NEXT_PUBLIC_SUPPORT_URL` | No | Destination for the “Support this ministry” link. Leave it unset and the link explains that a giving page can be connected. |
| `NEXT_PUBLIC_SITE_URL` | No | Absolute site URL for link previews. On Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is used when this is unset. Otherwise the URL is `https://ask-jesus-lake.vercel.app`. |

Changing `NEXT_PUBLIC_*` values requires a new build.

## How a question is answered

`POST /api/ask` checks the question, then:

1. If it sounds like someone is in danger, it streams a short compassionate reply with real help (988, the National Domestic Violence Hotline, Childhelp, or 911). That reply does not count against the daily limit.
2. If the daily limit is used up, it returns a friendly note and the support link.
3. If `OPENAI_API_KEY` is not configured, it returns a clear error.
4. Otherwise it streams a reply with `streamText` from the AI SDK and the OpenAI provider. The recent conversation is sent with the new question, so the reply can remember what was already said. Only the new question counts against the daily limit. The browser keeps the current conversation in `localStorage`. GPT-6 models, including the default, do not accept a temperature setting, so the request does not send one.

A scripture quotation is marked on its own line as `> Exact words. (Book 1:1)`. The chat renders that line in italic gold, with the reference beside it. Those marked quotations are from the Hebrew scriptures. Gospel sentences stay in his own voice and are not marked that way.

`GET /api/ask` returns how many questions are left today.

## Deploy on Vercel

1. Push this project to a Git repository and import it in Vercel. Framework preset: Next.js. No extra build settings.
2. Add `OPENAI_API_KEY` in Project Settings → Environment Variables. Create the key in the [OpenAI API keys](https://platform.openai.com/api-keys) dashboard.
3. Optionally set `OPENAI_MODEL`, `DAILY_QUESTION_LIMIT`, `NEXT_PUBLIC_SUPPORT_URL`, and `NEXT_PUBLIC_SITE_URL`.
4. Deploy. Streaming runs on the default Node.js runtime.

## Scripts

```bash
npm run dev    # http://localhost:43123
npm run build
npm run start
npm run lint
npm test
```
