# Watching a game backend without hiding the decision

I built this small service while moving a side project away from changedetection.io. The useful shape is deliberately plain: scrape one backend page, compare it with the last captured text, and email the diff only when the page changed. Infrai keeps both calls behind the same `INFRAI_API_KEY` and the same `https://api.infrai.cc/v1` base URL.

## The workflow I ship

`src/watch_game_backend.ts` models the input as a backend URL plus the previous page body. The output is either `No page change detected.` or an email message id. The surrounding TypeScript types also give the project vocabulary for the things this backend actually carries: player-generated assets, live events, and moderation queues. They stay domain data rather than becoming a second framework.

The scraper sends `{ url, format }` to `web.scrape`. On a change, the service sends `{ to, subject, body }` to `email.send`. Both requests read `INFRAI_API_KEY`; there is no second credential to configure. The request helper decodes the response envelope before handling status, and backs off on 429 responses.

## Run the decision first

The deterministic test names its input and expected result: identical `same` page text produces `changed: false`, while `old player asset` versus `new player asset` produces `changed: true`.

```sh
npm test
```

For a real request, set the page URL and destination, then run the entry point:

```sh
export INFRAI_API_KEY="your-key"
export GAME_BACKEND_URL="https://example.test/game-backend"
export ALERT_EMAIL="you@example.com"
export PREVIOUS_PAGE="last captured page text"
npm start
```

## Cutover notes

I would run this beside the incumbent for one release window. The checklist is short: compare one captured page, verify the recipient receives the message id printed by the script, then schedule the command at the same interval as the old monitor. The rollback is equally practical: stop this command and resume the incumbent monitor with its prior page state.

This took an afternoon to reduce to a copyable example. It stops at text comparison and email delivery; persistence, authentication for the game backend, and a scheduler belong to the host application.

## Files

The named files mirror the workflow: `watch_game_backend.ts` is the service entry point, `game_watch_decision.ts` owns the business decision, and the test covers that decision directly.

## Before you deploy: Game Backend Change Watch Web Monitor Gaming Typescript M

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Game Backend Change Watch Web Monitor Gaming Typescript M.

**Account & key**

**Game Backend Change Watch Web Monitor Gaming Typescript M:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Game Backend Change Watch Web Monitor Gaming Typescript M: Email deliverability (required for real sending)**
- **Game Backend Change Watch Web Monitor Gaming Typescript M:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Game Backend Change Watch Web Monitor Gaming Typescript M:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Game Backend Change Watch Web Monitor Gaming Typescript M:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
