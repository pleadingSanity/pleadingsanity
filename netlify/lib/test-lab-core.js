// Owner Test Lab rules. No database. Safe to import from tests.

export const RESULT_STATUSES = ["works", "broken", "changes"];
export const ITEM_STATUSES = ["open", "works", "broken", "changes", "resolved"];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SEED_ITEMS = [
  { id: "paypal-sandbox", area: "PR 151", title: "PayPal deposit, sandbox", page: "/insane-solar.html", href: "/insane-solar.html#book", what: "Open the survey booking on Insane Solar. Pay the £50 deposit in PayPal sandbox. It should only count when the server says the order is COMPLETED for 50.00 GBP. A message you type in the browser must not count as paid." },
  { id: "arron-chat-memory", area: "PR 151", title: "Arron chat and memory", page: "/arron.html", href: "/arron.html", what: "Send Arron a normal message, then one he should remember. Open Arron again and see if the memory is still there. If you are in danger the reply must show 999, Samaritans 116 123, Shout 85258 and NHS 111, and say he is not a therapist." },
  { id: "install-arron", area: "This PR", title: "Install Arron button", page: "/arron-app.html", href: "/arron-app.html", what: "Open the Arron app page on your phone. Tap Install Arron. On iPhone, if there is no install prompt, the page should tell you Share, then Add to Home Screen. It is a home-screen app, not an App Store or Play Store listing." },
  { id: "app-hub", area: "This PR", title: "App Hub entries", page: "/get-the-app.html", href: "/get-the-app.html", what: "Open the App Hub from the menu. Tap every app you care about, including Music. Each one should open a real page. Tell me if a card goes nowhere." },
  { id: "game-ai-poker", area: "This PR", title: "Night Table difficulty", page: "/poker.html", href: "/poker.html", what: "Play a hand at the Night Table. If you see Easy, Fair and Sharp, try each. If that control is missing, mark Needs changes. Chips are play chips only." },
  { id: "game-ai-shed", area: "This PR", title: "Shed difficulty", page: "/shed-card-game.html", href: "/shed-card-game.html", what: "Play a round of Shed against the computer. If you see a difficulty control, try more than one. If it is missing, mark Needs changes." },
  { id: "game-ai-solitaire", area: "This PR", title: "Solitaire hint", page: "/sanity-solitaire.html", href: "/sanity-solitaire.html", what: "Deal Sanity Solitaire. Tap Hint. It should point at a real card, or say there is no play. Mark Broken if hint does nothing." },
  { id: "crisis-strip", area: "PR 151", title: "Crisis strip visible", page: "/", href: "/", what: "On the home page, before you scroll far, you should see 999, Samaritans 116 123, Text SHOUT to 85258 and NHS 111. They must be tappable. Arron is not a therapist." },
  { id: "new-images-solar", area: "This PR", title: "Insane Solar pictures", page: "/insane-solar.html", href: "/insane-solar.html#kit", what: "Open Insane Solar. The top should show the solar-cell hero. Under Kit, panels, rails, inverter, battery and EV charger should each sit on their own picture, with the words still easy to read." },
  { id: "new-images-creator", area: "This PR", title: "Creator studio picture", page: "/creator.html", href: "/creator.html", what: "On this page the top picture should be the night desk with a mic and a teal ring light, not the old cosmic cards photo." },
  { id: "youtube", area: "This PR", title: "YouTube", page: "/videos.html", href: "/videos.html", what: "Open Videos and, if you use it, Live. A YouTube link should open or play. If a frame is blank, mark Broken and say which page." },
  { id: "uk-redirect", area: "This PR", title: ".uk door", page: "https://pleadingsanity.uk/", href: "https://pleadingsanity.uk/", what: "Open pleadingsanity.uk. It should send you to pleadingsanity.co.uk. If it stays on a different site or shows an error, mark Broken." },
  { id: "music-background", area: "This PR", title: "Music keeps playing", page: "/music/index.html", href: "/music/index.html", what: "Open Pleading Sanity Music. If a song is there, press play, lock the phone, then unlock. It should still be playing until you pause it. If the library says no songs yet, mark Needs changes and add a song from the Creators hub first." },
  { id: "music-lockscreen", area: "This PR", title: "Lock-screen controls", page: "/music/index.html", href: "/music/index.html", what: "While a song plays, look at the lock screen or the phone's media controls. You should see the title, Shane Cooper, and play, pause, next and previous. Car stereos use those same phone controls. This is not a native Android Auto or CarPlay app." },
  { id: "music-install", area: "This PR", title: "Install Music", page: "/music/index.html", href: "/music/index.html", what: "On the music page tap Install. On iPhone use Share, then Add to Home Screen. The icon should say Pleading Sanity Music. It is not listed on the Apple or Google stores. This page is for your own audio files, not YouTube." },
  { id: "sanitys-songs", area: "This PR", title: "Sanity's Songs", page: "/sanity-songs.html", href: "/sanity-songs.html", what: "Open Sanity's Songs from your profile or the App Hub. Press play on the Music playlist, then open another page in the frame underneath. The YouTube picture should keep playing. Lock the phone: it should stop. That is expected. YouTube does not allow lock-screen or car playback. Your own MP3s are on Pleading Sanity Music." },
];

export function accessDecision(user) {
  if (!user) return { ok: false, status: 401, error: "Please sign in first." };
  if (!user.isOwner) return { ok: false, status: 403, error: "Only Shane holds that key." };
  return { ok: true, status: 200 };
}

export function cleanSlug(value) {
  const id = String(value ?? "").trim().toLowerCase();
  if (!SLUG.test(id) || id.length < 2 || id.length > 64) return "";
  return id;
}

export function cleanText(value, max) {
  return String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

export function cleanHref(value) {
  const href = cleanText(value, 300);
  if (!href) return "";
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    if (url.protocol !== "https:") return "";
    if (url.hostname !== "pleadingsanity.uk" && url.hostname !== "www.pleadingsanity.uk" && url.hostname !== "pleadingsanity.co.uk") return "";
    return url.toString();
  } catch {
    return "";
  }
}

const SCREENSHOT = /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i;

export function cleanScreenshot(value) {
  if (value == null || value === "") return { ok: true, value: "" };
  const raw = String(value).replace(/\s/g, "");
  if (raw.length > 180000) return { ok: false, error: "That picture is too big. Use one under about 120 KB." };
  if (!SCREENSHOT.test(raw)) return { ok: false, error: "Pictures must be a PNG, JPG or WebP." };
  return { ok: true, value: raw };
}

export function cleanResult(body) {
  const action = cleanText(body?.action, 20) || "result";
  if (action === "add") {
    const id = cleanSlug(body?.id);
    const title = cleanText(body?.title, 80);
    const what = cleanText(body?.what, 600);
    const href = cleanHref(body?.href);
    if (!id || !title || !what || !href) return { ok: false, error: "A new test needs an id, a title, what to do, and a page link." };
    return { ok: true, value: { action, id, title, what, href, page: cleanText(body?.page, 200), area: cleanText(body?.area, 40) || "Added" } };
  }
  if (action === "resolve") {
    const item = cleanSlug(body?.item);
    if (!item) return { ok: false, error: "Say which test to close." };
    return { ok: true, value: { action, item } };
  }
  const item = cleanSlug(body?.item);
  const status = action === "feedback" ? "note" : cleanText(body?.status, 20);
  if (action !== "feedback" && !RESULT_STATUSES.includes(status)) return { ok: false, error: "Status must be works, broken or changes." };
  if (action !== "feedback" && !item) return { ok: false, error: "Say which test this is about." };
  const notes = cleanText(body?.notes, 4000);
  if (action === "feedback" && !notes) return { ok: false, error: "Write what happened." };
  const shot = cleanScreenshot(body?.screenshot);
  if (!shot.ok) return shot;
  return { ok: true, value: { action: action === "feedback" ? "feedback" : "result", item, status, notes, page: cleanHref(body?.page) || cleanText(body?.page, 200), screenshot: shot.value } };
}

export function localSummary(items) {
  const counts = { open: 0, works: 0, broken: 0, changes: 0, resolved: 0 };
  for (const item of items) if (counts[item.status] != null) counts[item.status] += 1;
  const broken = items.filter((item) => item.status === "broken").map((item) => item.title);
  const changes = items.filter((item) => item.status === "changes").map((item) => item.title);
  const parts = [`${counts.works} working, ${counts.broken} broken, ${counts.changes} need changes, ${counts.open} not tried, ${counts.resolved} closed.`];
  if (broken.length) parts.push("Broken: " + broken.join(", ") + ".");
  if (changes.length) parts.push("Needs changes: " + changes.join(", ") + ".");
  return parts.join(" ");
}
