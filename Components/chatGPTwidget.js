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
          fontFamily: 'Inter, Arial, sans-serif',
          welcomeMessage: `
            🧠 Welcome to the Sanity Hub. 
            I'm <strong>Arron</strong> — your AI companion. 
            What's one thought you'd like to release right now?
          `,
          inputPlaceholder: 'Type your reflection here...',
          showFooter: false,

          onMessage: (msg) => {
            try {
              const vault = JSON.parse(localStorage.getItem('journalVault') || '[]');
              vault.push({
                text: msg.content,
                timestamp: new Date().toISOString(),
                source: 'Arron',
              });
              localStorage.setItem('journalVault', JSON.stringify(vault));
              console.log('Saved to Journal Vault:', msg.content);
            } catch (err) {
              console.error('Error saving to Journal Vault:', err);
            }
          },

          onAfterResponse: () => {
            const affirmations = [
              "✨ Your words matter. This is progress.",
              "🌌 Keep going — every thought has power.",
              "💎 You showed up for yourself today. That’s huge.",
              "🔥 Struggle into strength. Madness into meaning."
            ];
            const random = affirmations[Math.floor(Math.random() * affirmations.length)];
            alert(random);
          }
        });
      }
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 🔑 Export & Print helpers
  const exportVault = () => {
    const vault = JSON.parse(localStorage.getItem('journalVault') || '[]');
    if (!vault.length) return alert("⚠️ Journal Vault is empty!");

    let content = "🧠 Pleading Sanity – Journal Vault\n\n";
    vault.forEach((entry, i) => {
      content += `${i + 1}. [${new Date(entry.timestamp).toLocaleString()}]\n${entry.text}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "PleadingSanity_JournalVault.txt";
    link.click();
  };

  const printVault = () => {
    const vault = JSON.parse(localStorage.getItem('journalVault') || '[]');
    if (!vault.length) return alert("⚠️ Journal Vault is empty!");

    let win = window.open("", "PRINT", "height=600,width=800");
    win.document.write("<h1>🧠 Pleading Sanity – Journal Vault</h1>");
    vault.forEach((entry, i) => {
      win.document.write(`<p><strong>${i + 1}. ${new Date(entry.timestamp).toLocaleString()}</strong><br/>${entry.text}</p>`);
    });
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div style={{ textAlign: "center", margin: "30px auto" }}>
      <div
        id="chatgpt-widget"
        style={{
          maxWidth: '100%',
          margin: '20px auto',
          padding: '12px',
          border: '1px solid rgba(0,255,240,0.25)',
          borderRadius: '16px',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 0 22px rgba(0,255,240,0.35)',
        }}
      ></div>

      {/* Journal Vault Actions */}
      <div style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "12px" }}>
        <button
          onClick={exportVault}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: "#00fff0",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          ⬇️ Export Vault
        </button>
        <button
          onClick={printVault}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: "#ff00ff",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          🖨️ Print Vault
        </button>
      </div>
    </div>
  );
}
