import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 });
    }

    const backendResponse = await fetch(`${BACKEND_URL}/pdf/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json({ error: errorData.error || 'Failed to chat with PDF via backend.' }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error forwarding PDF chat to backend:', error);
    return NextResponse.json({ error: 'Failed to process PDF chat.' }, { status: 500 });
  }
}