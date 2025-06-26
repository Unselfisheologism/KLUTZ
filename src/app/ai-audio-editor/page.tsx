'use client';

import { MainDisplayPanel } from '../../components/audio-forge/MainDisplayPanel'; // Assuming MainDisplayPanel handles the UI for audio controls, players, and waveforms
import { useState, useEffect, useRef } from 'react';
import * as audioUtils from '../../lib/audio-utils'; // Import all functions from ../../lib/audio-utils
import { useToast } from '@/hooks/use-toast';
import { AudioEditorState, AudioEditorAction, BassBoosterLevel, ReverbPreset } from './types/ai-audio-editor';

const AIAudioEditorPage = () => {
  const [audioState, setAudioState] = useState<AudioEditorState>({
    // Initial state properties, reflecting the features and UI needs
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
    processedAudioDataUrl: null, // Added state for the processed audio Data URL
  });

  const [chatMessages, setChatMessages] = useState<{ type: 'user' | 'ai'; text: string }[]>([]);
  const [userCommand, setUserCommand] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [originalAudioFile, setOriginalAudioFile] = useState<File | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const [originalAudioDataUrl, setOriginalAudioDataUrl] = useState<string | null>(null); // Added state for original audio Data URL
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(e.target!.result as ArrayBuffer);
          setUploadedFileName(file.name);
          setOriginalAudioFile(file); // Keep the file object if needed later
          const originalDataUrl = await audioUtils.fileToDataUrl(file); // Generate Data URL for original file
          setOriginalAudioDataUrl(originalDataUrl); // Store the original Data URL
          setAudioState(prev => ({
            ...prev,
            totalDuration: audioBuffer.duration,
            showPlaybackControls: true, // Show controls when audio is loaded
            showWaveform: true,
            // Initially, processed is same as original
            processedAudioBuffer: audioBuffer,
          }));
          setChatMessages(prev => [...prev, { type: 'ai', text: `Successfully loaded "${file.name}". What audio magic can I perform for you?` }]);
        } catch (error) {
          console.error("Error loading audio file:", error);
          toast({
            variant: "destructive",
            title: "Loading Failed",
            description: "Could not load the audio file. Please ensure it's a valid audio format.",
          });
          setUploadedFileName(null);
          setOriginalAudioFile(null);
          setOriginalAudioDataUrl(null); // Reset original Data URL on failure
          setAudioState(prev => ({ ...prev, showPlaybackControls: false, showWaveform: false, processedAudioBuffer: null }));
          setChatMessages(prev => [...prev, { type: 'ai', text: 'Failed to load the audio file. Please try another one.' }]);
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "Could not read the audio file.",
        });
        setUploadedFileName(null);
        setOriginalAudioFile(null);
        setOriginalAudioDataUrl(null); // Reset original Data URL on failure
        setAudioState(prev => ({ ...prev, showPlaybackControls: false, showWaveform: false, processedAudioBuffer: null }));
        setChatMessages(prev => [...prev, { type: 'ai', text: 'Failed to read the audio file.' }]);
      };
      reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    }
  };

  const handleAudioAction = async (action: AudioEditorAction) => {
    console.log('Applying action:', action);
    if (!originalAudioFile) {
      console.warn("No audio file uploaded yet. Cannot apply action.");
      toast({
        variant: "warning",
        title: "No File Loaded",
        description: "Please upload an audio file before applying effects.",
      });
      return;
    }

    // Use the currently processed audio buffer if available, otherwise convert original file
    let currentAudioBuffer = audioState.processedAudioBuffer;

    // If no processed buffer, convert original file. This might happen on the first action.
    if (!currentAudioBuffer) {
        setLoading(true); // Indicate processing is starting
        setChatMessages(prev => [...prev, { type: 'ai', text: 'Preparing audio for first processing...' }]);
        try {
            currentAudioBuffer = await audioUtils.fileToAudioBuffer(originalAudioFile);
            setChatMessages(prev => [...prev.slice(0, -1), { type: 'ai', text: 'Audio ready. Applying action...' }]);
        } catch (error) {
            console.error("Error converting file to audio buffer:", error);
            toast({
                variant: "destructive",
                title: "Processing Failed",
                description: "Could not prepare audio for processing.",
            });
            setLoading(false);
            setChatMessages(prev => [...prev.slice(0, -1), { type: 'ai', text: 'Failed to prepare audio for processing.' }]);
            return;
        } finally {
             setLoading(false); // Ensure loading is off if error occurs before next load
        }
    }


    let processedBuffer = currentAudioBuffer; // Start with the current buffer
    let effectApplied = false;

    setLoading(true); // Indicate processing is starting
    setAudioState(prev => ({ ...prev, processingProgress: 0 })); // Reset progress

    try {
      switch (action.type) {
        case 'SET_LOFI':
          processedBuffer = await audioUtils.applyLofi(currentAudioBuffer, action.payload);
          setAudioState(prev => ({ ...prev, lofi: action.payload }));
          effectApplied = true;
          break;
        case 'SET_BASS_BOOSTER':
          processedBuffer = await audioUtils.applyBassBoost(currentAudioBuffer, action.payload);
          setAudioState(prev => ({ ...prev, bassBooster: action.payload as BassBoosterLevel }));
          effectApplied = true;
          break;
        // TODO: Add cases for other action types as you implement them in audio-utils.ts
        // case 'SET_8D_AUDIO':
        //   processedBuffer = await audioUtils.apply8DAudio(currentAudioBuffer, action.payload);
        //   setAudioState(prev => ({ ...prev, eightDAudio: action.payload }));
        //   effectApplied = true;
        //   break;
        // case 'SET_REVERB':
        //   processedBuffer = await audioUtils.applyReverb(currentAudioBuffer, action.payload as ReverbPreset);
        //   setAudioState(prev => ({ ...prev, reverb: action.payload as ReverbPreset }));
        //   effectApplied = true;
        //   break;
        // ... other actions

        default:
          console.warn(`Unknown or unimplemented action type: ${action.type}`);
          setChatMessages(prev => [...prev, { type: 'ai', text: `I understand the command, but the effect "${action.type.replace('SET_', '')}" is not yet implemented.` }]);
          // Do not update processedBuffer or effectApplied for unimplemented actions
          break;
      }

      if (effectApplied) {
           const processedDataUrl = await audioUtils.audioBufferToWavDataUrl(processedBuffer); // Convert processed buffer to Data URL
           // Update the state with the new processed audio buffer, Data URL, and reset progress
        setAudioState(prev => ({
            ...prev,
            processedAudioDataUrl: processedDataUrl, // Store the processed Data URL
            processedAudioBuffer: processedBuffer,
            processingProgress: 100, // Assuming processing is synchronous for simplicity here
        }));
        setChatMessages(prev => [...prev, { type: 'ai', text: `${action.type.replace('SET_', '')} effect applied successfully.` }]);
      }


    } catch (error) {
      console.error(`Error applying action ${action.type}:`, error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: `Failed to apply ${action.type.replace('SET_', '')} effect.`,
      });
       setChatMessages(prev => [...prev, { type: 'ai', text: `Failed to apply the ${action.type.replace('SET_', '')} effect.` }]);
    } finally {
      setLoading(false); // Ensure loading state is reset
      setAudioState(prev => ({ ...prev, processingProgress: 0 })); // Reset progress bar visually
    }
  };


  const handleChatCommand = async (command: string) => {
    if (!command.trim()) return;
    console.log('AI Chat command:', command);

    const userMessage = { type: 'user' as const, text: command };
    setChatMessages([...chatMessages, userMessage]);
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
          setChatMessages((prev) => [...prev, { type: 'ai', text: `Processing ${parsedResponse.length} action(s)...` }]);
          // Process actions sequentially to apply effects one after another
          for (const action of parsedResponse) {
             await handleAudioAction(action as AudioEditorAction); // Ensure action type is correct
          }
           setChatMessages((prev) => [...prev, { type: 'ai', text: `Finished applying actions.` }]);
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
        {/* File upload/drag and drop area */}
        <div className="mb-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center relative overflow-hidden cursor-pointer hover:border-gray-400 transition-colors">
          {/* This input covers the entire div area */}
          <input
            type="file"
            accept="audio/*"
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            onChange={handleFileUpload}
          />
          {uploadedFileName ? (
            <p className="text-gray-700 dark:text-gray-300">
              File loaded: <span className="font-semibold">{uploadedFileName}</span> (Click to upload a new file)
            </p>
          ) : (
            <p className="text-gray-500">Drag and drop audio file here, or click to upload</p>
          )}
        </div>

        {/* Main Audio Editor Panel */}
        {/* MainDisplayPanel will handle displaying audio players and waveforms */}
        <MainDisplayPanel
          originalAudioDataUrl={originalAudioDataUrl} // Pass original audio Data URL
          processedAudioDataUrl={audioState.processedAudioDataUrl} // Pass processed audio Data URL
          originalAudioFile={originalAudioFile} // Pass the original file if needed by MainDisplayPanel
          processedAudioBuffer={audioState.processedAudioBuffer}
          audioState={audioState}
          handleAudioAction={handleAudioAction} // Pass action handler if MainDisplayPanel has controls that trigger actions
        />
      </div>

      {/* Right Section: AI Chatbot Interface */}
      <div className="w-1/3 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">AI Chatbot</h1>
        <div className="flex-grow border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto mb-4 rounded-md" ref={chatMessagesRef}>
          {chatMessages.map((message, index) => (
            <div key={index} className={`mb-2 whitespace-pre-wrap ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}>
                {message.text}
              </span>
            </div>
          ))}
          {loading && (
            <div className="text-left">
              <span className="inline-block p-2 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-gray-200">
                Thinking...
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <textarea
            placeholder="Type commands for the AI..."
            className="w-full border rounded-md p-2 resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={userCommand}
            onChange={(e) => setUserCommand(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatCommand(userCommand); }
            }}
          ></textarea>
          <button
            className="mt-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleChatCommand(userCommand)}
            disabled={loading || !userCommand.trim()}
          >
            {loading ? 'Processing...' : 'Send Command'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAudioEditorPage;