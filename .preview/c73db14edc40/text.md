<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Insane Solar — Solar fitted by blokes who climb roofs, not salesmen</title>
<meta name="description" content="Insane Solar. No middleman, no salesman commission. MCS-registered installs across Leicestershire & the Midlands. 0% VAT to 31 Mar 2027 (eligibility). £50 refundable survey deposit.">
<link rel="canonical" href="https://pleadingsanity.co.uk/insane-solar.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800;900&family=Archivo+Black&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0b0f19;
  --bg2:#0f1623;
  --teal:#00fff0;
  --sky:#38bdf8;
  --amber:#f59e0b;
  --amber2:#fbbf24;
  --green:#22c55e;
  --green2:#4ade80;
  --red:#f87171;
  --text:#e2e8f0;
  --heading:#f8fafc;
  --muted:#94a3b8;
  --glass:rgba(255,255,255,.05);
  --glass2:rgba(255,255,255,.07);
  --border:rgba(255,255,255,.1);
  --border2:rgba(255,255,255,.16);
  --panel:#111a2b;
  --panel2:#162033;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
html,body{max-width:100%;overflow-x:hidden}
body{
  background:var(--bg);
  color:var(--text);
  font-family:'Archivo',system-ui,-apple-system,sans-serif;
  line-height:1.6;
  font-size:16px;
  -webkit-font-smoothing:antialiased;
  position:relative;
}
body::before{
  content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;
  background:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(0,255,240,.08), transparent 60%),
    radial-gradient(ellipse 60% 40% at 90% 10%, rgba(56,189,248,.07), transparent 60%),
    radial-gradient(ellipse 70% 50% at 50% 110%, rgba(245,158,11,.06), transparent 60%);
}
body::after{
  content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.35;
  background-image:linear-gradient(rgba(148,163,184,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.05) 1px,transparent 1px);
  background-size:48px 48px;
  mask-image:radial-gradient(ellipse 80% 70% at 50% 30%,black 30%,transparent 80%);
  -webkit-mask-image:radial-gradient(ellipse 80% 70% at 50% 30%,black 30%,transparent 80%);
}
h1,h2,h3,h4{font-family:'Archivo Black','Archivo',sans-serif;color:var(--heading);line-height:1.08;letter-spacing:-.01em}
.display{font-family:'Archivo Black','Archivo',sans-serif}
a{color:var(--teal);text-decoration:none}
img{max-width:100%;display:block}
section{padding:72px 20px;position:relative}
.wrap{max-width:1180px;margin:0 auto}
.eyebrow{display:inline-block;font-weight:800;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--teal);background:rgba(0,255,240,.08);border:1px solid rgba(0,255,240,.25);padding:.35rem .8rem;border-radius:999px;margin-bottom:1.1rem}
.eyebrow.amber{color:var(--amber);background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3)}
.lead{font-size:1.12rem;color:var(--muted);line-height:1.65;max-width:640px}
.grad-text{background:linear-gradient(120deg,var(--teal),var(--sky) 55%,var(--amber));-webkit-background-clip:text;background-clip:text;color:transparent}

