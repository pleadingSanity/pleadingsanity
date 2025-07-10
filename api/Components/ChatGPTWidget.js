import { useEffect } from 'react';

export default function ChatGPTWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@openai/chatgpt-widget';
    script.onload = () => {
      window.ChatGPTWidget.init({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        container: '#chatgpt-widget',
        theme: 'light',
        welcomeMessage: 'Hi! How can I support your mental health journey today?'
      });
    };
    document.body.appendChild(script);
  }, []);
  return <div id="chatgpt-widget"></div>;
}
