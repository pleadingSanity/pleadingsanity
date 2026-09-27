# Domain Recovery Guide: pleadingsanity.co.uk & pleadingsanity.uk

_Checked against the live Nominet registry (RDAP) on 27 September 2026._

---

## ⚠️ Read this first: both domains have expired, and the deadlines are days away

Both domains aren't just suspended. They **expired**, and Nominet (the .uk registry) suspended them because
they weren't renewed. The two domains are at different stages:

| Domain | Expired | Registry status now | What it means | Hard deadline |
|---|---|---|---|---|
| **pleadingsanity.uk** | 4 Jul 2026, 23:51 UTC | `server hold`, `redemption period` | **Can still be renewed.** Nobody else can take it yet. | Renew **before 00:51 BST on Sat 3 Oct 2026** (the end of day 90). Aim for **Wed 30 Sep** at the latest. |
| **pleadingsanity.co.uk** | 25 Jun 2026, 22:25 UTC | `pending delete`, `server renew prohibited`, `server transfer prohibited` | **Can no longer be renewed or transferred.** The 90-day renewal window closed on 23 Sep. Nominet locks it for 5 days, then deletes it. | It becomes **free for anyone to register at 23:25 BST on Mon 28 Sep 2026** (95 days after expiry). |

How the Nominet timeline works (for any .uk domain):

- **Days 0–30 after expiry:** the site still works and renewing is normal.
- **Days 30–90:** the domain is suspended, so the site and email go dark. The owner can still renew at the normal price.
- **Days 90–95:** locked. Nobody can renew it, not even Nominet.
- **Day 95:** it's deleted and anyone can register it.

**So the plan is:**

1. **Save `pleadingsanity.uk` now** by renewing it (Part A).
2. **Re-register `pleadingsanity.co.uk` the moment it drops** on Monday night (Part B).
3. **Then move both to your new registrar and point them at Netlify** (Parts C and D).

> You can check the live status any time. Open these in a browser and look at `"status"` and `"events"`:
> - https://rdap.nominet.uk/uk/domain/pleadingsanity.uk
> - https://rdap.nominet.uk/uk/domain/pleadingsanity.co.uk

---

## 🚨 One important correction about Cloudflare + Netlify DNS

**Cloudflare Registrar requires Cloudflare's own nameservers.** A domain registered at Cloudflare can't point its
nameservers at Netlify DNS (`dns1–4.p03.nsone.net`). Cloudflare also only accepts a transfer once the domain is
already **active on Cloudflare DNS**, and a suspended domain can't become active. That means neither domain can
move to Cloudflare until it has been renewed.

Pick one of these two setups. Both keep the site fully live on Netlify:

- **Option 1: Cloudflare as registrar AND DNS** (tag `CLOUDFLARE`). In Cloudflare DNS, add records pointing at Netlify
  (see Part D, Option 1). Your registration is sold at cost, with no mark-up.
- **Option 2: a registrar that lets you set custom nameservers** (for example, most UK registrars that are Nominet members).
  Point the nameservers at Netlify DNS `dns1.p03.nsone.net` … `dns4.p03.nsone.net`, as you planned (see Part D, Option 2).
  Ask the new registrar for its **IPS tag**; every registrar publishes one.

`pleadingsanity.co.uk` already uses Netlify DNS nameservers, so Option 2 changes the least. Either option works.

---

## PART A: Save pleadingsanity.uk (do this first, today or tomorrow)

The domain is still registered through **Fasthosts** (Nominet tag `LIVEDOMAINS`). You have three routes. Use
whichever works first, and try Route 1 and Route 2 at the same time.

### Route 1: Get back into Fasthosts and renew (fastest if it works)

1. Go to https://www.fasthosts.co.uk and choose **Log in → Forgotten your password / username?**
2. If the reset email doesn't arrive (check spam), **phone Fasthosts support**. Their number is on
   https://www.fasthosts.co.uk/contact. Have ready:
   - the domain names
   - your full name and postal address as registered
   - the email address you signed up with
   - the last 4 digits of the card you paid with, if you have it
3. Once you're in, go to **Domains → pleadingsanity.uk → Renew** and pay for 1 year or more.
4. Ask them to renew **pleadingsanity.co.uk** as well. They'll say it can't be renewed, which is expected (see Part B).
5. While you're talking to them, you can also ask them to **change the IPS tag** (see Part C). Only do this after
   the renewal has gone through.

### Route 2: Go direct to Nominet (if Fasthosts can't help)

As the registrant (the owner), you can manage a .uk domain directly with Nominet, without Fasthosts.

1. **Contact Nominet domain support.** Say you're the registrant of an expired domain that is still in its renewal
   window, and that your registrar has locked you out:
   - **Email:** domainsupport@nominet.uk
   - **Phone:** +44 (0)330 236 9470 (Mon–Fri, 8am–6pm UK time)
   - **Live chat:** on https://nominet.uk/contact-us/
   - General line if needed: nominet@nominet.uk · +44 (0)330 236 9475