/* ---------- NAV ---------- */
#topnav{
  position:sticky;top:0;z-index:50;
  background:rgba(11,15,25,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border-bottom:1px solid var(--border);
}
.nav-inner{max-width:1180px;margin:0 auto;display:flex;align-items:center;gap:.6rem;padding:.55rem 16px}
.brand{font-family:'Archivo Black',sans-serif;font-size:1.05rem;color:var(--heading);white-space:nowrap;letter-spacing:-.01em;flex-shrink:0;display:flex;align-items:center;gap:.5rem;min-height:44px}
.brand .dot{width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--sky));box-shadow:0 0 12px var(--teal);flex-shrink:0}
.brand small{display:block;font-family:'Archivo',sans-serif;font-size:.6rem;font-weight:700;color:var(--muted);letter-spacing:.1em;text-transform:normal}
.nav-links{display:flex;gap:.1rem;overflow-x:auto;flex:1;scrollbar-width:none;-webkit-overflow-scrolling:touch;min-width:0}
.nav-links::-webkit-scrollbar{display:none}
.navlink{
  flex-shrink:0;white-space:nowrap;color:var(--muted);font-weight:700;font-size:.85rem;
  padding:10px 13px;border-radius:8px;min-height:44px;display:inline-flex;align-items:center;
  transition:color .15s,background .15s;
}
.navlink:hover{color:var(--heading);background:var(--glass)}
.navlink.cta{color:#0b0f19;background:linear-gradient(135deg,var(--teal),var(--sky));font-weight:900;margin-left:auto}
.navlink.cta:hover{filter:brightness(1.08);color:#0b0f19}

/* ---------- BUTTONS ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.55rem;font-weight:900;border-radius:12px;padding:1rem 1.6rem;font-size:1rem;min-height:52px;cursor:pointer;border:none;transition:transform .15s,box-shadow .15s,filter .15s;text-decoration:none;font-family:inherit}
.btn:active{transform:scale(.97)}
.btn-primary{background:linear-gradient(135deg,var(--teal),var(--sky));color:#0b0f19;box-shadow:0 10px 30px -8px rgba(0,255,240,.5)}
.btn-primary:hover{filter:brightness(1.07);transform:translateY(-2px)}
.btn-amber{background:linear-gradient(135deg,var(--amber2),var(--amber));color:#1a1206;box-shadow:0 10px 30px -8px rgba(245,158,11,.55)}
.btn-amber:hover{filter:brightness(1.06);transform:translateY(-2px)}
.btn-ghost{background:var(--glass);color:var(--heading);border:1px solid var(--border2)}
.btn-ghost:hover{background:var(--glass2);border-color:rgba(0,255,240,.4)}
.btn svg{flex-shrink:0}

/* ---------- CHIPS ---------- */
.chips{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:1.6rem}
.chip{display:inline-flex;align-items:center;gap:.45rem;font-size:.8rem;font-weight:700;color:var(--text);background:var(--glass);border:1px solid var(--border);padding:.5rem .85rem;border-radius:999px}
.chip .dot{width:8px;height:8px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px var(--teal);flex-shrink:0}
.chip.amber .dot{background:var(--amber);box-shadow:0 0 8px var(--amber)}
.chip.green .dot{background:var(--green);box-shadow:0 0 8px var(--green)}

/* ---------- GLASS CARDS ---------- */
.glass{
  background:var(--glass);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  border:1px solid var(--border);border-radius:18px;
  transition:transform .25s,border-color .25s,box-shadow .25s;
}
.glass:hover{transform:translateY(-3px);border-color:rgba(0,255,240,.35);box-shadow:0 18px 40px -18px rgba(0,255,240,.25)}
.glass.amber-glow:hover{border-color:rgba(245,158,11,.45);box-shadow:0 18px 40px -18px rgba(245,158,11,.3)}

/* ---------- HERO ---------- */
#hero{padding-top:72px;padding-bottom:80px}
.hero-grid{display:grid;gap:2.2rem;align-items:center}
.hero h1{font-size:clamp(2.1rem,6.5vw,4.2rem);margin-bottom:1.2rem}
.hero .sub{font-size:1.18rem;color:var(--muted);max-width:560px;margin-bottom:1.8rem;line-height:1.6}
.hero-ctas{display:flex;flex-wrap:wrap;gap:.8rem;margin-bottom:1rem}
.urgent-line{
  display:inline-flex;align-items:center;gap:.6rem;margin-top:1.2rem;
  background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.4);color:var(--amber2);
  font-weight:800;font-size:.95rem;padding:.7rem 1.1rem;border-radius:12px;flex-wrap:wrap;
}
.urgent-line a{color:var(--amber2);font-weight:900;text-decoration:underline;text-underline-offset:3px}
.hero-stat{display:flex;gap:1.4rem;flex-wrap:wrap;margin-top:2rem}
.hero-stat div strong{display:block;font-family:'Archivo Black',sans-serif;font-size:1.7rem;color:var(--teal)}
.hero-stat div span{font-size:.78rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.hero-visual{position:relative;min-height:280px;display:flex;align-items:center;justify-content:center}
.orbit{position:relative;width:260px;height:260px}
.orbit .sun{position:absolute;inset:25%;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--amber2),var(--amber) 55%,#b45309);box-shadow:0 0 60px rgba(245,158,11,.5);animation:pulse 5s ease-in-out infinite}
.orbit .ring{position:absolute;inset:0;border:1px dashed rgba(0,255,240,.3);border-radius:50%;animation:spin 30s linear infinite}
.orbit .ring2{position:absolute;inset:12%;border:1px dashed rgba(56,189,248,.25);border-radius:50%;animation:spin 22s linear infinite reverse}
.orbit .panel{position:absolute;width:52px;height:34px;background:linear-gradient(135deg,#1e3a5f,#0ea5e9);border:1px solid var(--sky);border-radius:4px;box-shadow:0 0 16px rgba(56,189,248,.5)}
.orbit .p1{top:-6px;left:50%;transform:translateX(-50%)}
.orbit .p2{bottom:10%;right:-8px;transform:rotate(20deg)}
.orbit .p3{bottom:-4px;left:18%;transform:rotate(-15deg)}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes spin{to{transform:rotate(360deg)}}

/* ---------- PRICING ---------- */
.price-lead{background:linear-gradient(135deg,rgba(248,113,113,.12),rgba(245,158,11,.08));border:1px solid rgba(248,113,11,.35);border-radius:18px;padding:1.6rem;margin-bottom:2rem}
.price-lead .big{font-family:'Archivo Black',sans-serif;font-size:clamp(1.5rem,4vw,2.4rem);color:#fca5a5;margin-bottom:.5rem;line-height:1.15}
.price-lead p{color:var(--muted);font-size:1rem}
.price-win{background:linear-gradient(135deg,rgba(0,255,240,.1),rgba(56,189,248,.06));border:1px solid rgba(0,255,240,.35);border-radius:18px;padding:1.6rem;margin-bottom:2.4rem}
.price-win .big{font-family:'Archivo Black',sans-serif;font-size:clamp(1.6rem,4.5vw,2.6rem);color:var(--teal);margin-bottom:.5rem;line-height:1.15}
.table-wrap{overflow-x:auto;border-radius:16px;border:1px solid var(--border);-webkit-overflow-scrolling:touch}
table{width:100%;border-collapse:collapse;min-width:520px}
th,td{padding:.9rem 1rem;text-align:left;font-size:.9rem;border-bottom:1px solid var(--border)}
th{background:var(--panel2);color:var(--heading);font-weight:800;font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;position:sticky;top:0}
tr:last-child td{border-bottom:none}
td.you{color:var(--teal);font-weight:900}
td.bigco{color:#fca5a5;font-weight:700}
.note{font-size:.78rem;color:var(--muted);margin-top:1rem;line-height:1.55}

/* ---------- KIT GRID ---------- */
.kit-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem;margin-top:2rem}
.kit-card{padding:1.3rem;display:flex;flex-direction:column;gap:.6rem}
.kit-icon{width:44px;height:44px;border-radius:12px;background:rgba(0,255,240,.1);border:1px solid rgba(0,255,240,.3);display:flex;align-items:center;justify-content:center;color:var(--teal);flex-shrink:0}
.kit-card h3{font-size:1.02rem;font-family:'Archivo',sans-serif;font-weight:900}
.kit-card .brand-tag{font-size:.72rem;font-weight:800;color:var(--amber);text-transform:uppercase;letter-spacing:.08em}
.kit-card p{font-size:.85rem;color:var(--muted);line-height:1.55;flex:1}
.kit-card .price{font-weight:900;color:var(--heading);font-size:.9rem}
.kit-card .price small{color:var(--muted);font-weight:600;display:block;font-size:.7rem}
.kit-card a.more{font-size:.8rem;font-weight:800;color:var(--sky);display:inline-flex;align-items:center;gap:.3rem}

/* ---------- COMPLIANCE CARDS ---------- */
.comp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:2rem}
.comp-card{padding:1.2rem}
.comp-card .ico{width:38px;height:38px;border-radius:10px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);display:flex;align-items:center;justify-content:center;color:var(--amber);margin-bottom:.7rem}
.comp-card h4{font-size:.95rem;margin-bottom:.4rem;font-family:'Archivo',sans-serif;font-weight:900}
.comp-card p{font-size:.82rem;color:var(--muted);line-height:1.55}
.compliance-line{margin-top:1.8rem;padding:1.1rem 1.3rem;border-left:3px solid var(--amber);background:rgba(245,158,11,.07);border-radius:0 12px 12px 0;font-weight:700;font-size:.92rem;color:var(--amber2)}

/* ---------- GALLERY ---------- */
#galleryGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem;margin-top:1.8rem}
@media(min-width:640px){#galleryGrid{grid-template-columns:repeat(3,1fr);gap:.8rem}}
@media(min-width:1024px){#galleryGrid{grid-template-columns:repeat(5,1fr)}}
#galleryGrid button{position:relative;overflow:hidden;border-radius:12px;border:none;padding:0;cursor:pointer;background:var(--panel2);aspect-ratio:1/1;display:block;width:100%}
#galleryGrid img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
#galleryGrid button:hover img{transform:scale(1.07)}
.gallery-cap{color:var(--muted);font-size:.95rem;margin-top:.4rem;font-style:italic}

/* ---------- LIGHTBOX ---------- */
#lightbox{position:fixed;inset:0;z-index:200;background:rgba(5,8,14,.95);display:none;align-items:center;justify-content:center;padding:20px;touch-action:pan-y}
#lightbox.show{display:flex}
#lbImg{max-width:100%;max-height:78vh;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.lb-nav{position:absolute;top:50%;transform:translateY(-50%);width:52px;height:52px;border-radius:50%;border:1px solid var(--border2);background:rgba(255,255,255,.08);color:var(--heading);cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);z-index:2}
.lb-nav:hover{background:rgba(0,255,240,.2);border-color:var(--teal)}
#lbPrev{left:14px}#lbNext{right:14px}
#lbClose{position:absolute;top:16px;right:16px;width:52px;height:52px;border-radius:50%;border:1px solid var(--border2);background:rgba(255,255,255,.08);color:var(--heading);cursor:pointer;font-size:1.4rem;font-weight:900;display:flex;align-items:center;justify-content:center;z-index:2}
#lbClose:hover{background:rgba(248,113,113,.25);border-color:var(--red)}
.lb-foot{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);color:var(--muted);font-size:.85rem;text-align:center;max-width:90vw;background:rgba(0,0,0,.5);padding:.5rem 1rem;border-radius:10px}
#lbCounter{color:var(--teal);font-weight:900;margin-right:.5rem}

/* ---------- TARIFFS ---------- */
.tariff-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;margin-top:1.8rem}
.tariff-card{padding:1.3rem}
.tariff-card h3{font-size:1.05rem;margin-bottom:.5rem;display:flex;align-items:center;gap:.5rem}
.tariff-card .rate{font-family:'Archivo Black',sans-serif;font-size:1.4rem;color:var(--teal);margin:.4rem 0}
.tariff-card p{font-size:.85rem;color:var(--muted);line-height:1.55;margin-bottom:.8rem}
.tariff-card a{font-size:.82rem;font-weight:800;color:var(--sky)}

/* ---------- ACCORDION ---------- */
.acc-item{border:1px solid var(--border);border-radius:12px;margin-bottom:.6rem;overflow:hidden;background:var(--glass)}
.acc-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.1rem;text-align:left;font-weight:800;font-size:.92rem;color:var(--heading);background:none;border:none;cursor:pointer;font-family:inherit;min-height:52px}
.acc-icon{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:rgba(0,255,240,.1);color:var(--teal);display:flex;align-items:center;justify-content:center;font-weight:900;transition:transform .3s;font-size:1.1rem;line-height:1}
.acc-body{max-height:0;overflow:hidden;transition:max-height .35s ease}
.acc-body p{padding:0 1.1rem 1.1rem;font-size:.88rem;color:var(--muted);line-height:1.6}

/* ---------- FORM ---------- */
.form-grid{display:grid;grid-template-columns:1fr;gap:1rem}
@media(min-width:640px){.form-grid{grid-template-columns:1fr 1fr}}
.field label{display:block;font-size:.8rem;font-weight:800;color:var(--muted);margin-bottom:.35rem;text-transform:uppercase;letter-spacing:.06em}
.input,.select,.textarea{width:100%;background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:.85rem 1rem;color:var(--heading);font-family:inherit;font-size:.95rem;transition:border-color .15s,box-shadow .15s;min-height:48px}
.textarea{min-height:110px;resize:vertical}
.input:focus,.select:focus,.textarea:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 3px rgba(0,255,240,.15)}
.input.err,.select.err{border-color:var(--red)}
.err-msg{display:none;color:var(--red);font-size:.75rem;font-weight:700;margin-top:.25rem}
.err-msg.show{display:block}
.full{grid-column:1/-1}

/* ---------- OVERLAY ---------- */
.overlay{position:fixed;inset:0;z-index:150;background:rgba(5,8,14,.85);backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:20px}
.overlay.show{display:flex}
.overlay-card{max-width:420px;width:100%;background:var(--panel);border:1px solid var(--border2);border-radius:18px;padding:2rem;text-align:center}
.overlay-card h3{font-size:1.5rem;margin-bottom:.8rem}
.overlay-card p{color:var(--muted);font-size:.92rem;margin-bottom:.6rem}

/* ---------- FOOTER ---------- */
footer{background:#070a12;border-top:1px solid var(--border);padding:56px 20px 90px}
.foot-grid{display:grid;grid-template-columns:1fr;gap:2rem;max-width:1180px;margin:0 auto}
@media(min-width:768px){.foot-grid{grid-template-columns:repeat(3,1fr)}}
footer h4{font-size:.85rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:1rem;font-family:'Archivo',sans-serif;font-weight:800}
footer a,footer p{color:var(--muted);font-size:.88rem;line-height:1.9;display:block}
footer a:hover{color:var(--teal)}
footer .phone-big{color:var(--heading);font-weight:900;font-size:1.05rem}
.crisis-box{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.3);border-radius:14px;padding:1rem 1.2rem;margin-top:1.2rem}
.crisis-box strong{color:#fca5a5;font-weight:900}
.crisis-box a{display:inline;color:#fca5a5;font-weight:800;text-decoration:underline}
.foot-bottom{max-width:1180px;margin:2rem auto 0;padding-top:1.5rem;border-top:1px solid var(--border);font-size:.78rem;color:var(--muted);display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;justify-content:space-between}

/* ---------- FLOATING BUTTONS ---------- */
#floatWA{position:fixed;bottom:96px;right:20px;z-index:9998;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#10b981);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px -6px rgba(16,185,129,.6);transition:transform .15s}
#floatWA:hover{transform:scale(1.08)}
#ai-chat-widget{position:fixed;bottom:20px;right:20px;z-index:9999;font-family:inherit}
#ai-chat-toggle{background:linear-gradient(135deg,var(--teal),var(--sky));color:#0b0f19;border:none;border-radius:50%;width:60px;height:60px;font-size:1.3rem;cursor:pointer;box-shadow:0 8px 30px rgba(0,255,240,.45);font-weight:900;font-family:'Archivo Black',sans-serif;display:flex;align-items:center;justify-content:center;min-height:60px}
#ai-chat-panel{display:none;position:absolute;bottom:75px;right:0;width:320px;max-width:calc(100vw - 36px);background:#0b0f19;border:1px solid rgba(0,255,240,.35);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.7);overflow:hidden}
#ai-chat-panel .ai-head{background:linear-gradient(135deg,var(--teal),var(--sky));color:#0b0f19;padding:12px 16px;font-weight:900;font-size:.95rem;display:flex;align-items:center;justify-content:space-between}
#ai-chat-messages{height:260px;overflow-y:auto;padding:12px;color:#e2e8f0;font-size:.88rem;line-height:1.5}
.ai-msg{background:rgba(0,255,240,.1);padding:8px 12px;border-radius:12px;margin-bottom:8px}
.ai-user{background:#334155;padding:8px 12px;border-radius:12px;margin-bottom:8px;text-align:right}
.ai-input-row{padding:8px;display:flex;gap:6px;border-top:1px solid rgba(255,255,255,.1)}
.ai-input-row input{flex:1;background:#1e293b;border:1px solid #334155;color:#f8fafc;padding:10px;border-radius:8px;font-size:.9rem;font-family:inherit;min-width:0}
.ai-input-row input:focus{outline:none;border-color:var(--teal)}
.ai-input-row button{background:var(--teal);color:#0b0f19;border:none;padding:10px 14px;border-radius:8px;font-weight:900;cursor:pointer;font-family:inherit;min-height:44px}

/* ---------- REVEAL ---------- */
.reveal{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s ease}
.reveal.in{opacity:1;transform:none}

/* ---------- PAYPAL ---------- */
#paypal-button-container{max-width:340px}
#paypal-msg{color:var(--green2);font-weight:800;font-size:.95rem;margin-top:.8rem;display:none}

/* ---------- SHARE ROW ---------- */
.share-row{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-top:1.4rem}
.share-row .share-label{font-size:.82rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-right:.2rem}
.share-btn{width:46px;height:46px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border2);background:var(--glass);color:var(--heading);cursor:pointer;transition:transform .15s,background .15s,border-color .15s;flex-shrink:0;text-decoration:none}
.share-btn:hover{transform:translateY(-2px);border-color:var(--teal);background:rgba(0,255,240,.12)}
.share-btn.wa:hover{border-color:#22c55e;background:rgba(34,197,94,.15);color:#22c55e}
.share-btn.fb:hover{border-color:#38bdf8;background:rgba(56,189,248,.15);color:#38bdf8}
.share-btn.x:hover{border-color:var(--heading);background:rgba(255,255,255,.1)}
.share-btn.copy:hover{border-color:var(--amber);background:rgba(245,158,11,.15);color:var(--amber)}
.share-btn.copied{border-color:var(--green);background:rgba(34,197,94,.2);color:var(--green)}
.referral-card{background:linear-gradient(135deg,rgba(245,158,11,.14),rgba(0,255,240,.06));border:1px solid rgba(245,158,11,.45)}
.referral-card .pound{font-family:'Archivo Black',sans-serif;font-size:clamp(2.6rem,8vw,4.5rem);line-height:1;color:var(--amber);text-shadow:0 0 40px rgba(245,158,11,.4)}

@media(min-width:900px){
  .hero-grid{grid-template-columns:1.15fr .85fr}
  section{padding:96px 40px}
}
@media(max-width:390px){
  .btn{padding:.9rem 1.1rem;font-size:.92rem;width:100%}
  .hero-ctas{flex-direction:column}
  .urgent-line{font-size:.85rem;padding:.6rem .8rem}
}
</style>
</head>
<body>

<!-- ==================== NAV ==================== -->
<nav id="topnav" aria-label="Main navigation">
  <div class="nav-inner">
    <a class="brand" href="#hero" aria-label="Insane Solar home">
      <span class="dot"></span>
      <span>INSANE SOLAR<small>by Pleading Sanity</small></span>
    </a>
    <div class="nav-links" role="navigation">
      <a class="navlink" href="#hero">Home</a>
      <a class="navlink" href="#pricing">Pricing</a>
      <a class="navlink" href="#kit">Kit</a>
      <a class="navlink" href="#ai">AI Office</a>
      <a class="navlink" href="#whitelabel">White-Label</a>
      <a class="navlink" href="#rent">Rent AI</a>
      <a class="navlink" href="#gallery">Gallery</a>
      <a class="navlink" href="#aftercare">Aftercare</a>
      <a class="navlink" href="#referral">Refer £250</a>
      <a class="navlink cta" href="#book">Book Survey</a>
    </div>
  </div>
</nav>

<!-- ==================== HERO ==================== -->
<section id="hero" class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow">Leicestershire &amp; Midlands · MCS-registered</span>
      <h1>Solar fitted by blokes who climb roofs — <span class="grad-text">not salesmen</span> who've never held a rail.</h1>
      <p class="sub">No middleman. No salesman commission. You pay for what you see — that's it.</p>
      <p class="sub" style="color:var(--teal);font-weight:800;font-size:1.02rem;margin-bottom:1.4rem">The AI strips the office and sales layers. Humans still climb the roof and fit the panels — AI just handles the bullshit.</p>
      <div class="hero-ctas">
        <a class="btn btn-primary" id="contactCall" href="tel:+447711147663">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Call to get booked in — see what we can save you
        </a>
        <a class="btn btn-amber" id="contactWA" href="https://wa.me/447711147663" target="_blank" rel="noopener">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          WhatsApp us
        </a>
      </div>
      <div class="urgent-line">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Urgent solar line — call Shane direct: <a href="tel:+447999899304" id="urgentLineHero">07999 899304</a>
      </div>
      <div class="chips">
        <span class="chip amber"><span class="dot"></span>0% VAT to 31 Mar 2027 (eligibility)</span>
        <span class="chip green"><span class="dot"></span>MCS-registered install</span>
        <span class="chip"><span class="dot"></span>£50 refundable survey deposit</span>
      </div>
      <div class="hero-stat">
        <div><strong>from £6,000</strong><span>typical 4kWp fitted</span></div>
        <div><strong>9–11 yr</strong><span>payback typical</span></div>
        <div><strong>25 yr</strong><span>workmanship typical</span></div>
      </div>
      <div class="share-row" data-share-row>
        <span class="share-label">Share this beautiful idea:</span>
        <a class="share-btn wa" data-share="wa" aria-label="Share on WhatsApp" target="_blank" rel="noopener"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>
        <a class="share-btn fb" data-share="fb" aria-label="Share on Facebook" target="_blank" rel="noopener"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
        <a class="share-btn x" data-share="x" aria-label="Share on X" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
        <button class="share-btn copy" data-share="copy" aria-label="Copy link"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
      </div>
    </div>
    <div class="hero-visual" aria-hidden="true">
      <div class="orbit">
        <div class="ring"></div>
        <div class="ring2"></div>
        <div class="sun"></div>
        <div class="panel p1"></div>
        <div class="panel p2"></div>
        <div class="panel p3"></div>
      </div>
    </div>
  </div>
</section>

<!-- ==================== PRICING ==================== -->
<section id="pricing">
  <div class="wrap">
    <span class="eyebrow amber">Honest Pricing</span>
    <h2 class="display" style="font-size:clamp(1.8rem,4.5vw,2.8rem);margin-bottom:1rem">HONEST PRICING VS BIG COMPANIES</h2>
    <p class="lead reveal">This is on average what you'd be paying somewhere else — but without the middleman.</p>

    <div class="price-lead reveal" style="margin-top:2rem">
      <div class="big">Typical 4kWp big-company price: £10,000–£14,000</div>
      <p>That includes salesman commission, office overhead, middleman markup. You're paying for a bloke in a suit who's never climbed a ladder.</p>
    </div>

    <div class="price-win reveal">
      <div class="big">Without the middleman: typical 4kWp from £6,000 fitted.</div>
      <p style="color:var(--text)">Call for honest full cost breakdown — we show you every line. You don't pay for someone to sell you the job — you pay for all you see and that's it, no extra charges.</p>
    </div>

    <div class="table-wrap reveal">
      <table>
        <thead><tr><th>System</th><th>Big company (typical)</th><th>Insane Solar (typical)</th><th>You save (typical)</th></tr></thead>
        <tbody>
          <tr><td><strong>4 kWp</strong> (≈8–10 panels)</td><td class="bigco">£10,000–£14,000</td><td class="you">from £6,000</td><td>£4,000+</td></tr>
          <tr><td><strong>6 kWp</strong> (≈12–14 panels)</td><td class="bigco">£13,000–£17,000</td><td class="you">from £8,000</td><td>£5,000+</td></tr>
          <tr><td><strong>8 kWp</strong> (≈16–18 panels)</td><td class="bigco">£16,000–£21,000</td><td class="you">from £10,500</td><td>£5,500+</td></tr>
          <tr><td><strong>+ Battery add-on</strong> (5–10kWh typical)</td><td class="bigco">£5,000–£9,000</td><td class="you">from £3,500</td><td>£1,500+</td></tr>
        </tbody>
      </table>
    </div>
    <p class="note">All figures typical 2026 — verify at sign-up, varies by roof, orientation, shading and access. 0% VAT to 31 March 2027 subject to eligibility (reverts to 5% from 1 April 2027). Battery prices vary by brand and capacity. We give you a full line-by-line breakdown at survey — no surprises.</p>

    <div style="margin-top:2rem" class="reveal">
      <a class="btn btn-primary" href="tel:+447711147663">Call for your full cost breakdown</a>
    </div>
  </div>
</section>

<!-- ==================== KIT ==================== -->
<section id="kit" style="background:linear-gradient(180deg,transparent,rgba(15,22,35,.6),transparent)">
  <div class="wrap">
    <span class="eyebrow">Cut Out The Middleman</span>
    <h2 class="display" style="font-size:clamp(1.8rem,4.5vw,2.8rem);margin-bottom:1rem">THE KIT — SOURCED DIRECT, NO MARKUP LAYERS</h2>
    <p class="lead reveal">Rails, roof hooks, mid and end clamps, panels, inverters, batteries, EV chargers — we buy it straight from the distributor and pass it on. Here's the stuff we actually fit, explained like I'm talking to me old mate down the pub. Every price labelled: typical 2026 — call for exact quote.</p>

    <div class="kit-grid" id="kitGrid">
      <!-- populated by JS from KIT array -->
    </div>
    <p class="note">Prices are typical 2026 UK fitted/supplied guide only — final confirmed at survey and sign-up. Links go to the brand's own UK product info so you can read the spec sheet yourself. We're not tied to any one brand — we fit what's right for your roof and your wallet.</p>
  </div>
</section>

<!-- ==================== AI OFFICE ==================== -->
<section id="ai">
  <div class="wrap">
    <span class="eyebrow">The AI Office</span>
    <h2 class="display" style="font-size:clamp(1.8rem,4.5vw,2.8rem);margin-bottom:1rem">THE AI OFFICE — PAPERWORK THAT DOESN'T SLEEP</h2>
    <p class="lead reveal">Our AI handles all the paperwork — MCS, G98/G99, invoices, scheduling. If AI can't, Shane steps in. We don't leave you stuck after completion — AI + Shane help you every step of the way.</p>
    <p class="reveal" style="margin-top:.8rem;font-weight:800;color:var(--amber2);font-size:1.02rem">Humans build. AI handles the bullshit. Software never touches a roof — it eats the office paperwork for breakfast.</p>

    <div class="compliance-line reveal" style="margin-top:1.6rem">
      <strong>Hard compliance line:</strong> The AI never certifies — MCS / NAPIT-registered humans sign every certificate. Software prepares, files and tracks. Real people put their name to it.
    </div>

    <div class="comp-grid" id="compGrid">
      <!-- populated by JS -->
    </div>

    <div style="margin-top:2.2rem;display:flex;flex-wrap:wrap;gap:.8rem" class="reveal">
      <a class="btn btn-ghost" href="#book">Ask the AI a question — floating button bottom-right</a>
      <a class="btn btn-amber" href="https://wa.me/447711147663" target="_blank" rel="noopener">Or WhatsApp Shane direct</a>
    </div>
  </div>
</section>

<!-- ==================== WHITE-LABEL ==================== -->
<section id="whitelabel" style="background:linear-gradient(180deg,transparent,rgba(15,22,35,.6),transparent)">
  <div class="wrap">
    <span class="eyebrow amber">For Other Companies</span>
    <h2 class="display" style="font-size:clamp(1.8rem,4.5vw,2.8rem);margin-bottom:1rem">SELL / RENT THIS SYSTEM TO OTHER COMPANIES</h2>
    <p class="lead reveal">Rent or embed this system on your site, or use our site through yours — we generate leads and contacts through ours. The only charges from Shane: £50 sign-up fee to show your seriousness, plus his rate for being there and organising. Then you order all the system and parts you want.</p>

    <div class="glass amber-glow reveal" style="margin-top:2rem;padding:1.8rem;max-width:720px">
      <h3 style="margin-bottom:.8rem;font-size:1.2rem">Join the movement — no big-company nonsense.</h3>
      <p style="color:var(--muted);font-size:.95rem;margin-bottom:1.2rem">You bring the brand, we bring the fitters, the AI office and the supply chain. £50 to get in the room — that's it. No lock-in, no commission split on parts. The AI strips the office and sales layers for you too — your lads stay on the tools, not in spreadsheets.</p>
      <div style="display:flex;flex-wrap:wrap;gap:.8rem">
        <a class="btn btn-amber" href="https://wa.me/447711147663" target="_blank" rel="noopener">WhatsApp 447711147663</a>
        <a class="btn btn-ghost" id="contactEmail" href="mailto:pleadingsanity1@gmail.com">pleadingsanity1@gmail.com</a>
      </div>
      <div class="urgent-line" style="margin-top:1.2rem">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Urgent solar line — call Shane direct: <a href="tel:+447999899304">07999 899304</a>
      </div>
    </div>
  </div>
</section>

<!-- ==================== RENT AI OFFICE (BIG SOLAR FIRMS) ==================== -->
<section id="rent" style="background:linear-gradient(180deg,transparent,rgba(15,22,35,.6),transparent)">
  <div class="wrap">
    <span class="eyebrow">For Big Solar Firms</span>
    <h2 class="display" style="font-size:clamp(1.8rem,4.5vw,2.8rem);margin-bottom:1rem">BIG SOLAR FIRMS — RENT THE AI OFFICE</h2>
    <p class="lead reveal">Big solar firms — rent The AI Office. Embed it on your site or use ours through yours. We generate leads, handle the office. You pay. No fluff — you save millions, we get paid. Message Shane on <a href="tel:+447999899304" style="font-weight:900;color:var(--amber2)">07999 899304</a> to rent it.</p>

    <div class="glass amber-glow reveal" style="margin-top:2rem;padding:1.8rem;max-width:840px">
      <h3 style="margin-bottom:.8rem;font-size:1.25rem">This AI can save you millions — by stripping office workers and salesmen, not fitters.</h3>
      <p style="color:var(--muted);font-size:.95rem;line-height:1.7;margin-bottom:1rem">Paperwork, scheduling, invoices, lead-gen, MCS/G98/G99 filings, customer comms — handled by AI, around the clock. Here's the line we will never cross: <strong style="color:var(--teal)">AI never competes with humans in building.</strong> It only removes the unnecessary layers. Humans fit panels. AI runs the office.</p>
      <p style="color:var(--muted);font-size:.95rem;line-height:1.7;margin-bottom:1.4rem">Rent it, license it, white-label it, or embed it in your operation — your crew stays on roofs, your overhead drops like a stone. You pay for the system, we keep it running. No fluff, no equity, no lock-in.</p>
      <div style="display:flex;flex-wrap:wrap;gap:.8rem">
        <a class="btn btn-amber" href="tel:+447999899304">Call Shane: 07999 899304</a>
        <a class="btn btn-ghost" href="https://wa.me/447711147663" target="_blank" rel="noopener">WhatsApp main line</a>
        <a class="btn btn-ghost" href="mailto:pleadingsanity1@gmail.com">pleadingsanity1@gmail.com</a>
      </div>
    </div>
  </div>
</section>

<!-- ==================== GALLERY ==================== -->
<section id="gallery">
  <div class="wrap">
    <span class="eyebrow">Real Jobs</span>
    <h2 class="display" style="font-size:clamp(1.8rem,4.5vw,2.8rem);margin-bottom:1rem">GALLERY — REAL FITS, REAL ROOFS</h2>
    <p class="lead reveal">Few jobs from companies I've worked on. Tap any photo to open it full size.</p>
    <div id="galleryGrid" class="reveal"></div>
    <p class="gallery-cap">Few jobs from companies I've worked on.</p>
  </div>
</section>

<!-- ==================== AFTERCARE ==================== -->
<section id="aftercare" style="background:linear-gradient(180deg,transparent,rgba(15,22,35,.6),transparent)">
  <div class="wrap">
    <span class="eyebrow amber">Aftercare</span>
    <h2 class="display" style="font-size:clamp(1.8rem,4.5vw,2.8rem);margin-bottom:1rem">WE DON'T LEAVE YOU STUCK AFTER COMPLETION</h2>
    <p class="lead reveal">We don't leave you stuck after completion — our AI and Shane will try help you every step of the way. Monitoring app setup, maintenance, fault reporting straight to the site manager's WhatsApp.</p>

    <div class="kit-grid" style="margin-top:2rem">
      <div class="glass reveal">
        <div class="kit-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
        <h3>Monitoring app setup</h3>
        <p>We install your inverter's monitoring app on your phone the day we commission — you see generation, export and battery charge live. No "we'll email you a login".</p>
      </div>
      <div class="glass reveal">
        <div class="kit-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
        <h3>Maintenance checklist</h3>
        <p>Annual isolator check, inverter firmware, bird-mesh inspection, DC connector torque. We'll remind you — or come do it for a flat fee.</p>
      </div>
      <div class="glass amber-glow reveal">
        <div class="kit-icon" style="background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.35);color:var(--green)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></div>
        <h3>Fault reporting — one tap</h3>
        <p>Something playing up? It goes straight to the site manager's WhatsApp — not a ticket queue. Photo of the fault light, we diagnose remotely and send a lad if needed.</p>
        <a class="more" id="aftercareWA" href="#" style="font-size:.85rem;font-weight:800;color:var(--green)">Report a fault on WhatsApp →</a>
      </div>
      <div class="glass reveal">
        <div class="kit-icon" style="background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.35);color:var(--amber)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <h3>Warranties</h3>
        <p><strong style="color:var(--green2)">25yr workmanship</strong> typical. 10–25yr product warranty by brand (Maxeon 40yr). HIES insurance-backed guarantee where membership applies — if we go under, HIES covers your install.</p>
      </div>
    </div>

    <!-- SEG TARIFFS -->
    <div style="margin-top:4rem">
      <span class="eyebrow">SEG Tariffs</span>
      <h3 class="display" style="font-size:clamp(1.4rem,3.5vw,2rem);margin-bottom:.8rem">GET PAID FOR THE POWER YOU EXPORT — SEG COMPARISON</h3>
      <p class="lead reveal" style="font-size:1rem">We're independent — we don't push a tariff. Real UK SEG (Smart Export Guarantee) rates worth looking at. All figures typical 2026 — verify at sign-up, subject to eligibility and an MCS-certified install; rates move with the market. EPC not required for SEG.</p>
      <div class="tariff-grid">
        <div class="glass tariff-card reveal">
          <h3><span style="color:var(--teal)">●</span> Octopus Energy</h3>
          <div class="rate">~27–30p/kWh peak export</div>
          <p><strong>Flux / Intelligent Octopus Flux:</strong> charge overnight cheap (~5p), export at peak 4–7pm for ~27–30p/kWh typical with a compatible battery. Flat SEG 4.1p/kWh open to all suppliers.</p>
          <a href="https://octopus.energy/smart/flux/" target="_blank" rel="noopener">View Octopus tariffs →</a>
        </div>
        <div class="glass tariff-card reveal">
          <h3><span style="color:var(--sky)">●</span> EDF</h3>
          <div class="rate">~15p/kWh fixed SEG</div>
          <p>SEG Export ~15p/kWh fixed 12-month for EDF customers / EDF-supplied kit. Variable ~5.6p for existing customers; ~3p open variable. You export in daylight, so flat rate is what matters.</p>
          <a href="https://www.edfenergy.com/energy-efficiency/smart-export-tariff" target="_blank" rel="noopener">View EDF SEG →</a>
        </div>
        <div class="glass tariff-card reveal">
          <h3><span style="color:var(--amber)">●</span> E.ON Next &amp; others</h3>
          <div class="rate">SEG up to ~15p/kWh</div>
          <p>E.ON Next SEG tariff available for solar exports (they also install Aiko panels — but you don't have to buy from them). British Gas ~6p open, Utility Warehouse bundle deals. Compare quarterly.</p>
          <a href="https://www.eonnext.com" target="_blank" rel="noopener">View E.ON Next →</a>
        </div>
      </div>
      <p class="note">The AI office prepares your switch + SEG signup paperwork — you authorise and sign it, the supplier still decides. MPAN setup, export meter registration and the application, all after install. No downtime; your new supplier manages the switch. SEG requires an MCS-certified install and a smart meter — we handle both.</p>
    </div>

    <!-- FAQ -->
    <div style="margin-top:4rem">
      <span class="eyebrow amber">FAQ</span>
      <h3 class="display" style="font-size:clamp(1.4rem,3.5vw,2rem);margin-bottom:1rem">QUESTIONS YOU'LL ACTUALLY ASK</h3>
      <div id="faqAccordion" class="reveal">
        <div class="acc-item">
          <button class="acc-head"><span>Do I need planning permission?</span><span class="acc-icon">+</span></button>
          <div class="acc-body"><p>Usually no — domestic solar is <strong>Permitted Development</strong>. Exceptions: listed buildings, conservation areas, and some flats. We check for you at survey and handle any application needed.</p></div>
        </div>
        <div class="acc-item">
          <button class="acc-head"><span>How long until payback?</span><span class="acc-icon">+</span></button>
          <div class="acc-body"><p><strong>Typical 9–11 years</strong> in England, based on ~£400–£700/yr bill saving plus £100–£300/yr SEG export income. With a battery and a peak-export tariff, it can be faster. We give you a personalised payback figure at survey.</p></div>
        </div>
        <div class="acc-item">
          <button class="acc-head"><span>Do I need a smart meter?</span><span class="acc-icon">+</span></button>
          <div class="acc-body"><p>You need a <strong>smart meter</strong> for SEG payments (it measures export). If you don't have one, your supplier installs it free — we coordinate it. No cost to you.</p></div>
        </div>
        <div class="acc-item">
          <button class="acc-head"><span>Can I add a battery later?</span><span class="acc-icon">+</span></button>
          <div class="acc-body"><p>Yes — if we fit a <strong>hybrid inverter now</strong>, adding a battery later is a half-day job, no rewiring. If you're on the fence, say so at survey and we'll spec hybrid from day one.</p></div>
        </div>
        <div class="acc-item">
          <button class="acc-head"><span>Are you MCS registered? What about NAPIT / HIES?</span><span class="acc-icon">+</span></button>
          <div class="acc-body"><p>Yes. The physical install and the MCS certificate are done and signed by our MCS-registered installer. The AI office only prepares and tracks the application. Part P is handled by our NAPIT-registered electrician. HIES covers deposit protection and the insurance-backed guarantee when membership applies. You get the full paperwork pack at handover.</p></div>
        </div>
        <div class="acc-item">
          <button class="acc-head"><span>What about warranties if a panel fails?</span><span class="acc-icon">+</span></button>
          <div class="acc-body"><p>Panels carry 10–25yr product warranties (Maxeon: 40yr) plus 25yr linear performance. Our <strong>25yr workmanship warranty</strong> typical and HIES insurance-backed guarantee cover the rest. If a panel fails, we sort the replacement — you don't chase the manufacturer.</p></div>
        </div>
        <div class="acc-item">
          <button class="acc-head"><span>Is VAT really 0%?</span><span class="acc-icon">+</span></button>
          <div class="acc-body"><p>0% VAT on solar + battery + wind + heat-pump installs to <strong>31 March 2027</strong>, subject to eligibility. Reverts to 5% from 1 April 2027. We'll confirm your eligibility at survey — no funny business.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ==================== REFERRAL £250 ==================== -->
<section id="referral">
  <div class="wrap">
    <span class="eyebrow amber">Refer &amp; Earn</span>
    <h2 class="display" style="font-size:clamp(1.8rem,4.5vw,2.8rem);margin-bottom:1rem">REFER SOMEONE — GET £250 CASH BACK</h2>

    <div class="glass referral-card reveal" style="padding:2rem;margin-top:1.6rem;max-width:840px">
      <div style="display:flex;gap:1.4rem;align-items:center;flex-wrap:wrap">
        <div class="pound">£250</div>
        <div style="flex:1;min-width:240px">
          <h3 style="font-size:1.3rem;margin-bottom:.5rem">Cash in your pocket on completion.</h3>
          <p style="color:var(--text);font-size:.98rem;line-height:1.65">Refer someone, they get solar fitted, you get <strong style="color:var(--amber2)">£250 cash back on completion</strong>. Share the easy way to get solar fitted — your mate saves thousands, you take home £250. No cap. Refer as many as you like.</p>
        </div>
      </div>
      <div class="share-row" data-share-row style="margin-top:1.6rem">
        <span class="share-label">Share this beautiful idea:</span>
        <a class="share-btn wa" data-share="wa" aria-label="Share on WhatsApp" target="_blank" rel="noopener"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>
        <a class="share-btn fb" data-share="fb" aria-label="Share on Facebook" target="_blank" rel="noopener"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
        <a class="share-btn x" data-share="x" aria-label="Share on X" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
        <button class="share-btn copy" data-share="copy" aria-label="Copy link"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
      </div>
      <p class="note">Just mention your name when they enquire — we log it and pay you £250 the day their system completes and signs off. Typical. Terms: referral must be a new customer, install completed and paid in full.</p>
    </div>
  </div>
</section>

<!-- ==================== BOOK ==================== -->
<section id="book">
  <div class="wrap">
    <span class="eyebrow">Book Your Survey</span>
    <h2 class="display" style="font-size:clamp(1.8rem,4.5vw,2.8rem);margin-bottom:1rem">GET A QUOTE — IT LANDS STRAIGHT WITH US</h2>
    <p class="lead reveal">Fill this in — it lands straight on the site manager's WhatsApp and into our Netlify enquiry capture. No call centre, no "press 1 for sales". Call to get us booked in — see what we can save you with honesty and a full breakdown of cost.</p>

    <div style="display:grid;gap:2rem;margin-top:2rem" class="reveal">
      <div class="glass" style="padding:1.6rem;max-width:760px">
        <form id="quoteForm" novalidate>
          <div class="form-grid">
            <div class="field">
              <label for="fName">Your name *</label>
              <input class="input" id="fName" name="name" type="text" autocomplete="name" placeholder="Shane from Leicester">
              <div class="err-msg" data-err="fName">Please tell us your name.</div>
            </div>
            <div class="field">
              <label for="fPhone">Phone *</label>
              <input class="input" id="fPhone" name="phone" type="tel" autocomplete="tel" placeholder="07...">
              <div class="err-msg" data-err="fPhone">We need a number to call you back.</div>
            </div>
            <div class="field">
              <label for="fEmail">Email</label>
              <input class="input" id="fEmail" name="email" type="email" autocomplete="email" placeholder="you@email.com">
            </div>
            <div class="field">
              <label for="fPostcode">Postcode *</label>
              <input class="input" id="fPostcode" name="postcode" type="text" autocomplete="postal-code" placeholder="LE1 1RH">
              <div class="err-msg" data-err="fPostcode">Postcode lets us check your roof area &amp; sun.</div>
            </div>
            <div class="field">
              <label for="fRoof">Roof type</label>
              <select class="select" id="fRoof" name="roof">
                <option>Pitched tile</option>
                <option>Pitched slate</option>
                <option>Flat roof</option>
                <option>Metal / standing seam</option>
                <option>Other / not sure</option>
              </select>
            </div>
            <div class="field">
              <label for="fSize">System size interested in</label>
              <select class="select" id="fSize" name="systemSize">
                <option>4 kWp</option>
                <option>6 kWp</option>
                <option>8 kWp</option>
                <option>10 kWp+</option>
                <option>Not sure — advise me</option>
              </select>
            </div>
            <div class="field">
              <label for="fBattery">Battery?</label>
              <select class="select" id="fBattery" name="battery">
                <option>No battery</option>
                <option>Add battery (5–10kWh typical)</option>
                <option>Maybe later — spec hybrid inverter</option>
              </select>
            </div>
            <div class="field">
              <label for="fEV">EV charger?</label>
              <select class="select" id="fEV" name="evCharger">
                <option>No EV charger</option>
                <option>Add myenergi zappi</option>
                <option>Maybe later</option>
              </select>
            </div>
            <div class="field full">
              <label for="fMsg">Message (optional)</label>
              <textarea class="textarea" id="fMsg" name="message" placeholder="Anything else — shading, south-facing, battery questions, awkward access..."></textarea>
            </div>
            <div class="full">
              <button type="submit" class="btn btn-primary" style="width:100%">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                Send quote request via WhatsApp
              </button>
              <p class="note" style="text-align:center">Opens WhatsApp pre-filled with your details. Also captured by Netlify forms. Prefer email? We'll offer that too.</p>
            </div>
          </div>
        </form>

        <div class="urgent-line" style="margin-top:1.4rem">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Urgent solar line — call Shane direct: <a href="tel:+447999899304" id="urgentLineBook">07999 899304</a>
        </div>
      </div>

      <!-- Hidden form so Netlify detects + captures solar enquiries -->
      <form name="solar-enquiry" netlify netlify-honeypot="bot-field" hidden aria-hidden="true">
        <input type="hidden" name="form-name" value="solar-enquiry" />
        <input name="name" /><input name="postcode" /><input name="phone" /><input name="email" />
        <input name="roof" /><input name="systemSize" /><input name="battery" /><input name="evCharger" /><textarea name="message"></textarea>
      </form>

      <!-- PayPal Checkout — £50 refundable survey deposit -->
      <div id="paypal-deposit" class="glass amber-glow" style="padding:1.6rem;max-width:760px">
        <span class="eyebrow amber" style="margin-bottom:.8rem">Secure your slot</span>
        <h3 style="font-size:1.3rem;margin-bottom:.6rem;color:var(--amber2)">Lock in your survey — £50 fully refundable deposit</h3>
        <p style="color:var(--muted);font-size:.9rem;line-height:1.6;margin-bottom:1rem">Deducted from your final installation cost. Refunded in full if your roof is unsuitable at survey. Subject to survey. Consumer Contracts Regulations — 14-day cancellation right. Formal certification issued only by MCS/NAPIT registered installers; AI prepares paperwork only.</p>
        <div id="paypal-button-container"></div>
        <p id="paypal-msg">Deposit received — thank you. A real surveyor will call you within 24 hours. Still WhatsApp us anytime on the number above.</p>
        <p class="note">Pay with PayPal, debit or credit card. No account needed.</p>
        <p style="margin-top:1rem;font-weight:800;color:var(--heading);font-size:.95rem">You don't pay for someone to sell you the job — you pay for what you see, that's it, no extra charges.</p>
      </div>
    </div>
  </div>
</section>

<!-- ==================== FOOTER ==================== -->
<footer id="footer">
  <div class="foot-grid">
    <div>
      <h4>Contact</h4>
      <p class="phone-big"><a href="tel:+447711147663" style="color:var(--heading)">07711 147663</a> <span style="color:var(--muted);font-weight:600">(main line)</span></p>
      <p class="phone-big" style="color:var(--amber2)"><a href="tel:+447999899304" style="color:var(--amber2)">07999 899304</a> <span style="color:var(--muted);font-weight:600">(urgent solar line — Shane direct)</span></p>
      <p><a href="https://wa.me/447711147663" target="_blank" rel="noopener">WhatsApp: 447711147663</a></p>
      <p><a href="mailto:pleadingsanity1@gmail.com">pleadingsanity1@gmail.com</a></p>
      <p style="margin-top:.6rem">Leicestershire &amp; Midlands</p>
      <div class="share-row" data-share-row style="margin-top:1rem">
        <span class="share-label">Share:</span>
        <a class="share-btn wa" data-share="wa" aria-label="Share on WhatsApp" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>
        <a class="share-btn fb" data-share="fb" aria-label="Share on Facebook" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
        <a class="share-btn x" data-share="x" aria-label="Share on X" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
        <button class="share-btn copy" data-share="copy" aria-label="Copy link"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
      </div>
    </div>
    <div>
      <h4>Quick Nav</h4>
      <a href="#pricing">Pricing</a>
      <a href="#kit">The Kit</a>
      <a href="#ai">AI Office</a>
      <a href="#whitelabel">White-Label / Rent</a>
      <a href="#gallery">Gallery</a>
      <a href="#aftercare">Aftercare &amp; SEG</a>
      <a href="#book">Book Survey</a>
    </div>
    <div>
      <h4>Compliance Summary</h4>
      <p>MCS-registered install · G98/G99 DNO notification · G100 export limiter where required · Part P via NAPIT · HIES deposit protection &amp; insurance-backed guarantee where membership applies · 0% VAT to 31 Mar 2027 (eligibility) · SEG signup handled · EPC not required for SEG. AI never certifies — humans sign.</p>
      <div class="crisis-box">
        <p style="color:var(--text);font-weight:800;margin-bottom:.3rem">In crisis? Talk to someone now.</p>
        <p><strong>Samaritans: 116 123</strong> (free, 24/7) · <strong>NHS 111</strong> · <strong>999</strong> emergency. Visit the <a href="crisis.html">Crisis Help page</a>.</p>
      </div>
    </div>
  </div>
  <div class="foot-bottom">
    <span>© <span id="footYear"></span> Insane Solar · Pleading Sanity · Leicestershire &amp; Midlands</span>
    <span>Canonical: <a href="https://pleadingsanity.co.uk/insane-solar.html">pleadingsanity.co.uk/insane-solar.html</a></span>
  </div>
</footer>

<!-- ==================== SUCCESS OVERLAY ==================== -->
<div id="successOverlay" class="overlay" role="dialog" aria-modal="true">
  <div class="overlay-card">
    <div style="width:4rem;height:4rem;border-radius:50%;background:rgba(34,197,94,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 1.2rem">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
    </div>
    <h3>Quote request sent.</h3>
    <p>We'll call you within <strong style="color:var(--green2)">24 hours</strong>. WhatsApp should have opened in a new tab — just hit send there to confirm.</p>
    <p style="margin-bottom:1.4rem">Didn't open? <a id="fallbackEmail" href="#" style="color:var(--amber2);font-weight:900;text-decoration:underline">Email us your details instead</a>.</p>
    <button id="closeOverlay" class="btn btn-amber" style="width:100%">Done</button>
  </div>
</div>

<!-- ==================== LIGHTBOX ==================== -->
<div id="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
  <button id="lbClose" class="lb-nav" aria-label="Close" style="top:16px;right:16px;transform:none;position:absolute;font-size:1.4rem">×</button>
  <button id="lbPrev" class="lb-nav" aria-label="Previous photo">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  </button>
  <img id="lbImg" src="" alt="" style="display:none">
  <button id="lbNext" class="lb-nav" aria-label="Next photo">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  </button>
  <div class="lb-foot"><span id="lbCounter"></span><span id="lbCaption"></span></div>
</div>

<!-- ==================== FLOATING WHATSAPP ==================== -->
<a id="floatWA" href="#" target="_blank" rel="noopener" aria-label="WhatsApp us">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#052e22" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
</a>

<!-- ==================== FLOATING AI CHAT ==================== -->
<div id="ai-chat-widget">
  <button id="ai-chat-toggle" aria-label="Open AI chat">AI</button>
  <div id="ai-chat-panel">
    <div class="ai-head">Insane Solar AI — ask me anything
      <button id="ai-chat-close" aria-label="Close chat" style="background:none;border:none;color:#0b0f19;font-size:1.3rem;font-weight:900;cursor:pointer;line-height:1">×</button>
    </div>
    <div id="ai-chat-messages">
      <div class="ai-msg">Hi — I'm the Insane Solar AI. Ask me about solar panels, costs, VAT, MCS, the deposit, or anything. I never certify — humans sign — but I'll explain it all in plain English.</div>
    </div>
    <div class="ai-input-row">
      <input id="ai-chat-input" type="text" placeholder="Ask a solar question..." aria-label="Solar question">
      <button onclick="sendAiChat()">Send</button>
    </div>
  </div>
</div>

<!-- ==================== PAYPAL SDK ==================== -->
<script src="https://www.paypal.com/sdk/js?client-id=AYSltE9oDz_VoiA2t_N3_UY6ZvCu4Wi5cY0loKZosb_dqjc0Up9HZKm_fwrWDtgbtXPbEyFzXFM-Q2Jx&currency=GBP&intent=capture"></script>

<script>
/* =====================================================================
   CONFIG — everything on the page reads from this object.
   ===================================================================== */
const CONFIG = {
  companyName: "Insane Solar",
  phone: "+447711147663",
  displayPhone: "07711 147663",
  whatsapp: "447711147663",
  email: "pleadingsanity1@gmail.com",
  phone2: "+447999899304",
  displayPhone2: "07999 899304",
  area: "Leicestershire & Midlands",
  mainSite: "https://www.pleadingsanity.co.uk",
  parentBrand: "Pleading Sanity",
  photos: [
    {src:"images/solar01.jpg", caption:"Domestic rear-pitch roof — black panels on tile. Same-day fit."},
    {src:"images/solar02.jpg", caption:"Garage roof array — full scaffolding, cleared same day."},
    {src:"images/solar03.jpg", caption:"Roof-line view — bird guard mesh fitted along the bottom edge."},
    {src:"images/solar04.jpg", caption:"Pitched roof on concrete tile — proper roof-hook mounting, bird mesh standard."},
    {src:"images/solar05.jpg", caption:"Recent domestic install by our crew — Leicestershire."},
    {src:"images/solar06.jpg", caption:"Bird guard detail — mesh clipped to panel frames, no drilling panels."},
    {src:"images/solar07.jpg", caption:"Panel-corner close-up — clean clamp work, labels intact for warranty."},
    {src:"images/solar08.jpg", caption:"Edge detail — neat mid/end clamps with bird mesh wrap."},
    {src:"images/solar9.jpg", caption:"Array from ground level — tidy cable run, no visible conduit mess."},
    {src:"images/solar10.jpg", caption:"Inverter + consumer unit install — labelled, Part P signed off."},
    {src:"images/solar11.jpg", caption:"Battery wall mount — commissioning day, app paired on site."},
    {src:"images/solar12.jpg", caption:"South-facing rear pitch — optimal orientation, full output."},
    {src:"images/solar13.jpg", caption:"Scaffolding up, panels staged — morning of the fit."},
    {src:"images/solar14.jpg", caption:"Mid-clamp detail — torque-set, anodised black finish."},
    {src:"images/solar15.jpg", caption:"Handover day — monitoring app live, paperwork pack delivered."}
  ]
};

/* KIT CATALOG — rendered into #kitGrid. Prices typical 2026, confirmed at survey. */
const KIT = [
  {icon:"panel", brand:"JA Solar", name:"DeepBlue 4.0 Pro panels", desc:"Budget Tier-1 buy — near-top specs at lower per-watt price. All-black option looks tidy on a bungalow roof.", price:"typical £110–£140/panel supplied", link:"https://www.jasolar.com/"},
  {icon:"panel", brand:"Jinko Solar", name:"Tiger Neo N-Type panels", desc:"Tier-1 N-type TOPCon, widely stocked in the UK. All-black variants popular on residential roofs.", price:"typical £120–£150/panel supplied", link:"https://www.jinkosolar.com/"},
  {icon:"panel", brand:"LONGi", name:"Hi-MO 6 / X6 panels", desc:"One of the world's biggest module makers — specified by Octopus and major UK installers. Solid, boring, lasts.", price:"typical £125–£155/panel supplied", link:"https://www.longi.com/"},
  {icon:"bolt", brand:"GivEnergy", name:"Gen3 Hybrid inverter + battery", desc:"UK's most fitted home battery brand. Hybrid inverter + battery in one wall cabinet. 10ms backup if the grid dies.", price:"typical £4,500–£7,000 fitted (5–9.5kWh)", link:"https://www.givenergy.co.uk/"},
  {icon:"bolt", brand:"Solis", name:"RHI Hybrid / S5 string inverter", desc:"Top-10 global brand, budget-friendly UK hybrid, widely stocked. Good honest workhorse for a tight budget.", price:"typical £700–£1,400 supplied", link:"https://www.solisinverters.co.uk/"},
  {icon:"bolt", brand:"Huawei", name:"SUN2000 inverter + LUNA battery", desc:"Scalable modular battery, pairs only with Huawei inverters. FusionSolar cloud monitoring is the slickest out there.", price:"typical £1,000–£1,800 inverter supplied", link:"https://solar.huawei.com/"},
  {icon:"bolt", brand:"Sunsynk", name:"ECCO / 8.8k Hybrid inverter", desc:"Very popular UK hybrid — takes both low and high voltage batteries, 10ms UPS backup. Fitter favourite.", price:"typical £1,100–£1,800 supplied", link:"https://sunsynk.net/"},
  {icon:"bolt", brand:"SolarEdge", name:"Single-phase + power optimisers", desc:"Panel-level MPPT — the one you want on a shaded or awkward roof. Each panel does its own thing.", price:"typical £1,200–£2,000 supplied", link:"https://www.solaredge.com/uk"},
  {icon:"car", brand:"myenergi", name:"zappi EV charger", desc:"Charges your car from surplus solar first — grid only when you need it. The one every EV bloke wants.", price:"typical £900–£1,200 fitted", link:"https://www.myenergi.com/products/zappi/"},
  {icon:"hot", brand:"Marlec", name:"Solar iBoost+", desc:"Dumps surplus solar into your immersion heater — free hot water instead of exporting it for pennies. Cheap, clever, no battery needed.", price:"typical £300–£400 fitted", link:"https://www.marlec.co.uk/product/solar-iboost/"},
  {icon:"rail", brand:"K2 / Schletter / Van der Valk", name:"Rails, roof hooks & legs", desc:"The aluminium skeleton that holds it all on. We match the hook to your tile type — slate, plain tile, interlocking, flat. The bit a salesman never checks.", price:"typical £60–£110/panel fitted", link:"https://www.k2-systems.com/"},
  {icon:"clamp", brand:"Brand-agnostic", name:"Mid + end clamps, earthing lugs", desc:"Mid clamps hold panels together, end clamps lock the outer edges. Properly torqued. Earth lugs bond the frame — required, not optional.", price:"typical £15–£25/panel fitted", link:"https://www.schletter.co.uk/"}
];

const KIT_ICONS = {
  panel:'<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>',
  bolt:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  car:'<path d="M5 17h14M5 17l1.5-5.5a2 2 0 0 1 1.9-1.5h7.2a2 2 0 0 1 1.9 1.5L19 17M7 17v2M17 17v2"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>',
  hot:'<path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3.5C10 9 12 8 12 2z"/>',
  rail:'<line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/>',
  clamp:'<path d="M6 3v6a6 6 0 0 0 12 0V3"/><line x1="6" y1="21" x2="18" y2="21"/><line x1="12" y1="15" x2="12" y2="21"/>'
};

const COMPLIANCE = [
  {title:"MCS", desc:"Microgeneration Certification Scheme — the kitemark. Required for SEG and warranties. Registered installer signs the cert; AI files and tracks."},
  {title:"G98 / G99", desc:"DNO grid notification. Under 16A/phase = G98 fast track; above = G99 application. We handle the paperwork end to end."},
  {title:"G100 Export Limiter", desc:"When the DNO imposes an export restriction, the smart meter + inverter link throttles feed-in correctly. We configure it."},
  {title:"EPC", desc:"Energy Performance Certificate. Not required for SEG signup. We still check it at survey so you know where you stand."},
  {title:"Part P via NAPIT", desc:"Building control notification through NAPIT. Electrical Installation Certificate signed by our registered electrician — AI logs and sends docs."},
  {title:"HIES", desc:"Deposit protection and insurance-backed guarantee arranged through HIES where membership is in place. If we go under, HIES covers you."},
  {title:"0% VAT", desc:"0% VAT on solar + battery to 31 March 2027, subject to eligibility. Reverts to 5% from 1 April 2027. We confirm eligibility at survey."},
  {title:"SEG Signup", desc:"MPAN setup and Smart Export Guarantee signup after install — typical 3–15p/kWh flat, up to ~27–30p peak with a battery on smart tariffs."}
];

(function(){
  "use strict";

  /* ---------- Populate CONFIG-powered contact elements ---------- */
  var phoneFmt = CONFIG.displayPhone || CONFIG.phone.replace(/^\+44/, "0").replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  var phone2Fmt = CONFIG.displayPhone2 || CONFIG.phone2.replace(/^\+44/, "0").replace(/(\d{5})(\d{6})/, "$1 $2");
  var set = function(id, fn){ var el = document.getElementById(id); if(el) fn(el); };
  set("phoneLabel", function(el){ el.textContent = phoneFmt; });
  set("emailLabel", function(el){ el.textContent = CONFIG.email; });
  set("contactCall", function(el){ el.href = "tel:" + CONFIG.phone; });
  set("contactWA", function(el){ el.href = "https://wa.me/" + CONFIG.whatsapp; });
  set("contactEmail", function(el){ el.href = "mailto:" + CONFIG.email; });
  set("urgentLineHero", function(el){ el.href = "tel:" + CONFIG.phone2; el.textContent = phone2Fmt; });
  set("urgentLineBook", function(el){ el.href = "tel:" + CONFIG.phone2; el.textContent = phone2Fmt; });
  set("footYear", function(el){ el.textContent = new Date().getFullYear(); });

  /* ---------- Render KIT cards ---------- */
  var kitGrid = document.getElementById("kitGrid");
  if(kitGrid){
    KIT.forEach(function(k){
      var card = document.createElement("div");
      card.className = "glass kit-card reveal";
      var iconSvg = KIT_ICONS[k.icon] || KIT_ICONS.panel;
      card.innerHTML =
        '<div class="kit-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+iconSvg+'</svg></div>'+
        '<span class="brand-tag">'+k.brand+'</span>'+
        '<h3>'+k.name+'</h3>'+
        '<p>'+k.desc+'</p>'+
        '<div class="price">'+k.price+'<small>typical 2026 — call for exact quote</small></div>'+
        '<a class="more" href="'+k.link+'" target="_blank" rel="noopener">View product info →</a>';
      kitGrid.appendChild(card);
    });
  }

  /* ---------- Render COMPLIANCE cards ---------- */
  var compGrid = document.getElementById("compGrid");
  if(compGrid){
    COMPLIANCE.forEach(function(c){
      var d = document.createElement("div");
      d.className = "glass comp-card reveal";
      d.innerHTML = '<div class="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div>'+
        '<h4>'+c.title+'</h4><p>'+c.desc+'</p>';
      compGrid.appendChild(d);
    });
  }

  /* ---------- Scroll reveal ---------- */
  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
    }, {threshold:.12});
    document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("in"); });
  }

  /* ---------- Quote form: validate → WhatsApp + mailto → Netlify AJAX → overlay ---------- */
  var form = document.getElementById("quoteForm");
  var overlay = document.getElementById("successOverlay");
  var fallbackEmail = document.getElementById("fallbackEmail");

  function showErr(id, show){
    var input = document.getElementById(id);
    var msg = document.querySelector('[data-err="' + id + '"]');
    if(input) input.classList.toggle("err", show);
    if(msg) msg.classList.toggle("show", show);
  }

  form.addEventListener("submit", function(e){
    e.preventDefault();
    var name = document.getElementById("fName").value.trim();
    var postcode = document.getElementById("fPostcode").value.trim();
    var phone = document.getElementById("fPhone").value.trim();
    var email = document.getElementById("fEmail").value.trim();
    var roof = document.getElementById("fRoof").value;
    var size = document.getElementById("fSize").value;
    var battery = document.getElementById("fBattery").value;
    var ev = document.getElementById("fEV").value;
    var msg = document.getElementById("fMsg").value.trim();

    var ok = true;
    if(!name){ showErr("fName", true); ok = false; } else showErr("fName", false);
    if(!postcode){ showErr("fPostcode", true); ok = false; } else showErr("fPostcode", false);
    if(!phone){ showErr("fPhone", true); ok = false; } else showErr("fPhone", false);
    if(!ok) return;

    var lines = [
      "INSANE SOLAR — QUOTE REQUEST",
      "Name: " + name,
      "Postcode: " + postcode,
      "Phone: " + phone,
      "Email: " + (email || "not given"),
      "Roof type: " + roof,
      "System size: " + size,
      "Battery: " + battery,
      "EV charger: " + ev,
      "Message: " + (msg || "none")
    ];
    var body = lines.join("\n");
    var encoded = encodeURIComponent(body);

    var waUrl = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encoded;
    var mailtoUrl = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Quote request — " + name + " (" + postcode + ")") + "&body=" + encoded;

    // Capture enquiry in Netlify Forms (triggers email notification) — fire-and-forget
    try {
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "solar-enquiry",
          "name": name, "postcode": postcode, "phone": phone, "email": email,
          "roof": roof, "systemSize": size,
          "battery": battery,
          "evCharger": ev,
          "message": msg
        })
      }).catch(function(){ /* non-blocking — WhatsApp still opens */ });
    } catch(e) {}

    // Open WhatsApp in new tab
    window.open(waUrl, "_blank", "noopener");
    // Provide mailto fallback in overlay
    if(fallbackEmail) fallbackEmail.href = mailtoUrl;

    // Show success overlay
    if(overlay) overlay.classList.add("show");
  });

  var closeOverlay = document.getElementById("closeOverlay");
  if(closeOverlay) closeOverlay.addEventListener("click", function(){ overlay.classList.remove("show"); });
  if(overlay) overlay.addEventListener("click", function(e){ if(e.target === overlay) overlay.classList.remove("show"); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && overlay) overlay.classList.remove("show"); });

  /* ---------- PayPal £50 refundable deposit ---------- */
  if (window.paypal && paypal.Buttons) {
    paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 48 },
      createOrder: function(data, actions) {
        return actions.order.create({ purchase_units: [{ amount: { value: '50.00', currency_code: 'GBP' }, description: 'Insane Solar — refundable survey deposit' }] });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          var m = document.getElementById('paypal-msg');
          if (m) m.style.display = 'block';
          var b = document.getElementById('paypal-button-container');
          if (b) b.style.display = 'none';
          try { fetch('/.netlify/functions/verify-paypal', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ orderID: data.orderID, customerEmail: (details.payer||{}).email_address, customerName: document.getElementById('fName').value }) }).catch(function(){}); } catch(e) {}
        });
      }
    }).render('#paypal-button-container');
  }

})();
</script>

