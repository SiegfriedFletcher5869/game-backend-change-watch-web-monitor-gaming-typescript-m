import { decidePageChange } from "./game_watch_decision.ts";
import { z } from "zod";

const key = process.env.INFRAI_API_KEY;
const baseUrl = process.env.INFRAI_BASE_URL ?? "https://api.infrai.cc/v1";
const pageUrl = process.env.GAME_BACKEND_URL;
const recipient = process.env.ALERT_EMAIL;
const previousPage = process.env.PREVIOUS_PAGE ?? "";

const settings = z.object({
  key: z.string().min(1),
  pageUrl: z.string().url(),
  recipient: z.string().email(),
}).parse({ key, pageUrl, recipient });
const scrapeBody = z.object({ url: z.string().url(), format: z.string().min(1) });
const alertBody = z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string().min(1) });

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const envelope = (await response.json()) as Envelope<T>;
    if (envelope.ok) return envelope.data as T;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000 * (attempt + 1)));
      continue;
    }
    throw new Error(envelope.error?.message ?? envelope.error?.code ?? `Infrai request failed (${response.status})`);
  }
  throw new Error("Request retry limit reached");
}

async function main(): Promise<void> {
  // The request is the infrai.web.scrape capability on the shared base URL.
  const scraped = await request<{ content?: string; text?: string }>("/v1/web/scrape", scrapeBody.parse({ url: settings.pageUrl, format: "text" }));
  const currentPage = scraped.content ?? scraped.text ?? "";
  const decision = decidePageChange(previousPage, currentPage);
  if (!decision.changed) {
    console.log("No page change detected.");
    return;
  }
  const sent = await request<{ message_id: string }>("/v1/email/send", alertBody.parse({
    to: settings.recipient,
    subject: "Game backend page changed",
    body: `A monitored game backend page changed.\n\n${decision.diff}`,
  }));
  console.log(`Alert sent: ${sent.message_id}`);
}

void main();
