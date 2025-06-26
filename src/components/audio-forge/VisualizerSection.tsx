'use client';

import { FunctionalFrequencyVisualizer } from './FrequencyVisualizer';
import { FunctionalAmplitudePlotter } from './AmplitudePlotter'; 

interface VisualizerSectionProps {
  originalAudioBuffer: AudioBuffer | null;
  processedAudioBuffer: AudioBuffer | null;
  isOriginalAudioPlaying: boolean;
  isProcessedAudioPlaying: boolean;
}

export function VisualizerSection({ 
  originalAudioBuffer, 
  processedAudioBuffer, 
  isOriginalAudioPlaying, 
  isProcessedAudioPlaying 
}: VisualizerSectionProps) {

  let bufferForFreqViz: AudioBuffer | null = null;
  let isPlayingForFreqViz = false;

  if (isProcessedAudioPlaying && processedAudioBuffer) {
    bufferForFreqViz = processedAudioBuffer;
    isPlayingForFreqViz = true;
  } else if (isOriginalAudioPlaying && originalAudioBuffer) {
    bufferForFreqViz = originalAudioBuffer;
    isPlayingForFreqViz = true;
  }

  // Amplitude plotter shows processed if available, otherwise original (static view)
  const bufferForAmplitudePlotter = processedAudioBuffer ?? originalAudioBuffer;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FunctionalFrequencyVisualizer 
        audioBuffer={bufferForFreqViz} 
        isPlaying={isPlayingForFreqViz} 
      />
      <FunctionalAmplitudePlotter 
        audioBuffer={bufferForAmplitudePlotter} 
      />
    </div>
  );
}