2. **Log in to Nominet Online Services** at https://secure.nominet.org.uk/auth/login.html
   using the **email address on the domain registration**, and use "forgotten password" if you need to.
   - If you no longer have access to that email, use the **"Re-establish identity"** form inside Online Services.
     It costs **£10 + VAT**, and they'll ask for ID to prove who you are.
3. In Online Services you can:
   - **Change Registrar:** tick the domain, click **Change Registrar**, and enter the new registrar's IPS tag.
     This costs **£10 + VAT** per transaction, even if you move several domains at once. The new registrar must
     accept within 5 days, so tell them it's coming. The new registrar then renews it for you.
   - **Or renew directly with Nominet.** This costs more (about £80 + VAT), but it's a guaranteed rescue if the
     clock is nearly out.

> Nominet is changing its direct-registrant services on **9 February 2027**. That doesn't affect this rescue, but
> it's another reason to get everything moved to a new registrar now.

### Route 3: Ask the new registrar to help

Some UK registrars will rescue an expired domain for you once the tag is changed to them in Route 2. Ask them
before you start: *"If I move an expired, suspended .uk domain to your tag, can you renew it immediately?"*

**✅ Done when:** the RDAP link for pleadingsanity.uk no longer shows `server hold` or `redemption period`, and the
expiry date has moved forward by a year.

---

## PART B: Re-register pleadingsanity.co.uk when it drops (Monday 28 Sept, 23:25 BST)

The `.co.uk` can't be saved. It **will** be deleted, and then it's first come, first served. For a small brand
domain there's a very good chance nobody else is waiting for it, but be ready:

1. **Before Monday evening,** create an account at the registrar you chose (Cloudflare, or your Option 2 registrar),
   with payment details saved.
2. **From 23:25 BST on Monday 28 Sept,** search for `pleadingsanity.co.uk` and register it the moment it shows as
   available. Refresh every minute or two. Nominet may release it within a few minutes of that time.
3. For extra safety, some UK registrars offer a **"backorder" / drop-catch** service that tries to register the
   domain automatically at the drop time. It's worth a few pounds for peace of mind.
4. When you register it, set the nameservers (or DNS records) straight away, as in Part D.
5. **Register for 2–3 years and turn on auto-renew,** so this never happens again.

> If someone else grabs it, don't panic. The site keeps running on `pleadingsanity.uk` and the Netlify address.
> If a squatter takes your brand name, Nominet's free Dispute Resolution Service is at https://nominet.uk/domain-support/.

---

## PART C: Move pleadingsanity.uk to your new registrar

**.uk domains don't use transfer/auth codes.** The domain moves when its **IPS tag** changes to the new
registrar's tag. You can move it straight away; the 60-day transfer lock that applies to .com domains doesn't
apply to .uk.

### If moving to Cloudflare (tag `CLOUDFLARE`), the order matters

Cloudflare **rejects** the transfer if the tag changes before you've checked out, or if the domain isn't active on
Cloudflare DNS yet.

1. Make sure the domain has been **renewed** (Part A). A suspended domain can't be moved to Cloudflare.
2. In Cloudflare, go to **Add a site → pleadingsanity.uk → Free plan**. Cloudflare shows you two nameservers.
3. At Fasthosts (or through Nominet Online Services), **change the nameservers to the two Cloudflare ones**.
4. Wait until Cloudflare shows the site as **Active**. This usually takes minutes, but can take up to 24 hours.
5. In Cloudflare, go to **Domain Registration → Transfer Domains**, select pleadingsanity.uk, and check out. A .uk
   transfer is free, and no extra year is added.
6. **Only now,** change the IPS tag to **`CLOUDFLARE`**, either through Fasthosts or through Nominet Online Services
   (**Change Registrar**, £10 + VAT).
7. Cloudflare finishes the transfer automatically once it sees the tag change. If nothing happens within 24 hours,
   request the tag change again. Cloudflare cancels unfinished transfers after 30 days.
8. Add the Netlify records from Part D, Option 1.

### If moving to an Option 2 registrar

1. Start the transfer at the new registrar and note its **IPS tag**.
2. Change the tag through Fasthosts or through Nominet Online Services (**Change Registrar**).
3. Accept the transfer at the new registrar within 5 days.
4. Set the nameservers to Netlify DNS (Part D, Option 2).

---

## PART D: Point both domains at Netlify

**First,** in the Netlify dashboard go to **Site configuration → Domain management** and check that both
`pleadingsanity.co.uk` and `pleadingsanity.uk` are listed as domains for this site. Add them back if they're missing.

### Option 1: DNS at Cloudflare (required if Cloudflare is the registrar)

Add these records in Cloudflare DNS for **each** domain:

| Type | Name | Value | Proxy status |
|---|---|---|---|
| A | `@` | `75.2.60.5` | **DNS only** (grey cloud) |
| CNAME | `www` | `pleadingsanity.netlify.app` | **DNS only** (grey cloud) |

Keep the proxy **off** (grey cloud) so Netlify can issue the free HTTPS certificate. Then go to
**Netlify → Domain management → HTTPS → Verify DNS configuration**.

### Option 2: Netlify DNS (registrar lets you set custom nameservers)

Set the nameservers at the registrar to:

