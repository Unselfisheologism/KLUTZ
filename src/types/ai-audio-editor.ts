// Types for Bass Booster Levels
export type BassBoostLevel =
  | 'Subtle Subwoofer'
  | 'Gentle Boost'
  | 'Medium Enhancement'
  | 'Intense Amplifier'
  | 'Maximum Overdrive';

// Types for Reverb Presets
export type ReverbPreset =
  | 'Vocal Ambience'
  | 'Washroom'
  | 'Small Room'
  | 'Medium Room'
  | 'Large Room'
  | 'Chapel'
  | 'Hall'
  | 'Cathedral';

// Interface for individual audio editing feature settings
export interface AudioEffectSettings {
  lofi?: { intensity: number };
  eightDD?: {}; // Simple toggle or specific 8D parameters
  tune432Hz?: {}; // Simple toggle
  resonanceAlteration?: { frequency: number; amount: number };
  temporalModification?: { stretchRatio: number };
  stereoWidener?: { amount: number };
  automatedSweep?: { startFrequency: number; endFrequency: number; duration: number };
  subharmonicIntensifier?: { intensity: number; frequency: number };
  frequencySculptor?: { points: Array<{ frequency: number; gain: number }> };
  keyTransposer?: { semitones: number };
  paceAdjuster?: { speedRatio: number };
  echoGenerator?: { delay: number; decay: number; feedback: number };
  reversePlayback?: {}; // Simple toggle
  gainController?: { gainDb: number };
  audioSplitter?: { splitPoints: number[] };
  rhythmDetector?: {}; // Could have sensitivity or other parameters
  bassBooster?: { level: BassBoostLevel };
  reverb?: { preset: ReverbPreset };
}

// Interface for the state of the audio editor
export interface AudioEditorState {
  currentAudioFile: string | null; // Path or URL of the audio file
  isPlaying: boolean;
  currentTime: number; // Current playback time in seconds
  duration: number; // Total duration in seconds
  appliedEffects: AudioEffectSettings;
  aiChatHistory: ChatMessage[];
  isProcessing: boolean; // Indicates if an audio operation is in progress
}

// Interface for a message in the AI chatbot
export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

// Interface for actions that can be dispatched to the editor
export interface AudioEditorAction {
  type: string; // Type of action (e.g., 'LOAD_AUDIO', 'PLAY_PAUSE', 'APPLY_EFFECT', 'SEND_CHAT_MESSAGE')
  payload?: any; // Data associated with the action
}

// Interface for the AI chatbot's interaction
export interface AIChatInterface {
  sendMessage: (message: string) => Promise<void>;
  onMessageReceived: (handler: (message: ChatMessage) => void) => void;
  processAudioCommand: (command: string) => Promise<boolean>; // Returns true if command was successful
}

// Interface for the main AI Native Audio Editor tool
export interface AINativeAudioEditor {
  state: AudioEditorState;
  dispatch: (action: AudioEditorAction) => void;
  aiChat: AIChatInterface;
  // Potentially other methods for direct control
  loadAudio: (file: File | string) => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  applyEffect: (effect: keyof AudioEffectSettings, settings: AudioEffectSettings[keyof AudioEffectSettings]) => void;
  undoLastEffect: () => void;
  saveAudio: (format: string) => Promise<Blob | null>;
}