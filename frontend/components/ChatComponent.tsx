import { useState } from 'react';
import { chatWithAI } from '@/services/ai';

// Define a type for the message to include an id and variant
interface Message {
  id: string;
  role: string;
  content: string;
  variant?: string; // Optional variant for A/B testing
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const { reply, variant } = await chatWithAI(newMessages, 'Hindi'); // Capture variant
      const aiMessage: Message = { id: Date.now().toString(), role: 'assistant', content: reply, variant };
      setMessages([...newMessages, aiMessage]);
    } catch (err) {
      const errorMessage: Message = { id: Date.now().toString(), role: 'assistant', content: 'AI error. Please try again.' };
      setMessages([...newMessages, errorMessage]);
    }
    setLoading(false);
  };

  const handleFeedback = async (messageId: string, rating: 'POSITIVE' | 'NEGATIVE') => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, rating, variant: message.variant }), // Include variant
      });
      // Optionally, provide user feedback that their feedback has been recorded
      console.log('Feedback recorded');
    } catch (error) {
      console.error('Failed to record feedback:', error);
    }
  };

  return (
    <div>
      <div style={{ minHeight: 200, border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id}>
            <b>{msg.role === 'user' ? 'You' : 'AI'}:</b> {msg.content}
            {msg.role === 'assistant' && (
              <>
                <button onClick={() => handleFeedback(msg.id, 'POSITIVE')}>👍</button>
                <button onClick={() => handleFeedback(msg.id, 'NEGATIVE')}>👎</button>
              </>
            )}
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
