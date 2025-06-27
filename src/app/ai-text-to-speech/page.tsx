"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AITextToSpeechInput,
  AITextToSpeechOutput,
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
  const { toast } = useToast();

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
    setFileInput(null); // Clear file input if text is entered
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileInput(file);
      setTextInput(""); // Clear text input if file is uploaded
      setError(null);
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
      // The puter.ai.txt2speech function returns an HTML audio element string
      const audioElementHtml = await puter.ai.txt2speech(text);
      console.log("puter.ai.txt2speech output:", audioElementHtml); // Log the output
      console.log("Type of puter.ai.txt2speech output:", typeof audioElementHtml); // Log the type of the output

      if (!audioElementHtml || typeof audioElementHtml !== 'string') {
        throw new Error("Invalid response from text-to-speech service.");
      }

      // Create a temporary DOM element to parse the HTML string
      const parser = new DOMParser();
      const doc = parser.parseFromString(audioElementHtml, 'text/html');
      const audioUrl = doc.querySelector('audio')?.src;

      setAudioOutput(audioUrl);
    } catch (blobError: any) {
      console.error("Error creating audio object:", blobError);
      setError("Error creating audio playback.");
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