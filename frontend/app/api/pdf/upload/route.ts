import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    // The backend expects a field named 'file'
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const backendResponse = await fetch(`${BACKEND_URL}/pdf/upload`, {
      method: 'POST',
      body: formData, // Directly forward the FormData
      // Do NOT set Content-Type header when sending FormData with fetch,
      // the browser will set it automatically with the correct boundary.
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json({ error: errorData.error || 'Failed to upload PDF to backend.' }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error forwarding PDF upload to backend:', error);
    return NextResponse.json({ error: 'Failed to process PDF upload.' }, { status: 500 });
  }
}