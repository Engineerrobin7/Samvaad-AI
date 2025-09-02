export async function chatWithAI(messages: {role: string, content: string}[], language: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, language }),
  });
  if (!res.ok) throw new Error('AI chat failed');
  return res.json();
}