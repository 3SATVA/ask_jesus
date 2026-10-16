# Ask Jesus AI — App Store

The iOS app is a Capacitor shell. It loads the live site (by default `https://ask-jesus-lake.vercel.app`) and sells messages only through Apple In-App Purchase. The website keeps the free daily limit and the optional `NEXT_PUBLIC_SUPPORT_URL` link. That link is not shown in the iOS app. The website has no checkout and does not use Stripe. Android uses the same prices with shorter product IDs, listed in `store-assets/PLAY_STORE.md`.

Do not run the TestFlight workflow until the steps at the bottom are done.

## Listing

| Field | Value |
| --- | --- |
| Name | Ask Jesus AI |
| Subtitle | A quiet talk with Scripture |
| Bundle ID | `com.starseedsquad.askjesus` |
| SKU | `ask-jesus-ai` |
| Primary category | Lifestyle |
| Secondary category | Reference |
| Privacy policy URL | `https://ask-jesus-lake.vercel.app/privacy` |
| Terms URL | `https://ask-jesus-lake.vercel.app/terms` |
| Support URL | `https://ask-jesus-lake.vercel.app/about` |
| Marketing URL | `https://ask-jesus-lake.vercel.app` |
| Copyright | 2026, using the legal name on the Apple Developer account |
| Price | Free, with in-app purchases |
| Age rating | 12+ (see the notes below) |

### Description

Ask Jesus AI is a quiet place to talk. You write what is on your mind. The reply is short, in the first person, shaped by the four Gospels. When it quotes scripture, it quotes the Hebrew scriptures, especially the Psalms.

Ten messages a day are free. On this iOS app, Unlimited today opens the rest of the day for $0.99, and a monthly subscription keeps every day open for $6.99. Those are purchased from Apple, inside the app. A day pass or subscription includes 300 messages each UTC day.

This is not Jesus, and it is not scripture. It is not a pastor, a doctor, or a counselor. If you may be in danger, the app points you to real help, including 988 in the United States.

Privacy policy: https://ask-jesus-lake.vercel.app/privacy
Terms of use: https://ask-jesus-lake.vercel.app/terms

### Keywords

`jesus,bible,prayer,psalm,scripture,gospel,faith,christian,devotion,comfort`

### Promotional text

Ten free messages a day. Unlimited today is $0.99. A month is $6.99.

### Age rating notes

Answer the questionnaire this way:

- Cartoon or fantasy violence, realistic violence, sexual content, nudity, profanity, horror, gambling, alcohol, tobacco, or drugs: None.
- Mature or suggestive themes: None. The app does not include them.
- Medical or treatment information: None. It refuses medical advice and tells a person in an emergency to call for help.
- Unrestricted web access: No. The shell opens this app’s own site. Links to crisis lines and the legal pages open in Safari.
- Made for kids: No. Not directed to children under 13.
- User-generated content: people type private messages. Those messages are not posted, shared, or shown to anyone else. There is no social feed.
- Recommended rating: 12+.

### App Privacy answers

- Data used to track you: none.
- User content: the words someone types are sent to the server and then to OpenAI to write the reply. They are not stored on the server, and they are not linked to an identity.
- Purchases: Apple processes payment. The server checks a signed transaction and stores the unlock only in a cookie on the device.
- Identifiers, contacts, location, and advertising data: not collected.

## Products

Create these in App Store Connect with these exact product IDs and prices. The app shows the price Apple returns for the person’s storefront, and falls back to these amounts if StoreKit has not answered yet.

Subscription group reference name: `Ask Jesus Unlimited`

| Product ID | Type | Price | What it unlocks | Reference name |
| --- | --- | --- | --- | --- |
| `com.starseedsquad.askjesus.unlimited.today` | Consumable | $0.99 | Messages until midnight UTC on the day it is bought, up to 300 that day | Unlimited today |
| `com.starseedsquad.askjesus.unlimited.monthly` | Auto-renewable subscription, 1 month | $6.99 | Messages until the period ends, up to 300 each UTC day | Monthly |

Display name for the consumable: `Unlimited today`
Consumable description: `Messages until midnight UTC on the day you buy it, up to 300 that day.`

Subscription display name: `Monthly`
Subscription description: `Messages with Ask Jesus AI until you cancel, up to 300 each day.`

Family Sharing should be off.

A day is the same UTC day the free limit uses. Unlimited today bought at 11pm UTC lasts until midnight UTC.

## Server environment

Set these on the host that serves the website (Vercel), not in the iOS binary. The free website keeps working if they are empty. Purchases cannot be confirmed until they are set.

| Variable | Purpose |
| --- | --- |
| `APPLE_IAP_KEY_ID` | Key ID of the In-App Purchase key. This may be a different key from the TestFlight key. |
| `APPLE_IAP_ISSUER_ID` | Issuer ID for that key. It is often the same issuer as the TestFlight key when both keys are on the same team. Set it here anyway. |
| `APPLE_IAP_PRIVATE_KEY` | Contents of that key’s `.p8` file, including the BEGIN and END lines. Escaped newlines (`\n`) are accepted. |
| `APPLE_BUNDLE_ID` | Optional. Defaults to `com.starseedsquad.askjesus`. |
| `APPLE_APP_APPLE_ID` | The app’s numeric Apple ID, from App Information. Required to confirm production transactions. TestFlight uses the sandbox, which does not need it. |
| `APPLE_IAP_ONLINE_CHECKS` | Optional. `true` also checks certificate revocation. The server always confirms the transaction with the App Store Server API. |
| `UNLOCK_COOKIE_SECRET` | A long random string. It signs the cookie that remembers a verified unlock. |
| `UNLIMITED_DAILY_CAP` | Optional. Fair-use cap for a day pass or subscription, per UTC day. Defaults to `300`. |
| `MAX_OUTPUT_TOKENS` | Optional. Maximum tokens generated for one reply. Defaults to `420`. |

