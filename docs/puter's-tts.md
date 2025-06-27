puter.ai.txt2speech()
Converts text into speech using AI. Supports multiple languages and voices.

Syntax
puter.ai.txt2speech(text)
puter.ai.txt2speech(text, language = 'en-US')
puter.ai.txt2speech(text, language = 'en-US', testMode = false)
Parameters
text (String) (required)
A string containing the text you want to convert to speech. The text must be less than 3000 characters long.

language (String) (optional)
The language to use for speech synthesis. Defaults to en-US. The following languages are supported:

Arabic (ar-AE)
Catalan (ca-ES)
Chinese (Cantonese) (yue-CN)
Chinese (Mandarin) (cmn-CN)
Danish (da-DK)
Dutch (Belgian) (nl-BE)
Dutch (nl-NL)
English (Australian) (en-AU)
English (British) (en-GB)
English (Indian) (en-IN)
English (New Zealand) (en-NZ)
English (South African) (en-ZA)
English (US) (en-US)
English (Welsh) (en-GB-WLS)
Finnish (fi-FI)
French (fr-FR)
French (Belgian) (fr-BE)
French (Canadian) (fr-CA)
German (de-DE)
German (Austrian) (de-AT)
Hindi (hi-IN)
Icelandic (is-IS)
Italian (it-IT)
Japanese (ja-JP)
Korean (ko-KR)
Norwegian (nb-NO)
Polish (pl-PL)
Portuguese (Brazilian) (pt-BR)
Portuguese (European) (pt-PT)
Romanian (ro-RO)
Russian (ru-RU)
Spanish (European) (es-ES)
Spanish (Mexican) (es-MX)
Spanish (US) (es-US)
Swedish (sv-SE)
Turkish (tr-TR)
Welsh (cy-GB)
testMode (Boolean) (Optional)
A boolean indicating whether you want to use the test API. Defaults to false. This is useful for testing your code without using up API credits.

Return value
A Promise that will resolve to an MP3 stream when the speech has been synthesized.

Examples
Convert text to speech

<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <button id="play">Speak!</button>
    <script>
        document.getElementById('play').addEventListener('click', ()=>{
            puter.ai.txt2speech(`Hello world! Puter is pretty amazing, don't you agree?`).then((audio)=>{
                audio.play();
            });
        });
    </script>
</body>
</html>