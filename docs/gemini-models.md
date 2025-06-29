Tutorials
Free Gemini API
Updated: April 17, 2025
This tutorial will show you how to use Puter.js to access Gemini's powerful language models for free, without any API keys or usage restrictions. Using Puter.js, you can leverage models like Gemini 2.0 Flash, Gemini 2.5 Pro, and Gemini 1.5 Flash for various tasks like text generation, analysis, and complex reasoning, text and code generation, and more.

Puter is the pioneer of the "User Pays" model, which allows developers to incorporate AI capabilities into their applications while users cover their own usage costs. This model enables developers to access advanced AI capabilities for free, without any API keys or sign-ups.

Getting Started
Puter.js works without any API keys or sign-ups. To start using Puter.js, include the following script tag in your HTML file, either in the <head> or <body> section:

<script src="https://js.puter.com/v2/"></script>
You're now ready to use Puter.js for free access to Gemini capabilities. No API keys or sign-ups are required.

Example 1Basic Text Generation with Gemini 2.0 Flash
Here's a simple example showing how to generate text using Gemini 2.0 Flash:

<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ai.chat("Explain the concept of black holes in simple terms", {
            model: 'google/gemini-2.0-flash-lite-001'
        }).then(response => {
            document.write(response.message.content);
        });
    </script>
</body>
</html>
Example 2Using Gemini 2.5 Pro
For comparison, here's how to use Gemini 2.5 Pro:

<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ai.chat(
            "What are the major differences between renewable and non-renewable energy sources?", 
            {
                model: 'google/gemini-2.5-pro-exp-03-25:free'
            }
        ).then(response => {
            document.write(response.message.content);
        });
    </script>
</body>
</html>
Example 3Streaming Responses
For longer responses, use streaming to get results in real-time:

<html>
<body>
    <div id="output"></div>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        async function streamResponses() {
            const outputDiv = document.getElementById('output');
            
            // Gemini 2.0 Flash with streaming
            outputDiv.innerHTML += '<h2>Gemini 2.0 Flash Response:</h2>';
            const flash2Response = await puter.ai.chat(
                "Explain the process of photosynthesis in detail", 
                {
                    model: 'gemini-2.0-flash',
                    stream: true
                }
            );
            
            for await (const part of flash2Response) {
                if (part?.text) {
                    outputDiv.innerHTML += part.text.replaceAll('\n', '<br>');
                }
            }
            
            // Gemini 1.5 Flash with streaming
            outputDiv.innerHTML += '<h2>Gemini 1.5 Flash Response:</h2>';
            const flash1Response = await puter.ai.chat(
                "Explain the process of photosynthesis in detail", 
                {
                    model: 'gemini-1.5-flash',
                    stream: true
                }
            );
            
            for await (const part of flash1Response) {
                if (part?.text) {
                    outputDiv.innerHTML += part.text.replaceAll('\n', '<br>');
                }
            }
        }

        streamResponses();
    </script>
</body>
</html>
Example 4Comparing Models
Here's how to compare responses from both Gemini models:

<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
    (async () => {
        // Gemini 2.5 Pro
        const pro_resp = await puter.ai.chat(
            'Tell me something interesting about quantum mechanics.',
            {model: 'google/gemini-2.5-pro-exp-03-25:free'}
        );
        document.write('<h2>Gemini 2.5 Pro Response:</h2>');
        document.write(pro_resp.message.content);

        // Gemini 2.0 Flash
        const flash2_resp = await puter.ai.chat(
            'Tell me something interesting about quantum mechanics.',
            {model: 'google/gemini-2.0-flash-lite-001', stream: true}
        );
        document.write('<h2>Gemini 2.0 Flash Response:</h2>');
        for await (const part of flash2_resp) {
            if (part?.text) {
                document.write(part.text.replaceAll('\n', '<br>'));
            }
        }

        // Gemini 1.5 Flash
        const flash1_resp = await puter.ai.chat(
            'Tell me something interesting about quantum mechanics.',
            {model: 'google/gemini-flash-1.5-8b', stream: true}
        );
        document.write('<h2>Gemini 1.5 Flash Response:</h2>');
        for await (const part of flash1_resp) {
            if (part?.text) {
                document.write(part.text.replaceAll('\n', '<br>'));
            }
        }
    })();
    </script>
</body>
</html>
All models
The following Gemini models are available for free use with Puter.js:

google/gemini-2.5-flash-preview
google/gemini-2.5-flash-preview:thinking
google/gemini-2.5-pro-exp-03-25:free
google/gemini-2.0-flash-lite-001
google/gemini-2.0-flash-001
google/gemini-2.0-pro-exp-02-05:free
google/gemini-2.0-flash-thinking-exp:free
google/gemini-2.0-flash-thinking-exp-1219:free
google/gemini-2.0-flash-exp:free
google/gemini-flash-1.5-8b
google/gemini-flash-1.5-8b-exp
google/gemini-flash-1.5
google/gemini-pro-1.5
google/gemini-pro
That's it! You now have free access to Gemini's powerful language models using Puter.js. This allows you to add sophisticated AI capabilities to your web applications without worrying about API keys or usage limits.