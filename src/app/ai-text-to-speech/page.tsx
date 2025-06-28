'use client';
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


import {
  Select,
  SelectContent,
  SelectItem,
  AITextToSpeechError,
} from "@/types/ai-text-to-speech"; // Assume this type exists
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

declare const puter: any; // Assuming puter.js is available globally

const AITextToSpeechPage = () => {
  const [textInput, setTextInput] = useState<string>("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [audioOutput, setAudioOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const { toast } = useToast();

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
    setFileInput(null); // Clear file input if text is entered
    setError(null);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileInput(file);
      setError(null);
      try {
        const textContent = await file.text();
        setTextInput(textContent); // Set textInput with file content
      } catch (readError) {
        toast({ variant: "destructive", title: "File Read Error", description: "Could not read the text file." });
      }
    } else {
      setFileInput(null);
    }
  };

  const convertTextToSpeech = async () => {
    if (!textInput && !fileInput) {
      setError("Please enter text or upload a file.");
      return;
    }

    setIsLoading(true);
    setAudioOutput(null);
    setError(null);

    let inputText: string = "";

    if (fileInput) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        inputText = e.target?.result as string;
        await processConversion(inputText);
      };
      reader.onerror = () => {
        setError("Error reading file.");
        setIsLoading(false);
      };
      reader.readAsText(fileInput);
    } else {
      inputText = textInput;
      await processConversion(inputText);
    }
  };

  const processConversion = async (text: string) => {
    if (text.length > 3000) {
      setError("Text is too long. Please limit to 3000 characters.");
      setIsLoading(false);
      return;
    }

    try {
      if (typeof window.puter === 'undefined' || !window.puter.auth || !window.puter.ai) {
        throw new Error("Puter SDK not available. Please refresh.");
      }
      const puter = window.puter;

      let isSignedIn = await puter.auth.isSignedIn();

      if (!isSignedIn) {
        await puter.auth.signIn();
        isSignedIn = await puter.auth.isSignedIn();
        if (!isSignedIn) throw new Error("Authentication failed or was cancelled.");
      }

      // According to the documentation, puter.ai.txt2speech returns a Promise
      // that resolves to an MP3 stream. We chain .then() to handle the resolved value.
      puter.ai.txt2speech(text, selectedLanguage)
        .then((audio: any) => {
          // The documentation says it resolves to an MP3 stream, but observed
          // behavior sometimes shows an audio object or similar.
          // We need to determine how to get a playable URL from the resolved 'audio'
          // For now, assuming it's an object from which we can get a URL (this might need adjustment)
          if (audio && typeof audio === 'object' && audio.src) {
             setAudioOutput(audio.src);
          } else {
             console.error('Unexpected resolved value from puter.ai.txt2speech:', audio);
             throw new Error('Unexpected audio object format from text-to-speech service.');
          }
        });
    } catch (blobError: any) {
      console.error("Text-to-speech conversion error:", blobError);
      let displayErrorMessage = "An unknown error occurred.";

      // Check if the error is the specific API error object structure
      if (blobError && typeof blobError === 'object' && blobError.success === false && blobError.error && typeof blobError.error.message === 'string') {
        displayErrorMessage = blobError.error.message;
      } else if (blobError instanceof Error) {
        displayErrorMessage = blobError.message;
      }
      setError(`Text-to-speech conversion failed: ${displayErrorMessage}`);
      toast({ title: "Error", description: `Conversion failed: ${displayErrorMessage}`, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };      
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Text to Speech Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="text-input">Enter Text</Label>
          <Textarea
            id="text-input"
            placeholder="Enter text here..."
            value={textInput}
            onChange={handleTextChange}
            rows={10}
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6">
          <Label htmlFor="file-upload" className="cursor-pointer">
            Upload Text File
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="sr-only"
            disabled={isLoading}
          />
          {fileInput ? (
            <p className="mt-2 text-sm text-muted-foreground">
              File selected: {fileInput.name}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              or drag and drop a .txt file here.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="language-select">Select Language</Label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isLoading}>
          <SelectTrigger id="language-select">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ar-AE">Arabic (ar-AE)</SelectItem>
            <SelectItem value="ca-ES">Catalan (ca-ES)</SelectItem>
            <SelectItem value="yue-CN">Chinese (Cantonese) (yue-CN)</SelectItem>
            <SelectItem value="cmn-CN">Chinese (Mandarin) (cmn-CN)</SelectItem>
            <SelectItem value="da-DK">Danish (da-DK)</SelectItem>
            <SelectItem value="nl-BE">Dutch (Belgian) (nl-BE)</SelectItem>
            <SelectItem value="nl-NL">Dutch (nl-NL)</SelectItem>
            <SelectItem value="en-AU">English (Australian) (en-AU)</SelectItem>
            <SelectItem value="en-GB">English (British) (en-GB)</SelectItem>
            <SelectItem value="en-IN">English (Indian) (en-IN)</SelectItem>
            <SelectItem value="en-NZ">English (New Zealand) (en-NZ)</SelectItem>
            <SelectItem value="en-ZA">English (South African) (en-ZA)</SelectItem>
            <SelectItem value="en-US">English (US) (en-US)</SelectItem>
            <SelectItem value="en-GB-WLS">English (Welsh) (en-GB-WLS)</SelectItem>
            <SelectItem value="fi-FI">Finnish (fi-FI)</SelectItem>
            <SelectItem value="fr-FR">French (fr-FR)</SelectItem>
            <SelectItem value="fr-BE">French (Belgian) (fr-BE)</SelectItem>
            <SelectItem value="fr-CA">French (Canadian) (fr-CA)</SelectItem>
            <SelectItem value="de-DE">German (de-DE)</SelectItem>
            <SelectItem value="de-AT">German (Austrian) (de-AT)</SelectItem>
            <SelectItem value="hi-IN">Hindi (hi-IN)</SelectItem>
            <SelectItem value="is-IS">Icelandic (is-IS)</SelectItem>
            <SelectItem value="it-IT">Italian (it-IT)</SelectItem>
            <SelectItem value="ja-JP">Japanese (ja-JP)</SelectItem>
            <SelectItem value="ko-KR">Korean (ko-KR)</SelectItem>
            <SelectItem value="nb-NO">Norwegian (nb-NO)</SelectItem>
            <SelectItem value="pl-PL">Polish (pl-PL)</SelectItem>
            <SelectItem value="pt-BR">Portuguese (Brazilian) (pt-BR)</SelectItem>
            <SelectItem value="pt-PT">Portuguese (European) (pt-PT)</SelectItem>
            <SelectItem value="ro-RO">Romanian (ro-RO)</SelectItem>
            <SelectItem value="ru-RU">Russian (ru-RU)</SelectItem>
            <SelectItem value="es-ES">Spanish (European) (es-ES)</SelectItem>
            <SelectItem value="es-MX">Spanish (Mexican) (es-MX)</SelectItem>
            <SelectItem value="es-US">Spanish (US) (es-US)</SelectItem>
            <SelectItem value="sv-SE">Swedish (sv-SE)</SelectItem>
            <SelectItem value="tr-TR">Turkish (tr-TR)</SelectItem>
            <SelectItem value="cy-GB">Welsh (cy-GB)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        <Button
          onClick={convertTextToSpeech}
          disabled={isLoading || (!textInput && !fileInput)}
        >
          {isLoading ? "Converting..." : "Convert to Speech"}
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4">
          <Progress value={50} /> {/* Replace with actual progress if available */}
          <Skeleton className="h-8 w-full mt-2" />
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-500">
          <p>Error: {error}</p>
        </div>
      )}

      {audioOutput && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated Speech</h2>
          <audio controls src={audioOutput} className="w-full">
            Your browser does not support the audio element.
          </audio>
          <a href={audioOutput} download="speech.mp3" className="mt-2 inline-block">
            <Button variant="outline">Download Audio</Button>
          </a>
        </div>
      )}
    </div>
  );
};

export default AITextToSpeechPage;