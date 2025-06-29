Tutorials
Free, Unlimited Llama API
Updated: April 5, 2025
This tutorial will show you how to use Puter.js to access Meta's Llama models for free, without any API keys or usage restrictions.Using Puter.js, you can work with models like Llama 4 and more for text generation and various AI tasks without worrying about usage limits or costs.

Puter is the pioneer of the "User Pays" model, which allows developers to incorporate AI capabilities into their applications while users cover their own usage costs. This model enables developers to access advanced AI features for free, without any API keys or server-side setup.

Getting Started
Puter.js is completely serverless and works without any API keys or server-side setup. To start using Puter.js, include the following script tag in your HTML file, either in the <head> or <body> section:

<script src="https://js.puter.com/v2/"></script>
You're now ready to use Puter.js for free access to Meta's Llama models. No API keys or sign-ups are required.

Example 1Use Llama 4 Maverick for text generation
To generate text using Llama 4 Maverick, use the puter.ai.chat() function with the meta-llama/llama-4-maverick model:

puter.ai.chat("Explain how machine learning works to a beginner", 
    {model: 'meta-llama/llama-4-maverick'})
    .then(response => {
        puter.print(response.message.content);
    });
Here's the full code example:

<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ai.chat("Explain how machine learning works to a beginner", 
            {model: 'meta-llama/llama-4-maverick'})
            .then(response => {
                puter.print(response.message.content);
            });
    </script>
</body>
</html>
Example 2Stream responses for longer queries
For longer responses, use streaming to get results in real-time:

async function streamLlamaResponse() {
    const response = await puter.ai.chat(
        "Write a detailed tutorial on building a React application", 
        {
            model: 'meta-llama/llama-4-maverick', 
            stream: true
        }
    );
    
    for await (const part of response) {
        puter.print(part?.text);
    }
}

streamLlamaResponse();
Here's the full code example:

<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        async function streamLlamaResponse() {
            const response = await puter.ai.chat(
                "Write a detailed tutorial on building a React application", 
                {
                    model: 'meta-llama/llama-4-maverick', 
                    stream: true
                }
            );
            
            for await (const part of response) {
                puter.print(part?.text);
            }
        }

        streamLlamaResponse();
    </script>
</body>
</html>
Example 3Use different Llama models for different needs
Puter.js provides access to various Llama models for different requirements:

// Using Llama 3.3 70B for complex tasks
puter.ai.chat(
    "Explain the implications of quantum computing on cryptography",
    { model: "meta-llama/llama-3.3-70b-instruct" }
).then(response => {
    puter.print("<h2>Using Llama 3.3 70B</h2>");
    puter.print(response.message.content);
});

// Using Llama 3.1 8B for faster responses
puter.ai.chat(
    "Suggest three fun weekend activities",
    { model: "meta-llama/llama-3.1-8b-instruct" }
).then(response => {
    puter.print("<h2>Using Llama 3.1 8B</h2>");
    puter.print(response.message.content);
});

// Using Llama Guard for content moderation
puter.ai.chat(
    "Is this message harmful: 'I enjoy hiking on weekends'",
    { model: "meta-llama/llama-guard-3-8b" }
).then(response => {
    puter.print("<h2>Using Llama Guard</h2>");
    puter.print(response.message.content);
});
Here's the full code example:

<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // Using Llama 3.3 70B for complex tasks
        puter.ai.chat(
            "Explain the implications of quantum computing on cryptography",
            { model: "meta-llama/llama-3.3-70b-instruct" }
        ).then(response => {
            puter.print("<h2>Using Llama 3.3 70B</h2>");
            puter.print(response.message.content);
        });

        // Using Llama 3.1 8B for faster responses
        puter.ai.chat(
            "Suggest three fun weekend activities",
            { model: "meta-llama/llama-3.1-8b-instruct" }
        ).then(response => {
            puter.print("<h2>Using Llama 3.1 8B</h2>");
            puter.print(response.message.content);
        });

        // Using Llama Guard for content moderation
        puter.ai.chat(
            "Is this message harmful: 'I enjoy hiking on weekends'",
            { model: "meta-llama/llama-guard-3-8b" }
        ).then(response => {
            puter.print("<h2>Using Llama Guard</h2>");
            puter.print(response.message.content);
        });
    </script>
</body>
</html>
Available Llama Models
Puter.js provides access to a comprehensive range of Meta's Llama models:

Llama 4 Models
meta-llama/llama-4-maverick
meta-llama/llama-4-scout
Llama 3.3 Models
meta-llama/llama-3.3-70b-instruct
Llama 3.2 Models
meta-llama/llama-3.2-3b-instruct
meta-llama/llama-3.2-1b-instruct
Llama 3.1 Models
meta-llama/llama-3.1-405b
meta-llama/llama-3.1-8b-instruct
meta-llama/llama-3.1-405b-instruct
meta-llama/llama-3.1-70b-instruct
Llama 3 Models
meta-llama/llama-3-8b-instruct
meta-llama/llama-3-70b-instruct
Llama 2 Models
meta-llama/llama-2-70b-chat
meta-llama/llama-2-13b-chat
Llama Guard Models
meta-llama/llama-guard-3-8b
meta-llama/llama-guard-2-8b
Simply replace the model name in the puter.ai.chat() function to use a different model.

Best Practices
For most general-purpose tasks, use meta-llama/llama-3.3-70b-instruct for the best quality results
For faster responses with slightly lower quality, use meta-llama/llama-3.1-8b-instruct
For content moderation, use meta-llama/llama-guard-3-8b
Enable streaming for longer responses to improve user experience
That's it! You now have free, unlimited access to Meta's Llama models using Puter.js. This allows you to leverage Llama's powerful language understanding and generation abilities without worrying about API keys or usage limits.