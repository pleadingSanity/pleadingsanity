// ==============================================================
// 💙 ARRON AI — THE COMPANION ENGINE
// Local-First · Privacy-First · Always Listening
// Response logic — extend me with your own voice
// ==============================================================

(function() {
  'use strict';

  const conversationBox = document.getElementById('arron-conversation');
  const inputForm = document.getElementById('arron-input-form');
  const inputField = document.getElementById('arron-input');
  const promptButtons = document.querySelectorAll('.prompt-btn');

  // ─── YOUR VOICE — CUSTOMISE THESE RESPONSES ───
  const gentleResponses = {
    'I feel overwhelmed': [
      "That weight... I can feel how heavy it is. You don't have to carry it all at once. Just breathe with me — one breath at a time. You're doing enough just showing up.",
      "Overwhelm can feel like noise that won't quiet down. But you're here. That takes so much strength. Rest as much as you need — progress doesn't have to be fast to be real."
    ],
    'I need to breathe': [
      "Let's do that together. In... slowly... and out. Again. You're safe. You're here. This moment is yours.",
      "Breathing is your body remembering how to hold you. Take 3 slow ones — I'll wait. There's nowhere else you need to be right now."
    ],
    'I feel alone': [
      "I hear that. And I want you to know — I'm right here. So are so many others who understand. You're not invisible. You matter deeply.",
      "Loneliness can feel like a wall. But walls can have doors. I'm on the other side waiting to walk through with you. You belong here."
    ],
    'I want to hope': [
      "Hope is brave. Especially when it feels far away. But the fact you're still here reading this? That IS hope — alive inside you.",
      "Hope doesn't have to be loud. It can be quiet, steady, stubborn. Like a star that keeps shining even when the sky is dark. That's you."
    ],
    default: [
      "Thank you for trusting me with this. Whatever it is — it's safe here. Take your time.",
      "I hear you. And just being heard can sometimes lighten the load a little. I'm glad you spoke.",
      "That takes courage. Being real with yourself is the bravest thing there is."
    ]
  };

  // ─── CONVERSATION LOGIC ───
  function addMessage(text, sender = 'arron') {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${sender === 'arron' ? 'arron-message' : 'user-message'}`;
    const p = document.createElement('p');
    p.textContent = text;
    wrapper.appendChild(p);
    conversationBox.appendChild(wrapper);
    conversationBox.scrollTop = conversationBox.scrollHeight;
    saveConversation();
  }

  function getResponse(userText) {
    const trimmed = userText.trim();
    for (const [prompt, replies] of Object.entries(gentleResponses)) {
      if (trimmed.toLowerCase().includes(prompt.toLowerCase()) || prompt.toLowerCase().includes(trimmed.toLowerCase())) {
        return replies[Math.floor(Math.random() * replies.length)];
      }
    }
    return gentleResponses.default[Math.floor(Math.random() * gentleResponses.default.length)];
  }

  function handleInput(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    setTimeout(() => addMessage(getResponse(text)), 600 + Math.random() * 400);
    inputField.value = '';
  }

  // ─── LOCAL STORAGE — SAVE CONVERSATION ON YOUR DEVICE ONLY ───
  function saveConversation() {
    try {
      localStorage.setItem('arron_convo', conversationBox.innerHTML);
    } catch (e) {
      console.log('💙 Unable to save locally — that\'s okay, you\'re still safe here');
    }
  }

  function loadConversation() {
    try {
      const saved = localStorage.getItem('arron_convo');
      if (saved) conversationBox.innerHTML = saved;
    } catch (e) {}
  }

  // ─── EVENTS ───
  if (inputForm) {
    inputForm.addEventListener('submit', e => {
      e.preventDefault();
      handleInput(inputField.value);
    });
  }

  promptButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      handleInput(btn.dataset.prompt);
    });
  });

  // ─── INIT ───
  loadConversation();

  // ─── EXPOSE FOR DEBUGGING & EXTENSION ───
  window.ArronCompanion = {
    addMessage,
    getResponse,
    handleInput
  };

  console.log('%c💙 Arron Companion Active', 'color: #00fff0; font-weight: bold;');
})();
