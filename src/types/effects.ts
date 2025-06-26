
import type { Effect } from '@/types/audio-forge';
import {
  Waves,
  Clock,
  Download,
  Expand,
  Shuffle,
  SignalLow,
  SlidersHorizontal,
  Music2,
  Repeat,
  Rewind,
  Spline,
  Gauge,
  Scissors,
  Volume2,
  HeartPulse,
  Building,
  Moon,
  Copyleft,
  Headphones,
  TrendingDown,
  HelpingHand,
  CassetteTape, // Added CassetteTape
} from 'lucide-react';

export const effectsList: Effect[] = [
  // Creative Presets
  {
    id: 'dreamscapeMaker',
    name: "Lo-fi",
    description: 'Create lo-fi music with a slowed and reverb effect for chill, atmospheric soundscapes. Perfect for lo-fi beats, study music, and relaxing background audio.',
    icon: CassetteTape, // Changed from Moon to CassetteTape
    controlType: 'button',
    actionLabel: "Apply Lo-fi Effect",
    handlerKey: 'dreamscapeMaker',
    groupName: 'Creative Presets',
  },
  {
    id: 'audio8DConverter',
    name: '8D Audio Converter',
    description: 'Transform any song or audio file into immersive 8D audio. Combine panning and reverb to simulate a surround sound experience in your headphones.',
    icon: Headphones,
    controlType: 'button',
    actionLabel: 'Apply 8D Effect',
    handlerKey: 'apply8DEffect',
    groupName: 'Creative Presets',
  },
  {
    id: 'frequencyTuner432',
    name: 'Tune to 432Hz',
    description: 'Convert music from standard 440Hz tuning to 432Hz for a warmer, more natural sound. Ideal for musicians and audiophiles seeking 432Hz audio.',
    icon: Copyleft, 
    controlType: 'button',
    actionLabel: 'Tune to 432Hz',
    handlerKey: 'frequencyTuner',
    groupName: 'Creative Presets',
  },
  // Core Effects
  {
    id: 'resonanceAlteration',
    name: 'Resonance Alteration',
    description: 'Shift the frequency of your audio with a pitch shifter. Change how high or low your audio sounds for creative or corrective purposes.',
    icon: Waves,
    controlType: 'slider',
    parameters: [
      { name: 'frequency', label: 'Frequency Shift', type: 'slider', defaultValue: 0, min: -12, max: 12, step: 1 }
    ],
    handlerKey: 'alterResonance',
    groupName: 'Core Effects',
  },
  {
    id: 'temporalModification',
    name: 'Temporal Modification',
    description: 'Change the playback speed of audio without affecting pitch. Speed up or slow down music, podcasts, and more.',
    icon: Clock,
    controlType: 'slider',
    parameters: [
      { name: 'rate', label: 'Playback Rate', type: 'slider', defaultValue: 1, min: 0.5, max: 2, step: 0.01 }
    ],
    handlerKey: 'temporalModification',
    groupName: 'Core Effects',
  },
  // Spatial Effects
  {
    id: 'stereoWidener',
    name: 'Stereo Widener',
    description: 'Widen the stereo image of your audio for a fuller, more spacious sound. Enhance stereo separation for music or podcasts.',
    icon: Expand,
    controlType: 'slider',
    parameters: [
      { name: 'width', label: 'Stereo Width', type: 'slider', defaultValue: 100, min: 0, max: 200, step: 1 }
    ],
    handlerKey: 'stereoWidener',
    groupName: 'Spatial Effects',
  },
  {
    id: 'automatedSweep',
    name: 'Automated Sweep',
    description: 'Pan audio from left to right automatically. Create dynamic, moving effects for binaural and immersive listening.',
    icon: Shuffle,
    controlType: 'slider',
    parameters: [
      { name: 'speed', label: 'Sweep Speed (Hz)', type: 'slider', defaultValue: 0.5, min: 0.05, max: 5, step: 0.01 }
    ],
    handlerKey: 'automatedSweep',
    groupName: 'Spatial Effects',
  },
  // Frequency Tools
  {
    id: 'subharmonicIntensifier',
    name: 'Subharmonic Intensifier',
    description: 'Boost the bass and sub-bass frequencies in your audio. Use this bass booster to add depth and power to any track.',
    icon: TrendingDown,
    controlType: 'slider',
    parameters: [
      { name: 'intensity', label: 'Intensity', type: 'slider', defaultValue: 50, min: 0, max: 100, step: 1 }
    ],
    handlerKey: 'subharmonicIntensifier',
    groupName: 'Frequency Tools',
  },
  {
    id: 'frequencySculptor',
    name: 'Frequency Sculptor',
    description: 'Shape your sound with a 3-band equalizer (EQ). Adjust bass, mid, and treble frequencies for precise audio control.',
    icon: SlidersHorizontal,
    controlType: 'group', // Implies multiple sliders
    parameters: [
      { name: 'low', label: 'Low Gain (dB)', type: 'slider', defaultValue: 0, min: -12, max: 12, step: 0.5 },
      { name: 'mid', label: 'Mid Gain (dB)', type: 'slider', defaultValue: 0, min: -12, max: 12, step: 0.5 },
      { name: 'high', label: 'High Gain (dB)', type: 'slider', defaultValue: 0, min: -12, max: 12, step: 0.5 },
    ],
    handlerKey: 'frequencySculptor',
    groupName: 'Frequency Tools',
  },
  // Pitch & Time
  {
    id: 'keyTransposer',
    name: 'Key Transposer',
    description: 'Transpose the key of your audio up or down in semitones. Perfect for musicians and vocalists wanting to shift pitch.',
    icon: Music2, 
    controlType: 'number_input',
    parameters: [
      { name: 'semitones', label: 'Semitones', type: 'number_input', defaultValue: 0, min: -12, max: 12, step: 1 }
    ],
    handlerKey: 'keyTransposer',
    groupName: 'Pitch & Time',
  },
  {
    id: 'paceAdjuster',
    name: 'Pace Adjuster',
    description: 'Adjust tempo without changing pitch. Speed up or slow down your audio to match any project or practice needs.',
    icon: Gauge,
    controlType: 'slider',
    parameters: [
      { name: 'tempo', label: 'Tempo Adjust', type: 'slider', defaultValue: 1, min: 0.5, max: 2, step: 0.01 }
    ],
    handlerKey: 'paceAdjuster',
    groupName: 'Pitch & Time',
  },
  // Creative Effects
  {
    id: 'echoGenerator',
    name: 'Echo Generator',
    description: 'Add customizable echo and delay effects to your audio. Create depth and atmosphere with professional-quality echo controls.',
    icon: Repeat,
    controlType: 'group',
    parameters: [
      { name: 'delay', label: 'Delay (ms)', type: 'slider', defaultValue: 300, min: 10, max: 1000, step: 10 },
      { name: 'feedback', label: 'Feedback', type: 'slider', defaultValue: 0.5, min: 0, max: 0.95, step: 0.01 },
      { name: 'mix', label: 'Mix', type: 'slider', defaultValue: 0.5, min: 0, max: 1, step: 0.01 },
    ],
    handlerKey: 'echoGenerator',
    groupName: 'Creative Effects',
  },
  {
    id: 'reversePlayback',
    name: 'Reverse Playback',
    description: 'Play any audio file in reverse. Create experimental sounds or uncover hidden audio details.',
    icon: Rewind,
    controlType: 'button',
    actionLabel: 'Reverse Audio',
    handlerKey: 'reversePlayback',
    groupName: 'Creative Effects',
  },
  // Utility Tools
  {
    id: 'gainController',
    name: 'Gain Controller',
    description: 'Increase or decrease the volume of your audio with a precise gain control slider.',
    icon: Volume2,
    controlType: 'slider',
    parameters: [
      { name: 'gain', label: 'Gain (dB)', type: 'slider', defaultValue: 0, min: -24, max: 24, step: 0.5 }
    ],
    handlerKey: 'gainController',
    groupName: 'Utility Tools',
  },
   {
    id: 'audioSplitter',
    name: 'Audio Splitter',
    description: 'Cut and extract sections from your audio by selecting start and end times. Ideal for trimming music, podcasts, and samples.',
    icon: Scissors,
    controlType: 'group',
    parameters: [
      { name: 'startTime', label: 'Start Time (min)', type: 'number_input', defaultValue: 0, min: 0, step: 0.01 },
      { name: 'endTime', label: 'End Time (min)', type: 'number_input', defaultValue: 0.1, min: 0, step: 0.01 } // Default 0.1 min = 6 seconds
    ],
    handlerKey: 'audioSplitter',
    groupName: 'Utility Tools',
  },
  // Analysis Tools
  {
    id: 'rhythmDetector',
    name: 'Rhythm Detector',
    description: 'Detect and analyze the BPM (beats per minute) of any audio file. Perfect for DJs, remixes, and tempo-matching.',
    icon: HeartPulse,
    controlType: 'button',
    actionLabel: 'Analyze BPM',
    handlerKey: 'rhythmDetector',
    groupName: 'Analysis Tools',
    outputsAnalysis: true,
  },
  // Bass Boost Presets
  {
    id: 'bassBoosterPresets',
    name: 'Bass Booster',
    description: 'Choose from a range of bass booster presets to enhance low frequencies: subtle, gentle, medium, intense, or maximum bass.',
    icon: SignalLow,
    controlType: 'group', 
    groupName: 'Bass Boost Presets',
    parameters: [
      { name: 'subtleSubwoofer', label: 'Subtle Subwoofer', type: 'button', handlerKey: 'subtleSubwoofer', defaultValue: '' },
      { name: 'gentleBassBoost', label: 'Gentle Boost', type: 'button', handlerKey: 'gentleBassBoost', defaultValue: '' },
      { name: 'mediumBassEnhancement', label: 'Medium Enhancement', type: 'button', handlerKey: 'mediumBassEnhancement', defaultValue: '' },
      { name: 'intenseBassAmplifier', label: 'Intense Amplifier', type: 'button', handlerKey: 'intenseBassAmplifier', defaultValue: '' },
      { name: 'maximumBassOverdrive', label: 'Maximum Overdrive', type: 'button', handlerKey: 'maximumBassOverdrive', defaultValue: '' },
    ]
  },
  // Reverb Presets
  {
    id: 'reverbPresets',
    name: 'Reverb Presets',
    description: 'Simulate real acoustic spaces with reverb presets: vocal ambience, washroom, small room, medium room, large room, chapel hall, or cathedral.',
    icon: Building, 
    controlType: 'group', 
    groupName: 'Reverb Presets',
    parameters: [
      { name: 'vocalAmbience', label: 'Vocal Ambience', type: 'button', handlerKey: 'vocalAmbience', defaultValue: '' },
      { name: 'washroomEcho', label: 'Washroom', type: 'button', handlerKey: 'washroomEcho', defaultValue: '' },
      { name: 'compactRoomReflector', label: 'Small Room', type: 'button', handlerKey: 'compactRoomReflector', defaultValue: '' },
      { name: 'averageRoomReverberator', label: 'Medium Room', type: 'button', handlerKey: 'averageRoomReverberator', defaultValue: '' },
      { name: 'grandRoomReverb', label: 'Large Room', type: 'button', handlerKey: 'grandRoomReverb', defaultValue: '' },
      { name: 'chapelEchoes', label: 'Chapel Hall', type: 'button', handlerKey: 'chapelEchoes', defaultValue: '' }, 
      { name: 'cathedralAcoustics', label: 'Cathedral', type: 'button', handlerKey: 'cathedralAcoustics', defaultValue: '' }, 
    ]
  },
];

export const effectGroups = [
    'Creative Presets',
    'Core Effects',
    'Spatial Effects',
    'Frequency Tools',
    'Pitch & Time',
    'Creative Effects',
    'Utility Tools',
    'Analysis Tools',
    'Bass Boost Presets',
    'Reverb Presets'
];


export const fallbackIcon = HelpingHand;

// Features that might be represented differently or are not direct effects
// - Audio Upload & Processing: Handled by FileUploadArea
// - Export Configuration: Handled by ExportPanel
// - Format Shifter: Part of ExportPanel
// - Frequency Visualizer: Component in MainDisplayPanel
// - Amplitude Plotter: Component in MainDisplayPanel
// - AI Tools: Removed