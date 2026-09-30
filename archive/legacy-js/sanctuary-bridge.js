// ==============================================================
// 🌉 SANCTUARY BRIDGE — HUMAN ↔ AI CONNECTION LAYER
// Local-First · Privacy-First · Transparent
// All data stays on YOUR device. Zero external calls.
// ==============================================================

(function() {
  'use strict';

  console.log('%c🌉 Sanctuary Bridge Active', 'color: #00fff0; font-weight: bold;');
  console.log('%cPrivacy: All interactions stay local — nothing sent to external servers', 'color: #ff00ff;');

  // ─── STATE — LOCAL ONLY ───
  const userState = {
    lastVisit: localStorage.getItem('ps_last_visit') || new Date().toISOString(),
    visitCount: parseInt(localStorage.getItem('ps_visit_count') || '1', 10),
    journalEntries: JSON.parse(localStorage.getItem('ps_journal_entries') || '[]'),
    preferences: JSON.parse(localStorage.getItem('ps_prefs') || '{}'),
    isPrivacyMode: true
  };

  // ─── UPDATE VISIT ───
  userState.visitCount++;
  localStorage.setItem('ps_visit_count', userState.visitCount.toString());
  localStorage.setItem('ps_last_visit', new Date().toISOString());

  // ─── GROWTH REFLECTION — ARRON CAN SEE YOUR PATTERN ───
  function getGrowthMessage() {
    if (userState.visitCount === 1) {
      return "You showed up. That's the hardest step — and you took it.";
    }
    if (userState.visitCount < 5) {
      return "You're coming back. That's how healing works — one return at a time.";
    }
    if (userState.visitCount < 20) {
      return "You keep showing up for yourself. That is strength.";
    }
    return "This is a practice now. You're building something real — a habit of caring for yourself. I see that.";
  }

  // ─── EXPOSE SAFELY ───
  window.SanctuaryBridge = {
    getState: () => ({ ...userState }),
    getGrowthMessage,
    getVisitCount: () => userState.visitCount,
    
    saveJournalEntry: function(text) {
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        text: text.trim()
      };
      userState.journalEntries.push(entry);
      localStorage.setItem('ps_journal_entries', JSON.stringify(userState.journalEntries));
      return entry;
    },
    
    getJournalEntries: function() {
      return [...userState.journalEntries];
    },

    clearAllData: function() {
      if (window.confirm('🔒 Clear all local data? This cannot be undone.')) {
        localStorage.clear();
        console.log('%c🔒 All local data cleared — yours fully erased', 'color: #ff00ff;');
        return true;
      }
      return false;
    },

    exportData: function() {
      const exported = JSON.stringify({
        exportedAt: new Date().toISOString(),
        visits: userState.visitCount,
        journalEntriesCount: userState.journalEntries.length,
        data: userState
      }, null, 2);
      
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pleading-sanity-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    },

    setPreference: function(key, value) {
      userState.preferences[key] = value;
      localStorage.setItem('ps_prefs', JSON.stringify(userState.preferences));
      return true;
    },

    getPreference: function(key) {
      return userState.preferences[key];
    }
  };

  // ─── ANNOUNCE ON LOAD ───
  console.log(`%c💜 ${getGrowthMessage()}`, 'color: #ffd700; font-style: italic;');
  
  // ─── SAFETY CHECK ───
  if (!localStorage.getItem('ps_privacy_acknowledged')) {
    console.log('%c🔒 Privacy Mode: All your data stays on your device', 'color: #00fff0; font-weight: bold;');
    localStorage.setItem('ps_privacy_acknowledged', 'true');
  }
})();
