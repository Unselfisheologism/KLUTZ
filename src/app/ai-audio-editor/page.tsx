'use client';


import MainDisplayPanel from '@/components/MainDisplayPanel'; // Assuming MainDisplayPanel handles the UI for audio controls, players, and waveforms
import { useState, useEffect, useRef } from 'react';
import * as audioUtils from '../lib/audio-utils'; // Import all functions from audio-utils.ts
import { useToast } from '@/hooks/use-toast';
import { AudioEditorState, AudioEditorAction, BassBoosterLevel, ReverbPreset } from './types/ai-audio-editor';

const AIAudioEditorPage = () => {
  const [audioState, setAudioState] = useState<AudioEditorState>({
    // Initial state properties, reflecting the features
    lofi: false,
    eightDAudio: false,
    tuneTo432Hz: false,
    resonanceAlteration: 0,
    temporalModification: 1.0,
    stereoWidener: 0,
    automatedSweep: false,
    subharmonicIntensifier: 0,
    frequencySculptor: {}, // Placeholder for frequency sculpting settings
    keyTransposer: 0,
    paceAdjuster: 1.0,
    echo: false,
    reversePlayback: false,
    gain: 0,
    audioSplitter: false,
    rhythmDetector: false,
 bassBooster: 'Subtle Subwoofer',
 reverb: 'Vocal Ambience',
    processedAudioBuffer: null, // State to hold the processed audio buffer
  });
  // Assuming audio-utils.ts handles the core audio processing functions
  // You would import specific functions from '../lib/audio-utils' as needed
  const [chatMessages, setChatMessages] = useState<{ type: 'user' | 'ai'; text: string }[]>([]);
  const [userCommand, setUserCommand] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [originalAudioFile, setOriginalAudioFile] = useState<File | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
 reader.onload = async (e) => {
 const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
 const audioBuffer = await audioContext.decodeAudioData(e.target!.result as ArrayBuffer);
 setUploadedFileName(file.name);
 setOriginalAudioFile(file); // Keep the file object if needed later
      };
      // Reset state for processed audio if necessary
    }
  };
  
  const handleAudioAction = async (action: AudioEditorAction) => {
    console.log('Applying action:', action);
    // TODO: Implement actual audio processing using functions from audio-utils.ts
    if (!originalAudioFile) {
 console.warn("No audio file uploaded yet.");
 return;
    }

    // Use the currently processed audio buffer if available, otherwise use the original
    let currentAudioBuffer = audioState.processedAudioBuffer || await audioUtils.fileToAudioBuffer(originalAudioFile);
    let processedBuffer = currentAudioBuffer;

    try {
 switch (action.type) {
 case 'SET_LOFI':
 processedBuffer = await audioUtils.applyLofi(currentAudioBuffer, action.payload);
 break;
        case 'SET_BASS_BOOSTER':
 processedBuffer = await audioUtils.applyBassBoost(currentAudioBuffer, action.payload);
 break;
 // Add cases for other action types as you implement them in audio-utils.ts
 // case 'SET_REVERB':
 //   processedBuffer = await audioUtils.applyReverb(currentAudioBuffer, action.payload);
 //   break;
 // ... other actions
 default:
 console.warn(`Unknown action type: ${action.type}`);
 break;
      }

      // Update the state with the new processed audio buffer
      setAudioState(prev => ({
 ...prev,
 ...action.payload,
        processedAudioBuffer: processedBuffer,
      }));

    } catch (error) {
 console.error(`Error applying action ${action.type}:`, error);
 toast({
 variant: "destructive",
 title: "Processing Failed",
 description: `Failed to apply ${action.type} effect.`,
      });
    }

    // Update local state
  };

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();



  const handleChatCommand = async (command: string) => {
    if (!command.trim()) return;
    console.log('AI Chat command:', command);

 setChatMessages([...chatMessages, { type: 'user', text: command }]); // Assuming setChatMessages is your state setter
 setUserCommand('');
 setLoading(true);

 if (typeof window.puter === 'undefined' || !window.puter.auth || !window.puter.ai) {
        console.error("Puter SDK not available.");
 toast({
 variant: "destructive",
 title: "Puter SDK Error",
 description: "Puter.js SDK is not loaded. Please refresh the page.",
 });
 setChatMessages((prev) => [...prev, { type: 'ai', text: 'Error: Puter SDK not available. Please refresh the page.' }]);
 setLoading(false);
 return;
    }
    const puter = window.puter;

 try {
 let isSignedIn = await puter.auth.isSignedIn();
 if (!isSignedIn) {
 await puter.auth.signIn();
 isSignedIn = await puter.auth.isSignedIn();
 if (!isSignedIn) throw new Error("Authentication failed or was cancelled.");
    }

 const aiResponse = await puter.ai.chat({
 prompt: `You are an AI assistant for an audio editor. Your task is to interpret user commands and suggest audio editing actions in a structured format. Respond with a JSON object containing an array of actions. Each action should have a 'type' and a 'payload'. The available action types and their expected payload types are:\n\n- SET_LOFI: boolean\n- SET_8D_AUDIO: boolean\n- SET_TUNE_TO_432HZ: boolean\n- SET_RESONANCE_ALTERATION: number (0-100)\n- SET_TEMPORAL_MODIFICATION: number (e.g., 0.5 for half speed, 2.0 for double speed)\n- SET_STEREO_WIDENER: number (0-100)\n- SET_AUTOMATED_SWEEP: boolean\n- SET_SUBHARMONIC_INTENSIFIER: number (0-100)\n- SET_FREQUENCY_SCULPTOR: object (details TBD)\n- SET_KEY_TRANSPOSER: number (semitones)\n- SET_PACE_ADJUSTER: number (e.g., 0.9 for 90% pace, 1.1 for 110% pace)\n- SET_ECHO: boolean\n- SET_REVERSE_PLAYBACK: boolean\n- SET_GAIN: number (dB)\n- SET_AUDIO_SPLITTER: boolean\n- SET_RHYTHM_DETECTOR: boolean\n- SET_BASS_BOOSTER: 'Subtle Subwoofer' | 'Gentle Boost' | 'Medium Enhancement' | 'Intense Amplifier' | 'Maximum Overdrive'\n- SET_REVERB: 'Vocal Ambience' | 'Washroom' | 'Small Room' | 'Medium Room' | 'Large Room' | 'Chapel' | 'Hall' | 'Cathedral'\n\nIf you cannot interpret the command as a specific audio action, provide a helpful message in a JSON object with a single property 'message'.\n\nUser command: "${command}"\n\nProvide only the JSON response.`,
 }, {
 model: 'gpt-4o', // Or your preferred Puter.js supported model
 });

 console.log('AI Raw Response:', aiResponse?.message?.content);

 if (!aiResponse?.message?.content) {
 throw new Error("AI response was empty.");
    }

 let aiMessage = aiResponse.message.content.trim();
 // Attempt to parse the response as JSON
      try {
 const parsedResponse = JSON.parse(aiMessage);
 if (Array.isArray(parsedResponse)) {
 setChatMessages((prev) => [...prev, { type: 'ai', text: 'Applying actions...' }]);
 parsedResponse.forEach((action: AudioEditorAction) => { // Assuming AudioEditorAction is the type for actions
 handleAudioAction(action);
 });
 setChatMessages((prev) => [...prev.slice(0, -1), { type: 'ai', text: `Applied ${parsedResponse.length} action(s).` }]);
 } else if (parsedResponse.message) {
 setChatMessages((prev) => [...prev, { type: 'ai', text: parsedResponse.message }]);
 } else {
 throw new Error("Unexpected AI response format");
 }
 } catch (jsonError) {
 // If JSON parsing fails, treat the response as a plain message
 console.error("Failed to parse AI response as JSON:", jsonError);
 setChatMessages((prev) => [...prev, { type: 'ai', text: aiMessage }]);
 }

 } catch (error) {
 console.error('Error handling chat command:', error);
 toast({
 variant: "destructive",
 title: "Chat Failed",
 description: "Failed to process your command.",
 });
 setChatMessages((prev) => [...prev, { type: 'ai', text: 'Error processing your command.' }]);
 } finally {
 setLoading(false); // Ensure loading state is reset
 }
  };

 useEffect(() => {
 // Scroll to the bottom of the chat window on new message
 if (chatMessagesRef.current) {
 chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
 }
 }, [chatMessages]);

  return (
    <div className="flex h-screen">
      {/* Left Section: Audio Editor Interface */}
      <div className="w-2/3 p-4 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">AI Native Audio Editor</h1>
        {/* Add file upload/drag and drop area */}
        <div className="mb-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center relative overflow-hidden">
          {uploadedFileName ? ( // If file is uploaded, show file name and make the input area clickable
          <div className="flex flex-col items-center w-full h-full">
            <p className="text-gray-700 dark:text-gray-300">
              File loaded: <span className="font-semibold">{uploadedFileName}</span>
            </p>
            {/* Input type file (still covers the area for re-upload) */}
            <input
              type="file"
              accept="audio/*"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              onChange={handleFileUpload}
            />
          </div>
          ) : ( // If no file uploaded, show drag and drop text
          <div className="flex flex-col items-center w-full h-full justify-center">
            <p className="text-gray-500">Drag and drop audio file here, or click to upload</p>
            {/* Input type file (covers the area) */}
            <input
              type="file"
              accept="audio/*"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              onChange={handleFileUpload}
            />
          </div>
   
          {/* Main Audio Editor Panel */}
          <MainDisplayPanel
            originalAudioFile={originalAudioFile}
            processedAudioBuffer={audioState.processedAudioBuffer}
            audioState={audioState}
            handleAudioAction={handleAudioAction}
          />
        </div>
      </div>

      {/* Right Section: AI Chatbot Interface */}
      <div className="w-1/3 p-4 flex flex-col">
 <h1 className="text-2xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">AI Chatbot</h1>
        <div className="flex-grow border border-gray-200 p-4 overflow-y-auto mb-4" ref={chatMessagesRef}>
          {chatMessages.map((message, index) => ( // Iterate over chat messages
 <div key={index} className={`mb-2 whitespace-pre-wrap ${message.type === 'user' ? 'text-right' : 'text-left'}`}> {/* Align messages */}
 <span className={`inline-block p-2 rounded ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}> {/* Style messages */}
 {message.text} {/* Display message text */}
 </span> {/* Closing span for message text */}
 </div> /* Closing div for individual message */
 ))} {/* Closing map for chat messages */}
 {loading && ( /* Show loading indicator if loading */
 <div className="text-left"> {/* Align loading indicator */}
 <span className="inline-block p-2 rounded bg-gray-200"> {/* Style loading indicator */}
 Thinking... {/* Loading text */}
 </span> {/* Closing span for loading text */}
 </div>
 )}
        </div>
        <div className="mt-4">
          <textarea
            placeholder="Type commands for the AI..."
            className="w-full border rounded p-2 resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            rows={3}
 value={userCommand}
 onChange={(e) => setUserCommand(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatCommand(userCommand); } // Handle Enter key press
            }}
          ></textarea>
          <button
            className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            onClick={() => {
              const textarea = document.querySelector('textarea'); // Get the textarea element
              if (textarea) { // Check if textarea exists
 handleChatCommand(userCommand);
              }
            }}
 disabled={loading}
          >
 {loading ? 'Processing...' : 'Send Command'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAudioEditorPage;