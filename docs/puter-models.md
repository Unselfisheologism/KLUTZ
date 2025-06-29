puter.ai.chat()
Given a prompt returns the completion that best matches the prompt.

Syntax
puter.ai.chat(prompt)
puter.ai.chat(prompt, options = {})
puter.ai.chat(prompt, testMode = false, options = {})
puter.ai.chat(prompt, imageURL, testMode = false, options = {})
puter.ai.chat(prompt, [imageURLArray], testMode = false, options = {})
puter.ai.chat([messages], testMode = false, options = {})
Parameters
prompt (String)
A string containing the prompt you want to complete.

options (Object) (Optional)
An object containing the following properties:

model (String) - The model you want to use for the completion. If not specified, defaults to gpt-4.1-nano. The following models are available:
gpt-4o-mini (default)
gpt-4o
o1
o1-mini
o1-pro
o3
o3-mini
o4-mini
gpt-4.1
gpt-4.1-mini
gpt-4.1-nano
gpt-4.5-preview
claude-sonnet-4
claude-opus-4
claude-3-7-sonnet
claude-3-5-sonnet
deepseek-chat
deepseek-reasoner
gemini-2.0-flash
gemini-1.5-flash
meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo
meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo
meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo
mistral-large-latest
pixtral-large-latest
codestral-latest
google/gemma-2-27b-it
grok-beta
stream (Boolean) - A boolean indicating whether you want to stream the completion. Defaults to false.
max_tokens (Number) - The maximum number of tokens to generate in the completion. By default, the specific model's maximum is used.
temperature (Number) - A number between 0 and 2 indicating the randomness of the completion. Lower values make the output more focused and deterministic, while higher values make it more random. By default, the specific model's temperature is used.
tools (Array) (Optional) - An array of function definitions that the AI can call. Each function definition should have:
type (String) - Must be "function"
function (Object):
name (String) - The name of the function
description (String) - A description of what the function does
parameters (Object) - JSON Schema object describing the parameters
strict (Boolean) - Whether to enforce strict parameter validation
testMode (Boolean) (Optional)
A boolean indicating whether you want to use the test API. Defaults to false. This is useful for testing your code without using up API credits.

imageURL (String)
A string containing the URL of an image you want to provide as context for the completion. Also known as "GPT Vision".

imageURLArray (Array)
An array of strings containing the URLs of images you want to provide as context for the completion.

messages (Array)
An array of objects containing the messages you want to complete. Each object must have a role and a content property. The role property must be one of system, assistant, user, or function. The content property must be a string containing the message. An example of a valid messages parameter is:

[
    {
        role: 'system',
        content: 'Hello, how are you?'
    },
    {
        role: 'user',
        content: 'I am doing well, how are you?'
    },
]
Providing a messages array is especially useful for building chatbots where you want to provide context to the completion.

Return value
When stream is set to false (default):

Will resolve to a response object containing the completion message
If a function call is made, the response will include tool_calls array containing:
id (String) - Unique identifier for the function call
function (Object):
name (String) - Name of function to call
arguments (String) - JSON string of function arguments
When stream is set to true:

Returns an async iterable object that you can use with a for await...of loop to receive the response in parts as they become available.
In case of an error, the Promise will reject with an error message.

Vendors
We use different vendors for different models and try to use the best vendor available at the time of the request. Vendors include, but are not limited to, OpenAI, Anthropic, Google, xAI, Mistral, OpenRouter, and DeepSeek.

Examples
Ask GPT-4.1 nano a question

<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ai.chat(`What is life?`).then(puter.print);
    </script>
</body>
</html>
GPT-4 Vision

<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <img src="https://assets.puter.site/doge.jpeg" style="display:block;">
    <script>
        puter.ai.chat(
            `What do you see?`, 
            `https://assets.puter.site/doge.jpeg`)
        .then(puter.print);
    </script>
</body>
</html>
Stream the response

<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
    (async () => {
        const resp = await puter.ai.chat('Tell me in detail what Rick and Morty is all about.', {model: 'claude', stream: true });
        for await ( const part of resp ) document.write(part?.text.replaceAll('\n', '<br>'));
    })();
    </script>
</body>
</html>
Function Calling

<!DOCTYPE html>
<html>
<head>
    <title>Weather Function Calling Demo</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://js.puter.com/v2/"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 5px;
        }
        input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 10px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        button:disabled {
            background: #ccc;
        }
        #response {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Weather Function Calling Demo</h1>
        <input type="text" id="userInput" value="Paris" placeholder="Ask about the weather (e.g. What's the weather in Paris?)" />
        <button id="submit">Submit</button>
        <div id="response"></div>
    </div>

    <script>
        // Mock weather function - in a real app, this would call a weather API
        function getWeather(location) {
            const mockWeatherData = {
                'Paris': '22°C, Partly Cloudy',
                'London': '18°C, Rainy',
                'New York': '25°C, Sunny',
                'Tokyo': '28°C, Clear'
            };
            return mockWeatherData[location] || '20°C, Unknown';
        }

        // Define the tools (functions) available to the AI
        const tools = [{
            type: "function",
            function: {
                name: "get_weather",
                description: "Get current weather for a given location",
                parameters: {
                    type: "object",
                    properties: {
                        location: {
                            type: "string",
                            description: "City name e.g. Paris, London"
                        }
                    },
                    required: ["location"],
                    additionalProperties: false
                },
                strict: true
            }
        }];

        async function handleSubmit() {
            const userInput = $('#userInput').val();
            if (!userInput) return;

            // Disable button and show loading state
            $('#submit').prop('disabled', true).text('Loading...');
            $('#response').hide();

            try {
                // First message to get function call
                const completion = await puter.ai.chat(userInput, { tools });
                let finalResponse;

                // Check if we got a function call
                if (completion.message.tool_calls && completion.message.tool_calls.length > 0) {
                    const toolCall = completion.message.tool_calls[0];
                    if (toolCall.function.name === 'get_weather') {
                        // Parse the arguments and get weather data
                        const args = JSON.parse(toolCall.function.arguments);
                        const weatherData = getWeather(args.location);
                        // Send the result back to AI for final response
                        finalResponse = await puter.ai.chat([
                            { role: "user", content: userInput },
                            completion.message,
                            { 
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: weatherData
                            }
                        ]);
                    }
                } else {
                    finalResponse = completion;
                }

                // Display the response
                $('#response').html(`<strong>Response:</strong><br>${finalResponse}`).show();
            } catch (error) {
                $('#response').html(`<strong>Error:</strong><br>${error.message}`).show();
            }

            // Reset button state
            $('#submit').prop('disabled', false).text('Submit');
        }

        // Event handlers
        $(document).ready(function() {
            $('#submit').click(handleSubmit);
            $('#userInput').keypress(function(e) {
                if (e.which == 13) handleSubmit();
            });
        });
    </script>
</body>
</html>```