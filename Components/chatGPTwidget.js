import { useEffect } from 'react';

export default function ChatGPTWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@openai/chatgpt-widget';
    script.async = true;
    script.onload = () => {
      if (window.ChatGPTWidget) {
        window.ChatGPTWidget.init({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
          container: '#chatgpt-widget',
          theme: 'dark',
          primaryColor: '#00fff0',
          secondaryColor: '#ff00ff',
          welcomeMessage:
            "🧠 Welcome to the Sanity Hub. I'm Arron — your AI companion. Let's reflect together. What's one thing on your mind right now?",
          inputPlaceholder: 'Type your reflection here...',
          showFooter: false,
          onMessage: (msg) => {
            try {
              // Save reflection into Journal Vault (localStorage)
              const vault = JSON.parse(localStorage.getItem('journalVault') || '[]');
              vault.push({
                text: msg.content,
                timestamp: new Date().toISOString(),
                source: 'Arron',
              });
              localStorage.setItem('journalVault', JSON.stringify(vault));
            } catch (err) {
              console.error('Error saving to journal vault:', err);
            }
          },
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      id="chatgpt-widget"
      style={{
        maxWidth: '100%',
        margin: '20px auto',
        border: '1px solid rgba(0,255,240,0.2)',
        borderRadius: '12px',
        boxShadow: '0 0 18px rgba(0,255,240,0.25)',
      }}
    ></div>
  );
}
