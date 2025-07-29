import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  // Call the internal Python Serverless Function
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'; // Use VERCEL_URL in production
  const pythonFunctionUrl = `${vercelUrl}/api/run-openmanus`;

  try {
    const response = await fetch(pythonFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      // If the Python function returned an error status code
      const errorMessage = data.error || 'An error occurred in the Python function';
      const stderr = data.stderr || '';
      const stdout = data.stdout || '';
      console.error('Error from Python function:', errorMessage, 'Stderr:', stderr, 'Stdout:', stdout);
      return NextResponse.json({ error: errorMessage, stderr, stdout }, { status: response.status });
    }

    // Assuming the Python function returns a JSON object with a 'response' key
    return NextResponse.json({ response: data.response });

  } catch (error: any) {
    console.error('Error calling Python Serverless Function:', error);
    return NextResponse.json({ error: `Failed to call Python function: ${error.message}` }, { status: 500 });
  }
}