The server verifies the StoreKit 2 signed transaction (JWS), then calls the App Store Server API for that transaction. A consumable grants access until the end of its purchase day. A subscription grants access until Apple’s expiry, including a billing grace period. A refunded transaction does not grant access.

## GitHub secrets

The workflow `.github/workflows/ios-testflight.yml` is manual (`workflow_dispatch` only). It was not run. Add these repository secrets, then run it by hand.

| Secret | Required | What to paste |
| --- | --- | --- |
| `ASC_KEY_ID` | Yes | Key ID of an App Store Connect API key with the Admin role. |
| `ASC_ISSUER_ID` | Yes | Issuer ID shown above the keys list. |
| `ASC_PRIVATE_KEY` | Yes | The full `.p8` file for that key, or the same file encoded as base64. |
| `APPLE_TEAM_ID` | Yes | The 10-character Team ID. Automatic signing cannot create a profile without it. |
| `CAPACITOR_SERVER_URL` | No | Site the shell should load. When empty, the app loads `https://ask-jesus-lake.vercel.app`. |

`ASC_PRIVATE_KEY` is for building and uploading. `APPLE_IAP_PRIVATE_KEY` is for verifying purchases on the server. Create both keys. They are not interchangeable in this project, even if you choose to use one App Store Connect key for both jobs.

## Icon

The App Store icon is `store-assets/ask-jesus-ios-1024.png`, copied into the iOS asset catalog. It is the opaque 1024 portrait, without rounded corners.

## What you still do in App Store Connect

1. Join the Apple Developer Program, if the account is not already enrolled.
2. Open Agreements, Tax, and Banking and accept the Paid Applications agreement. Add the bank account and tax forms. In-app purchases do not work until this is active.
3. Users and Access → Integrations → App Store Connect API. Generate an Admin key. Put its key ID, issuer ID, and `.p8` into the GitHub secrets `ASC_KEY_ID`, `ASC_ISSUER_ID`, and `ASC_PRIVATE_KEY`. Put the Team ID into `APPLE_TEAM_ID`.
4. Users and Access → Integrations → In-App Purchase. Generate a separate key. Put it in the server variables `APPLE_IAP_KEY_ID`, `APPLE_IAP_ISSUER_ID`, and `APPLE_IAP_PRIVATE_KEY`. Also set `UNLOCK_COOKIE_SECRET` on the server.
5. Certificates, Identifiers & Profiles → Identifiers. Register an explicit App ID for `com.starseedsquad.askjesus`. In-App Purchase is on by default. Do not add Sign in with Apple.
6. My Apps → New App. Platform iOS, name Ask Jesus AI, language English, bundle ID `com.starseedsquad.askjesus`, SKU `ask-jesus-ai`.
7. Copy the numeric Apple ID from App Information into the server variable `APPLE_APP_APPLE_ID`.
8. Fill App Information with the category, the 12+ age rating from the notes above, and the privacy policy URL `https://ask-jesus-lake.vercel.app/privacy`.
9. App Privacy: answer from the section above.
10. In-App Purchases: create the subscription group `Ask Jesus Unlimited`, then the monthly subscription at $6.99 and the Unlimited today consumable at $0.99, using the product IDs in the table. Add the English display names and descriptions. Turn Family Sharing off. Add a review screenshot of the paywall for each product.
11. Pricing: base country United States, prices in the table.
12. Prepare the version 1.0 page: paste the description, subtitle, keywords, support URL, and marketing URL from this file. Upload iPhone screenshots (6.7-inch is required). Choose the build after TestFlight finishes processing.
13. Deploy this website first, so the shell loads the paywall and the privacy and terms pages.
14. On GitHub, open Actions → iOS TestFlight → Run workflow. Do this only after steps 3 and 6. The workflow archives with automatic signing and uploads to TestFlight. It does not submit for review.
15. In TestFlight, wait for processing, answer export compliance if asked (the app only uses exempt HTTPS encryption), and add an internal tester. Create a Sandbox Apple ID under Users and Access → Sandbox to buy Unlimited today and the monthly subscription.
16. In the version’s Review Notes, tell the reviewer: no account is required; tap Support, or send 10 messages, to open the paywall; Unlimited today is a $0.99 consumable for the rest of that UTC day; the subscription is $6.99 a month; both include a fair-use cap of 300 messages per UTC day; purchases stay inside Apple; a Sandbox account is attached.
17. Select the build and submit for review when the sandbox purchases succeed.

The shell is a WebView of this site plus StoreKit. Apple sometimes rejects a thin website wrapper. The native piece they are reviewing is the purchase flow. If review asks for more native behavior, that is a follow-up, not something this workflow can invent.