```
dns1.p03.nsone.net
dns2.p03.nsone.net
dns3.p03.nsone.net
dns4.p03.nsone.net
```

Netlify then manages every record for you. Make sure a Netlify DNS zone exists for the domain in
**Netlify → Domains**. Before it expired, `pleadingsanity.uk` pointed at **Vercel** (`ns1/ns2.vercel-dns.com`),
so it needs switching over.

**✅ Done when:** https://pleadingsanity.co.uk loads the site with a padlock, and https://pleadingsanity.uk
redirects to it. That redirect is already set in `_redirects`.

---

## 📧 Email templates

### 1. To Nominet (domain support)

> **To:** domainsupport@nominet.uk
> **Subject:** Registrant locked out of registrar: urgent renewal of pleadingsanity.uk (expired 4 July 2026)
>
> Hello Nominet Support,
>
> I am the registrant of **pleadingsanity.uk** and **pleadingsanity.co.uk**. Both are currently tagged to
> Fasthosts Internet Ltd (LIVEDOMAINS).
>
> pleadingsanity.uk expired on 4 July 2026 and is suspended, but it is still within the 90-day renewal window,
> which ends on 2 October 2026. I have been unable to access my Fasthosts account to renew it.
>
> Please could you help me to either:
> 1. access Nominet Online Services so I can change the registrar (IPS tag) to **[NEW REGISTRAR TAG, e.g. CLOUDFLARE]**
>    and have the domain renewed; or
> 2. renew the domain directly with Nominet.
>
> If I need to re-establish my identity because I can no longer access the registered email address, please
> tell me what you need from me. I can provide photo ID and proof of address straight away.
>
> I understand pleadingsanity.co.uk is now past its renewal window and will be released on 28 September.
> Please confirm if there is anything at all that can be done for it.
>
> Registrant name: **Shane Cooper**
> Postal address as registered: **[YOUR ADDRESS]**
> Contact phone: **[YOUR PHONE]**
> Contact email: **[YOUR EMAIL]**
>
> Thank you. This domain is the home of a mental health support community, so getting it back online matters a lot.
>
> Kind regards,
> Shane Cooper

### 2. To Fasthosts (account recovery, renewal and tag change)

> **Subject:** Account access lost: please renew pleadingsanity.uk and change IPS tag
>
> Hello Fasthosts Support,
>
> I can't log in to my Fasthosts account and the password reset isn't working. The account holds
> **pleadingsanity.uk** and **pleadingsanity.co.uk**.
>
> **pleadingsanity.uk** expired on 4 July 2026 and must be renewed before 2 October 2026 or it will be lost.
> Please could you:
> 1. restore my access, or verify me by phone so you can take payment and **renew pleadingsanity.uk** for at least 1 year; then
> 2. change the Nominet IPS tag for pleadingsanity.uk to **[NEW REGISTRAR TAG]**, **only once the renewal is complete**.
>
> Account details: name **Shane Cooper**, email **[SIGN-UP EMAIL]**, postcode **[POSTCODE]**, last 4 digits of card **[XXXX]**.
>
> Many thanks,
> Shane Cooper

---

## 📇 Contacts at a glance

| Who | For what | How |
|---|---|---|
| **Nominet: domain owner support** | Online Services, identity, change registrar, direct renewal | domainsupport@nominet.uk · +44 (0)330 236 9470 · live chat at nominet.uk/contact-us (Mon–Fri 8–6) |
| **Nominet: general** | Anything else | nominet@nominet.uk · +44 (0)330 236 9475 |
| **Nominet Online Services** | Log in as registrant | https://secure.nominet.org.uk/auth/login.html |
| **Nominet RDAP lookup** | Live domain status | https://rdap.nominet.uk/uk/domain/pleadingsanity.uk |
| **Fasthosts** | Current registrar (tag LIVEDOMAINS) | https://www.fasthosts.co.uk/contact |
| **Cloudflare Registrar** | New registrar (tag CLOUDFLARE) | https://dash.cloudflare.com · guide: https://developers.cloudflare.com/registrar/top-level-domains/uk-domains/ |
| **Netlify** | Hosting & DNS | https://app.netlify.com → pleadingsanity → Domain management |

---

## ✅ Checklist

- [ ] **Today or tomorrow:** reset the Fasthosts login, or phone them (Part A, Route 1)
- [ ] **Today or tomorrow:** email and phone Nominet using the template (Part A, Route 2)
- [ ] **By Wed 30 Sep:** pleadingsanity.uk renewed. Check on RDAP.
- [ ] **Before Mon 28 Sep evening:** account ready at the new registrar, payment saved
- [ ] **Mon 28 Sep from 23:25 BST:** register pleadingsanity.co.uk for 2–3 years, with auto-renew on
- [ ] Point pleadingsanity.co.uk at Netlify (Part D)
- [ ] Move pleadingsanity.uk to the new registrar (Part C), then point it at Netlify (Part D)
- [ ] Netlify → Domain management: both domains listed, HTTPS certificate issued
- [ ] Turn on **auto-renew** for both domains and keep the registrar's contact email one you check

_Evolution, Not Erasure. The domain lapsing isn't the end of the story._
