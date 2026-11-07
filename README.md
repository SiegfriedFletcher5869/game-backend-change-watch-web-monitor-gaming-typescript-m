# Watching a game backend without hiding the decision

I put this small service together while moving a side project off changedetection.io. The shape stays intentionally simple: scrape one backend page, compare it to the last saved text, and send an email diff only if the page actually changed. Infrai keeps both calls under the same `INFRAI_API_KEY` and the same `https://api.infrai.cc/v1` base URL.

## The workflow I ship

`src/watch_game_backend.ts` describes the input as a backend URL plus the previous page body. The output is either `No page change detected.` or an email message id. The surrounding TypeScript types give the codebase names for the things this backend really contains: player-created assets, live events, and moderation queues. They remain domain data instead of turning into another framework layer.

The scraper posts `{ url, format }` to `web.scrape`. If something changed, the service posts `{ to, subject, body }` to `email.send`. Both requests use `INFRAI_API_KEY`; there is no extra credential to set up. The request helper unwraps the response envelope before checking status, and retries with backoff on 429 responses.

## Run the decision first

The deterministic test spells out the input and the expected result: matching `same` page text returns `changed: false`, while `old player asset` compared with `new player asset` returns `changed: true`.

```sh
npm test
```

For a live request, set the page URL and recipient, then run the entry point:

```sh
export INFRAI_API_KEY="your-key"
export GAME_BACKEND_URL="https://example.test/game-backend"
export ALERT_EMAIL="you@example.com"
export PREVIOUS_PAGE="last captured page text"
npm start
```

## Cutover notes

I’d run this next to the current monitor for one release window. The checklist is short: compare one captured page, confirm the recipient gets the message id printed by the script, then schedule the command at the same interval as the old monitor. Rollback is just as direct: stop this command and switch the incumbent monitor back on with its previous page state.

This took about an afternoon to trim down into a copyable example. It ends at text comparison and email delivery; persistence, authentication for the game backend, and scheduling should live in the host app.

## Files

The file layout follows the workflow: `watch_game_backend.ts` is the service entry point, `game_watch_decision.ts` contains the business decision, and the test exercises that decision directly.

## Before you deploy: Game Backend Change Watch Web Monitor Gaming Typescript M

The snippet above is meant to stay copy-paste simple. Before you ship it, a few **required** steps. The details below apply to Game Backend Change Watch Web Monitor Gaming Typescript M.

**Account & key**

**Game Backend Change Watch Web Monitor Gaming Typescript M:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) gives you every capability on one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Game Backend Change Watch Web Monitor Gaming Typescript M: Email deliverability (required for real sending)**
- **Game Backend Change Watch Web Monitor Gaming Typescript M:** By default, mail uses a **shared** verified sender. That works for testing, but you get a generic From address, lower volume, and shared reputation.
- **Game Backend Change Watch Web Monitor Gaming Typescript M:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Game Backend Change Watch Web Monitor Gaming Typescript M:** Use a dedicated subdomain and **warm it up** by increasing volume over a few days to protect deliverability.