<script>
/* Second IIFE — accordions, gallery/lightbox, floating links. CONFIG is in global lexical scope. */
(function(){
  "use strict";

  /* ---------- Contact links (aftercare + floating WhatsApp) ---------- */
  var waBase = "https://wa.me/" + (CONFIG.whatsapp || "447711147663");
  var aftercareWA = document.getElementById("aftercareWA");
  if(aftercareWA) aftercareWA.href = waBase + "?text=" + encodeURIComponent("Insane Solar — fault report. My system is playing up, can you call me?");
  var floatWA = document.getElementById("floatWA");
  if(floatWA) floatWA.href = waBase;

  /* ---------- Accordions (FAQ), one-open-at-a-time ---------- */
  function initAccordion(groupId){
    var group = document.getElementById(groupId);
    if(!group) return;
    var items = group.querySelectorAll(".acc-item");
    items.forEach(function(item){
      var head = item.querySelector(".acc-head");
      var body = item.querySelector(".acc-body");
      var icon = item.querySelector(".acc-icon");
      head.addEventListener("click", function(){
        var isOpen = item.classList.contains("open");
        items.forEach(function(other){
          other.classList.remove("open");
          other.querySelector(".acc-body").style.maxHeight = "0px";
          other.querySelector(".acc-icon").style.transform = "rotate(0deg)";
        });
        if(!isOpen){
          item.classList.add("open");
          body.style.maxHeight = body.scrollHeight + "px";
          icon.style.transform = "rotate(45deg)";
        }
      });
    });
  }
  initAccordion("faqAccordion");

  /* ---------- Gallery render + lightbox ---------- */
  var grid = document.getElementById("galleryGrid");
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCaption = document.getElementById("lbCaption");
  var lbCounter = document.getElementById("lbCounter");
  var photos = (CONFIG.photos && CONFIG.photos.length) ? CONFIG.photos : [];
  var current = 0;
  var touchX = 0;

  function openLightbox(i){
    current = i;
    var p = photos[i];
    if(!p) return;
    lbImg.src = p.src;
    lbImg.alt = p.caption;
    lbImg.style.display = "inline-block";
    lbCaption.textContent = p.caption;
    lbCounter.textContent = (i+1) + " / " + photos.length + " — ";
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox(){
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
  }
  function step(d){
    current = (current + d + photos.length) % photos.length;
    openLightbox(current);
  }

  if(grid && photos.length){
    var frag = document.createDocumentFragment();
    photos.forEach(function(p, i){
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", p.caption);
      var img = document.createElement("img");
      img.src = p.src;
      img.alt = p.caption;
      img.loading = "lazy";
      img.onerror = function(){ this.parentElement.style.display = "none"; };
      btn.appendChild(img);
      btn.addEventListener("click", function(){ openLightbox(i); });
      frag.appendChild(btn);
    });
    grid.appendChild(frag);
  }

  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  if(lbClose) lbClose.addEventListener("click", closeLightbox);
  if(lbPrev) lbPrev.addEventListener("click", function(e){ e.stopPropagation(); step(-1); });
  if(lbNext) lbNext.addEventListener("click", function(e){ e.stopPropagation(); step(1); });
  if(lightbox){
    lightbox.addEventListener("click", function(e){ if(e.target === lightbox) closeLightbox(); });
    lightbox.addEventListener("touchstart", function(e){ touchX = e.touches[0].clientX; }, {passive:true});
    lightbox.addEventListener("touchend", function(e){
      var dx = e.changedTouches[0].clientX - touchX;
      if(Math.abs(dx) > 50){ step(dx < 0 ? 1 : -1); }
    }, {passive:true});
  }
  document.addEventListener("keydown", function(e){
    if(!lightbox || !lightbox.classList.contains("show")) return;
    if(e.key === "Escape") closeLightbox();
    if(e.key === "ArrowLeft") step(-1);
    if(e.key === "ArrowRight") step(1);
  });

})();
</script>

<script>
/* Floating AI chat — toggle + send to /api/arron. Global sendAiChat (called by inline onclick). */
(function(){
  var toggle = document.getElementById("ai-chat-toggle");
  var panel = document.getElementById("ai-chat-panel");
  var closeBtn = document.getElementById("ai-chat-close");
  if(toggle && panel){
    toggle.addEventListener("click", function(){
      panel.style.display = (panel.style.display === "block") ? "none" : "block";
      if(panel.style.display === "block"){ var inp = document.getElementById("ai-chat-input"); if(inp) inp.focus(); }
    });
  }
  if(closeBtn && panel) closeBtn.addEventListener("click", function(){ panel.style.display = "none"; });
})();

function sendAiChat(){
  var inp = document.getElementById('ai-chat-input'); if(!inp) return;
  var msg = inp.value.trim(); if(!msg) return;
  var box = document.getElementById('ai-chat-messages');
  var u = document.createElement('div'); u.className = 'ai-user'; u.textContent = msg; box.appendChild(u);
  inp.value = ''; box.scrollTop = box.scrollHeight;
  var typing = document.createElement('div'); typing.id = 'ai-typing'; typing.className = 'ai-msg'; typing.style.color = '#94a3b8'; typing.textContent = 'Thinking...'; box.appendChild(typing); box.scrollTop = box.scrollHeight;
  fetch('/api/arron', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:'You are the Insane Solar AI assistant. Answer this solar question in plain UK English, max 3 sentences. Never certify — humans sign. If asked for quote, direct to WhatsApp 07711147663. Question: '+msg})}).then(function(r){return r.json();}).then(function(d){
    var t = document.getElementById('ai-typing'); if(t) t.remove();
    var reply = (d && (d.reply || d.response || d.message)) || "Connection flickered — try again or WhatsApp us on 07711147663.";
    var a = document.createElement('div'); a.className = 'ai-msg'; a.textContent = reply; box.appendChild(a); box.scrollTop = box.scrollHeight;
  }).catch(function(){
    var t = document.getElementById('ai-typing'); if(t) t.remove();
    var a = document.createElement('div'); a.className = 'ai-msg'; a.textContent = "Try again — or WhatsApp us directly on 07711147663."; box.appendChild(a); box.scrollTop = box.scrollHeight;
  });
}
document.getElementById('ai-chat-input') && document.getElementById('ai-chat-input').addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); sendAiChat(); } });
</script>

