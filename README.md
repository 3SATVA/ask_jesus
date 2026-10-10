# ASK JESUS

A single-screen place to ask a question and receive a warm, first-person reply grounded in the four Gospels (Matthew, Mark, Luke, and John). The voice is instructed to lead with compassion, mercy, and hope. Answers stream from a language model through the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway). They are an AI interpretation inspired by the Gospels, not scripture.

The About page (`/about`), linked from the main screen, explains that this is an estimate of what Jesus might say. It carries the disclaimer: not Jesus, not scripture, and not a substitute for pastoral, medical, legal, or mental health care.

The full-screen background is the supplied portrait of Jesus, arms open, glowing in the clouds above the earth. It is served as responsive AVIF and WebP from `public/art`.

## Run locally

Node.js 22 or later.

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and set `AI_GATEWAY_API_KEY`. Then:

```bash
npm run dev
```

Open [http://localhost:43123](http://localhost:43123).

Without that key, the page still loads. Asking a question returns a clear message naming `AI_GATEWAY_API_KEY`. Crisis questions (self-harm, abuse, a medical emergency) still reply with real help lines, including 988 in the United States, and do not use the model.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | Locally, yes | Authenticates the server to the Vercel AI Gateway. The [AI SDK](https://ai-sdk.dev) reads this variable. Do not expose it to the browser. |
| `VERCEL_OIDC_TOKEN` | No | On Vercel, deployments receive this token automatically. The app accepts it in place of `AI_GATEWAY_API_KEY`, and the AI SDK uses it to call the gateway. |
| `AI_GATEWAY_MODEL` | No | Gateway model ID, such as `google/gemini-3.8-flash`. Defaults to `google/gemini-3.8-flash`. Pick an ID from `https://ai-gateway.vercel.sh/v1/models`. |
| `DAILY_QUESTION_LIMIT` | No | Free questions per browser per UTC day. Defaults to `5`. Stored in an httpOnly cookie named `ask_jesus_quota`. This is a simple per-browser stub, not an account. |
| `NEXT_PUBLIC_SUPPORT_URL` | No | Destination for the “Support this ministry” link. Leave it unset and the link explains that a giving page can be connected. |
| `NEXT_PUBLIC_SITE_URL` | No | Absolute site URL for link previews. On Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is used when this is unset. |

Changing `NEXT_PUBLIC_*` values requires a new build.

## How a question is answered

`POST /api/ask` checks the question, then:

1. If it sounds like someone is in danger, it streams a short compassionate reply with real help (988, the National Domestic Violence Hotline, Childhelp, or 911). That reply does not count against the daily limit.
2. If the daily limit is used up, it returns a friendly note and the support link.
3. If no gateway credential is configured, it returns a clear error.
4. Otherwise it streams a reply with `streamText` from the AI SDK. The system prompt keeps the voice in the first person, limits sources to the four Gospels, and asks for chapter and verse only when the reference is trustworthy.

`GET /api/ask` returns how many questions are left today.

A finished answer can be copied, downloaded as a card, or shared from the “Share this answer” button.

## Deploy on Vercel

1. Push this project to a Git repository and import it in Vercel. Framework preset: Next.js. No extra build settings.
2. Add `AI_GATEWAY_API_KEY` in Project Settings → Environment Variables, or rely on Vercel OIDC for the deployment (the AI Gateway must be enabled for the team).
3. Optionally set `AI_GATEWAY_MODEL`, `DAILY_QUESTION_LIMIT`, `NEXT_PUBLIC_SUPPORT_URL`, and `NEXT_PUBLIC_SITE_URL`.
4. Deploy. Streaming runs on the default Node.js runtime.

Create a gateway key from the [AI Gateway API keys](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai-gateway%2Fapi-keys&title=AI+Gateway+API+Keys) page.

## Scripts

```bash
npm run dev    # http://localhost:43123
npm run build
npm run start
npm run lint
npm test
```
