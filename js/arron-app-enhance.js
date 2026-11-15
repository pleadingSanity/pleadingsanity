/* Arron app enhancements (crisis banner on send, input re-enable, gentle reveal). Moved out of an inline <script> in arron-app.html on 15 Nov 2026 because the page CSP blocked it. Same code, unchanged. */
(function(){
  try {
    var reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var log = document.getElementById('arron-conversation') || document.getElementById('aa-log');
    var form = document.getElementById('arron-input-form') || document.getElementById('aa-form');
    var input = document.getElementById('arron-input') || document.getElementById('aa-input');
    var status = document.getElementById('arron-status') || document.getElementById('aa-status');
    var send = form ? form.querySelector('button[type="submit"]') : null;
    var forget = document.getElementById('arron-forget') || document.getElementById('aa-forget');
    var pill = document.getElementById('arron-mem-pill');
    var signin = document.getElementById('arron-signin');
    var retryBox = document.getElementById('arron-retry-box');
    var visForget = document.getElementById('arron-forget-visible');
    var CRISIS_RE = /\b(suicid\w*|kill(?:ing)? (?:my ?self|me)|end (?:it all|my life)|take my own life|want(?:ed)? to die|wanna die|wish i (?:was|were) dead|don'?t want to (?:be here|live|wake up|exist)|can'?t (?:go on|do this any ?more)|self[- ]?harm\w*|hurt(?:ing)? my ?self|cut(?:ting)? my ?self|overdos\w*|no reason to live|no point (?:in )?(?:living|going on)|better off without me)\b/i;
    var EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u2728\uFE0F\u200D]/gu;
    var lastUserMsg = '', bannerKey = '', reenableTimer = null;

    function reenable(){
      try { if (input){ input.disabled = false; input.removeAttribute('aria-busy'); } if (send) send.removeAttribute('aria-busy'); } catch(e){}
    }
    function scheduleReenable(){ try { if (reenableTimer) clearTimeout(reenableTimer); reenableTimer = setTimeout(reenable, 95000); } catch(e){} }

    function insertCrisisBanner(){
      if (!log) return;
      try {
        var b = document.createElement('div');
        b.className = 'arron-crisis-banner';
        b.setAttribute('role', 'alert');
        b.innerHTML = '<strong>Please reach out to a person who can help.</strong> Call <a href="tel:999">999</a> if in immediate danger · Samaritans free <a href="tel:116123">116 123</a> (24/7) · <a href="sms:85258">SHOUT 85258</a> · NHS <a href="tel:111">111</a> · Childline <a href="tel:08001111">0800 1111</a> · <a href="tel:08082000247">Domestic abuse 0808 2000 247</a> · <a href="/crisis.html">More help</a> · <a href="https://findahelpline.com/" rel="noopener">findahelpline.com</a>';
        log.appendChild(b);
        try { log.scrollTop = log.scrollHeight; } catch(e){}
      } catch(e){}
    }

    if (form && input) {
      form.addEventListener('submit', function(){
        try {
          var text = input.value || '';
          lastUserMsg = text;
          if (text && CRISIS_RE.test(text) && bannerKey !== text) { bannerKey = text; insertCrisisBanner(); }
          input.disabled = true; input.setAttribute('aria-busy','true');
          if (send) send.setAttribute('aria-busy','true');
          scheduleReenable();
        } catch(e){}
      });
      input.addEventListener('focus', function(){ setTimeout(function(){ try { form.scrollIntoView({block:'nearest', behavior:'auto'}); } catch(e){} }, 350); });
    }

    function streamReveal(el){
      try {
        if (reduceMotion) return;
        var ps = el.querySelectorAll('p');
        if (ps.length !== 1) return;
        var p = ps[0];
        if (p.querySelector && p.querySelector('*')) return;
        var full = p.textContent || '';
        if (full.length < 12) return;
        p.textContent = '';
        var i = 0, step = Math.max(2, Math.ceil(full.length / 120));
        var iv = setInterval(function(){
          try {
            i += step;
            p.textContent = full.slice(0, i);
            if (log) log.scrollTop = log.scrollHeight;
            if (i >= full.length) { clearInterval(iv); p.textContent = full; }
          } catch(e){ clearInterval(iv); }
        }, 14);
      } catch(e){}
    }

    if (log && window.MutationObserver) {
      var lastCount = log.children.length;
      new MutationObserver(function(){
        try {
          var now = log.children.length;
          if (now <= lastCount) { lastCount = now; return; }
          lastCount = now;
          var last = log.lastElementChild;
          if (!last) return;
          var cls = last.className || '';
          var isUser = /user/i.test(cls) && !/assistant|arron/i.test(cls);
          var isAssistant = /(arron|assistant|aa-msg)/i.test(cls) && !/user/i.test(cls);
          if (isAssistant) { reenable(); if (reenableTimer) clearTimeout(reenableTimer); streamReveal(last); }
          if (isUser) { /* user bubble: no action */ }
        } catch(e){}
      }).observe(log, { childList: true });
    }

    if (status && retryBox && form && input && window.MutationObserver) {
      var rb = document.createElement('button');
      rb.type = 'button'; rb.className = 'arron-retry-btn'; rb.textContent = 'Retry last message';
      rb.setAttribute('aria-label', 'Retry last message to Arron');
      rb.addEventListener('click', function(){
        try {
          if (!lastUserMsg) return;
          input.value = lastUserMsg;
          retryBox.hidden = true;
          try { form.requestSubmit(); } catch(e){ form.dispatchEvent(new Event('submit', {cancelable:true})); }
        } catch(e){}
      });
      retryBox.appendChild(rb);
      new MutationObserver(function(){
        try {
          var t = status.textContent || '';
          var show = /offline|isn'?t saved|resting|couldn'?t|reconnecting|trouble finding/i.test(t);
          try { reenable(); if (reenableTimer) clearTimeout(reenableTimer); } catch(e){}
          retryBox.hidden = !(show && lastUserMsg);
        } catch(e){}
      }).observe(status, { childList: true, characterData: true, subtree: true });
    }

    function isSignedIn(){
      try {
        if (/(?:^|; )nf_jwt=/.test(document.cookie)) return true;
        var keys = ['ps_user','ps_session','identity','ps_identity','nf_jwt','ps_token','ps_auth'];
        for (var i=0;i<keys.length;i++){ try { if (localStorage.getItem(keys[i])) return true; } catch(e){} }
      } catch(e){}
      return false;
    }
    function updatePill(){
      try {
        var s = isSignedIn();
        if (!s && status && /Signed in as|remembers you everywhere/.test(status.textContent || '')) s = true;
        if (pill) pill.hidden = !s;
        if (signin) signin.style.display = s ? 'none' : '';
      } catch(e){}
    }
    updatePill();
    try { setInterval(updatePill, 5000); } catch(e){}

    if (visForget && forget) { visForget.addEventListener('click', function(){ try { forget.click(); } catch(e){} }); }

    function sanitize(el){ try { if (el && EMOJI_RE.test(el.textContent || '')) el.textContent = (el.textContent||'').replace(EMOJI_RE,''); } catch(e){} }
    if (status && window.MutationObserver) new MutationObserver(function(){ sanitize(status); }).observe(status, { childList:true, characterData:true, subtree:true });
    var pres = document.getElementById('arron-presence') || document.getElementById('aa-presence') || document.getElementById('aa-conn');
    if (pres && window.MutationObserver) new MutationObserver(function(){ sanitize(pres); }).observe(pres, { childList:true, characterData:true, subtree:true });
  } catch(e){ /* polish layer must never break the page */ }
})();