<script>
/* Share buttons — WhatsApp / Facebook / X / copy-link. Page URL is canonical live URL. */
(function(){
  "use strict";
  var PAGE_URL = "https://pleadingsanity.co.uk/insane-solar.html";
  var SHARE_TEXT = "Solar fitted by blokes who climb roofs — not salesmen. Insane Solar: no middleman, honest pricing, 0% VAT, £50 refundable survey. ";
  var urls = {
    wa: "https://wa.me/?text=" + encodeURIComponent(SHARE_TEXT + PAGE_URL),
    fb: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(PAGE_URL),
    x:  "https://twitter.com/intent/tweet?url=" + encodeURIComponent(PAGE_URL) + "&text=" + encodeURIComponent("Solar fitted by blokes who climb roofs, not salesmen.")
  };
  document.querySelectorAll("[data-share]").forEach(function(btn){
    var type = btn.getAttribute("data-share");
    if(type === "copy"){
      btn.addEventListener("click", function(){
        var done = function(){
          btn.classList.add("copied");
          var old = btn.getAttribute("aria-label");
          btn.setAttribute("aria-label", "Link copied");
          setTimeout(function(){ btn.classList.remove("copied"); btn.setAttribute("aria-label", old || "Copy link"); }, 2200);
        };
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(PAGE_URL).then(done).catch(function(){ window.prompt("Copy this link:", PAGE_URL); });
        } else {
          window.prompt("Copy this link:", PAGE_URL);
        }
      });
    } else if(urls[type]){
      btn.href = urls[type];
    }
  });
})();
</script>

</body>
</html>
