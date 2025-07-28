import { NextResponse } from 'next/server';
import { initOpenator } from 'openator'; // Import initOpenator

export async function POST(request: Request) {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const pollinationsApiUrl = 'https://text.pollinations.ai/openai';
  const apiKey = process.env.POLLINATIONS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Pollinations.AI API key is not configured' }, { status: 500 });
  }

  try {
    // Step 1: Get instructions from Pollinations.AI
    const response = await fetch(pollinationsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai', // Or another suitable model
        messages: [{ "role": "user", "content": `Given the user request "${message}", provide a concise instruction for a browser automation tool. For example, if the user says "go to google.com", respond with "navigate to https://www.google.com". If the user says "search for cats", respond with "type cats in the search bar and press enter". Only provide the instruction, no conversational text.` }],
      }),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`Pollinations.AI API error: ${response.status} ${response.statusText} - ${errorDetail}`);
    }

    const data = await response.json();
    const aiInstruction = data?.choices?.[0]?.message?.content?.trim() || 'Error: Could not get AI instruction.';

    if (aiInstruction.startsWith('Error:')) {
         return NextResponse.json({ response: aiInstruction }, { status: 500 });
    }


    // Step 2: Execute instruction using Openator
    console.log(`Executing instruction with Openator: "${aiInstruction}"`);
    let openatorResult = 'Openator execution initiated.';
    try {
        // Initialize Openator in headless mode for now
        const openator = initOpenator({
            llm: null, // We are not using Openator's built-in LLM, Pollinations.AI provides the instruction
            headless: true, // Run headless on the server
        });

        // Execute the instruction provided by the AI
        // We need to think about how Openator consumes instructions.
        // Assuming start can take an instruction string directly.
        // You might need to adapt this based on how openator expects instructions.
        await openator.start('about:blank', aiInstruction); // Start with a blank page or a specific URL

        openatorResult = `Openator executed instruction: "${aiInstruction}".`;

    } catch (openatorError: any) {
        console.error('Error during Openator execution:', openatorError);
        openatorResult = `Error during Openator execution: ${openatorError.message}`;
    }


    // Step 3: Return response to frontend (including openator result)
    return NextResponse.json({
        response: `AI Instruction: "${aiInstruction}"\n${openatorResult}`
    });

  } catch (error: any) {
    console.error('Error in AI Browser Agent API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
