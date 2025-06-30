<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Text-to-Speech</title>
    <style>
        body {
            font-family: sans-serif;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
        }
        textarea {
            width: 100%;
            margin-bottom: 10px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            resize: vertical;
        }
        select {
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        #status {
            margin-top: 15px;
            font-weight: bold;
        }
        .error {
            color: red;
        }
        .success {
            color: green;
        }
    </style>
</head>
<body>
    <h1>Browser Text-to-Speech</h1>

    <textarea id="text-to-speak" placeholder="Enter text here..." rows="10"></textarea>

    <label for="language-select">Select Language:</label>
    <select id="language-select"></select>

    <button id="speak-button">Speak</button>

    <div id="status"></div>

    <script>
        const textToSpeakEl = document.getElementById('text-to-speak');
        const languageSelectEl = document.getElementById('language-select');
        const speakButton = document.getElementById('speak-button');
        const statusEl = document.getElementById('status');

        // A simplified list of languages for demonstration.
        // The actual supported languages depend on the user's browser and OS.
        const languages = {
            'en-US': 'English (US)',
            'en-GB': 'English (British)',
            'es-ES': 'Spanish (Spain)',
            'fr-FR': 'French (France)',
            'de-DE': 'German (Germany)',
            'it-IT': 'Italian (Italy)',
            'ja-JP': 'Japanese (Japan)',
            'ko-KR': 'Korean (South Korea)',
            'ru-RU': 'Russian (Russia)',
            'zh-CN': 'Chinese (Mandarin)',
        };

        // Populate language dropdown
        for (const code in languages) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = languages[code];
            languageSelectEl.appendChild(option);
        }

        // Check for browser support
        if ('speechSynthesis' in window) {
            statusEl.textContent = 'Speech Synthesis is supported in your browser.';
            statusEl.className = 'success';

            speakButton.addEventListener('click', () => {
                const text = textToSpeakEl.value.trim();
                const selectedLanguage = languageSelectEl.value;

                if (text === '') {
                    statusEl.textContent = 'Please enter text to speak.';
                    statusEl.className = 'error';
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = selectedLanguage;

                utterance.onstart = () => {
                    statusEl.textContent = 'Speaking...';
                    statusEl.className = '';
                    speakButton.disabled = true;
                };

                utterance.onend = () => {
                    statusEl.textContent = 'Finished speaking.';
                    statusEl.className = 'success';
                    speakButton.disabled = false;
                };

                utterance.onerror = (event) => {
                    statusEl.textContent = `Speech synthesis error: ${event.error}`;
                    statusEl.className = 'error';
                    speakButton.disabled = false;
                    console.error('Speech synthesis error:', event);
                };

                speechSynthesis.speak(utterance);
            });

        } else {
            statusEl.textContent = 'Speech Synthesis is not supported in your browser.';
            statusEl.className = 'error';
            speakButton.disabled = true;
        }

    </script>
</body>
</html>