import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  // Sanitize the prompt to prevent command injection
  const sanitizedPrompt = prompt.replace(/[$"'`]/g, '');  // Basic sanitization

  // Construct the terminal command to run the OpenManus Python script
  const command = `python OpenManus/main.py --prompt "${sanitizedPrompt}"`;

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return resolve(NextResponse.json({ error: `Failed to run OpenManus script: ${stderr || error.message}` }, { status: 500 }));
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        // You might want to return stderr as an error or part of the response depending on your needs
        return resolve(NextResponse.json({ response: `Script ran with stderr:
          ${stderr}
          Output:
          ${stdout}` 
        }));
      }
      console.log(`stdout: ${stdout}`);
      resolve(NextResponse.json({ response: stdout }));
    });
  });
}