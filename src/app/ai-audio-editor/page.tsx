'use client';


import MainDisplayPanel from '@/components/MainDisplayPanel'; // Assuming MainDisplayPanel handles the UI for audio controls, players, and waveforms
import { useState, useEffect, useRef } from 'react';
import * as audioUtils from '../lib/audio-utils'; // Import all functions from src/lib/audio-utils.ts
import { useToast } from '@/hooks/use-toast';
import { AudioEditorState, AudioEditorAction, BassBoosterLevel, ReverbPreset } from './types/ai-audio-editor';

const AIAudioEditorPage = () => {
  const [audioState, setAudioState] = useState<AudioEditorState>({
    animatedGradient: true,
    colorScheme: 'dark', // Assuming 'dark' or 'light'
    waveformColor: '#3b82f6', // Default blue color
    backgroundColor: '#000000', // Default black color for dark mode
    gradientColors: ['#3b82f6', '#9333ea'], // Default gradient (blue to purple)
    showPlaybackControls: false,
    showWaveform: false,
    processingProgress: 0, // Percentage
    currentPlaybackTime: 0, // Seconds
    totalDuration: 0, // Seconds
    isPlaying: false,
    visualizationType: 'waveform', // 'waveform' or 'spectrogram'
    lofi: false, // Added state for lofi effect
    eightDAudio: false, // Added state for 8D Audio effect
    tuneTo432Hz: false, // Added state for 432Hz tuning
    resonanceAlteration: 0, // Added state for resonance alteration
    temporalModification: 1.0, // Added state for temporal modification (speed)
    stereoWidener: 0, // Added state for stereo widening
    automatedSweep: false, // Added state for automated sweep
    subharmonicIntensifier: 0, // Added state for subharmonic intensifier
    frequencySculptor: {}, // Placeholder for frequency sculpting settings
    keyTransposer: 0, // Added state for key transposition
    paceAdjuster: 1.0, // Added state for pace adjustment
    echo: false, // Added state for echo effect
    reversePlayback: false, // Added state for reverse playback
    gain: 0, // Added state for gain adjustment (dB)
    audioSplitter: false, // Added state for audio splitting
    rhythmDetector: false, // Added state for rhythm detection
    bassBooster: 'Subtle Subwoofer', // Added state for Bass Booster
    reverb: 'Vocal Ambience', // Added state for Reverb
    processedAudioBuffer: null, // State to hold the currently processed audio buffer
  });
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
      reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    }
  };
  const handleAudioAction = async (action: AudioEditorAction) => {
    console.log('Applying action:', action);
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
        //   processedBuffer = await audioUtils.applyReverb(currentAudioBuffer, action.payload);\n
        //   break;\n
        // ... other actions
 default:
 console.warn(`Unknown action type: ${action.type}`);
          break;
      }
      // Update the state with the new processed audio buffer
      setAudioState(prev => ({
        ...prev,
        // Assuming the action payload contains the state update for the specific effect
        // This might need adjustment based on how your actions are structured
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
        {/* Add file upload/drag and drop area */}\n
        <div className="mb-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center relative overflow-hidden">
          {uploadedFileName ? ( // If file is uploaded, show file name and make the input area clickable\n
            <div className="flex flex-col items-center w-full h-full">
              <p className="text-gray-700 dark:text-gray-300">
                File loaded: <span className="font-semibold">{uploadedFileName}</span>
              </p>
              {/* Input type file (still covers the area for re-upload) */}\n
              <input\n
                type="file"\n
                accept="audio/*"\n
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"\n
                onChange={handleFileUpload}\n
              />\n
            </div>\n
          ) : ( // If no file uploaded, show drag and drop text\n
            <div className="flex flex-col items-center w-full h-full justify-center">
              <p className="text-gray-500">Drag and drop audio file here, or click to upload</p>
              {/* Input type file (covers the area) */}\n
              <input\n
                type="file"\n
                accept="audio/*"\n
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"\n
                onChange={handleFileUpload}\n
              />\n
            </div>\n
          )}\n
        </div>
        {/* Main Audio Editor Panel */}\n
        <MainDisplayPanel
          originalAudioFile={originalAudioFile}
          processedAudioBuffer={audioState.processedAudioBuffer}
          audioState={audioState}
          handleAudioAction={handleAudioAction}
        />
      </div>

      {/* Right Section: AI Chatbot Interface */}\n
      <div className="w-1/3 p-4 flex flex-col">\n
        <h1 className="text-2xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">AI Chatbot</h1>\n
        <div className="flex-grow border border-gray-200 p-4 overflow-y-auto mb-4" ref={chatMessagesRef}>\n
          {chatMessages.map((message, index) => ( // Iterate over chat messages\n
            <div key={index} className={`mb-2 whitespace-pre-wrap ${message.type === 'user' ? 'text-right' : 'text-left'}`}> {/* Align messages */}\n
              <span className={`inline-block p-2 rounded ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}> {/* Style messages */}\n
                {message.text} {/* Display message text */}\n
              </span> {/* Closing span for message text */}\n
            </div> /* Closing div for individual message */\n
          ))} {/* Closing map for chat messages */}\n
          {loading && ( /* Show loading indicator if loading */\n
            <div className="text-left"> {/* Align loading indicator */}\n
              <span className="inline-block p-2 rounded bg-gray-200"> {/* Style loading indicator */}\n
                Thinking... {/* Loading text */}\n
              </span> {/* Closing span for loading text */}\n
            </div>\n
          )}\n
        </div>\n
        <div className="mt-4">\n
          <textarea\n
            placeholder="Type commands for the AI..."\n
            className="w-full border rounded p-2 resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"\n
            rows={3}\n
            value={userCommand}\n
            onChange={(e) => setUserCommand(e.target.value)}\n
            onKeyPress={(e) => {\n
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatCommand(userCommand); } // Handle Enter key press\n
            }}\n
          ></textarea>
          <button\n
            className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"\n
            onClick={() => {\n
              const textarea = document.querySelector('textarea'); // Get the textarea element\n
              if (textarea) { // Check if textarea exists\n
 handleChatCommand(userCommand);\n
              }\n
            }}\n
            disabled={loading}\n
          >\n
            {loading ? 'Processing...' : 'Send Command'}\n
          </button>\n
        </div>\n
      </div>\n
    </div>\n
  );\n
};\n

export default AIAudioEditorPage;