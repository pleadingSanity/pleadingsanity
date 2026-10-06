import type { Config, Context } from "@netlify/edge-functions";

const SAFE =
  '<p class="aa-safe">If you are not safe, a person can sit with you now. <a href="tel:999">999</a> · Samaritans <a href="tel:116123">116 123</a> · Text SHOUT <a href="sms:85258">85258</a> · NHS 111 option 2 <a href="tel:111">111</a> · Childline <a href="tel:08001111">0800 1111</a> · Domestic Abuse <a href="tel:08082000247">0808 2000 247</a>. Arron is not a therapist.</p>';

const LINES = [
  '<a class="line" href="tel:999">999<small>Emergency. Immediate danger.</small></a>',
  '<a class="line" href="tel:116123">116 123<small>Samaritans. Free, day and night.</small></a>',
  '<a class="line" href="sms:85258">85258<small>Text SHOUT. Free, 24 hours.</small></a>',
  '<a class="line" href="tel:111">111<small>NHS 111, then option 2.</small></a>',
  '<a class="line" href="tel:08001111">0800 1111<small>Childline. Under 19.</small></a>',
  '<a class="line" href="tel:08082000247">0808 2000 247<small>National Domestic Abuse Helpline.</small></a>',
].join("\n      ");

const MARK =
  '<img src="/assets/images/brand/crying-brain-logo-512.webp" alt="Arron, the crying-brain mark" width="72" height="72" style="display:block;width:72px;height:72px;border-radius:18px;margin:0 auto 8px;border:1px solid rgba(0,255,240,.35);" />';

export default async (req: Request, context: Context) => {
  const res = await context.next();
  const type = res.headers.get("content-type") || "";
  if (!type.includes("text/html")) return res;
  let html = await res.text();
  if (html.includes("08082000247")) {
    return new Response(html, { status: res.status, headers: res.headers });
  }
  html = html.replace(/<p class="aa-safe">[\s\S]*?<\/p>/, SAFE);
  if (!html.includes("aa-install-banner") || !html.includes("crying-brain-logo-512.webp\" alt=\"Arron, the crying-brain mark\"")) {
    html = html.replace(
      '<div class="aa-notice" id="aa-install-banner" hidden>',
      '<div class="aa-notice" id="aa-install-banner" hidden>\n        ' + MARK,
    );
  }
  if (!html.includes('id="aa-hero-mark"')) {
    html = html.replace(
      '<div class="aa-hero" id="aa-hero">',
      '<div class="aa-hero" id="aa-hero">\n          <img id="aa-hero-mark" src="/assets/images/brand/crying-brain-logo-512.webp" alt="" width="56" height="56" style="width:56px;height:56px;border-radius:16px;border:1px solid rgba(0,255,240,.35);" />',
    );
  }
  html = html.replace(
    '<a class="line" href="/crisis.html">The house truth<small>Why people lose themselves</small></a>',
    LINES + '\n      <a class="line" href="/crisis.html">The house truth<small>Why people lose themselves</small></a>',
  );
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  return new Response(html, { status: res.status, headers });
};

export const config: Config = {
  path: ["/arron-app.html", "/arron-app"],
};
