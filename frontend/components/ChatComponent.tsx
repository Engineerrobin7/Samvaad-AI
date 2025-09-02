import { useState } from 'react';
import { chatWithAI } from '@/services/ai';

export default function ChatComponent() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const data = await chatWithAI(newMessages, 'Hindi'); // Change 'Hindi' to any language you want
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'AI error. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ minHeight: 200, border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <b>{msg.role === 'user' ? 'You' : 'AI'}:</b> {msg.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        placeholder="Type your message"
        style={{ width: '70%' }}
        disabled={loading}
      />
      <button onClick={handleSend} disabled={loading || !input.trim()}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}