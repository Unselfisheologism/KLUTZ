
'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, PauseCircle, Download } from 'lucide-react';

interface AudioPlayerProps {
  title: string;
  audioSrc: string | null;
  fileName?: string; // For download
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function AudioPlayer({ title, audioSrc, fileName = "processed_audio.wav", onPlayStateChange }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.paused || audio.ended) {
        audio.play().catch(error => console.error("Error playing audio:", error));
      } else {
        audio.pause();
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const setAudioData = () => {
        if (isFinite(audio.duration)) {
            setDuration(audio.duration);
        } else {
            setDuration(0); // Handle Infinite or NaN duration
        }
        setCurrentTime(audio.currentTime);
      }
      const setAudioTime = () => setCurrentTime(audio.currentTime);

      const handlePlay = () => { setIsPlaying(true); onPlayStateChange?.(true); };
      const handlePause = () => { setIsPlaying(false); onPlayStateChange?.(false); };
      const handleEnded = () => { 
        setIsPlaying(false); 
        onPlayStateChange?.(false); 
        setCurrentTime(0); // Reset to beginning on end
      };
      
      audio.addEventListener('loadedmetadata', setAudioData);
      audio.addEventListener('durationchange', setAudioData); // Handle duration changes
      audio.addEventListener('timeupdate', setAudioTime);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);

      // Initial sync of play state
      if (audioSrc) {
          // Audio might already be playing or paused from previous src or autoPlay
          if (!audio.paused && !audio.ended && audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
              setIsPlaying(true);
              onPlayStateChange?.(true);
          } else {
              setIsPlaying(false);
              onPlayStateChange?.(false);
          }
          // Ensure duration is set if metadata already loaded
          if (audio.readyState >= HTMLMediaElement.HAVE_METADATA && isFinite(audio.duration)) {
            setDuration(audio.duration);
          } else {
            setDuration(0);
          }
      } else {
          setIsPlaying(false);
          onPlayStateChange?.(false);
          setCurrentTime(0);
          setDuration(0);
      }

      return () => {
        audio.removeEventListener('loadedmetadata', setAudioData);
        audio.removeEventListener('durationchange', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      }
    }
  }, [audioSrc, onPlayStateChange]);

  const formatTime = (time: number) => {
    if (!isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
        const seekTime = Number(event.target.value);
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {audioSrc ? (
          <>
            <audio ref={audioRef} src={audioSrc || undefined} className="w-full hidden" preload="metadata" />
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button onClick={togglePlayPause} className="text-primary hover:text-accent transition-colors" aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max={duration || 0} 
                value={currentTime} 
                onChange={handleSeek}
                className="flex-grow h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 min-w-[100px]"
                aria-label="Seek"
                disabled={!audioSrc || duration === 0}
              />
              <span className="text-sm text-muted-foreground min-w-[5rem] text-right flex-shrink-0">{formatTime(currentTime)} / {formatTime(duration)}</span>
               <a
                href={audioSrc}
                download={fileName}
                className={`text-primary hover:text-accent transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${!audioSrc ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Download processed audio"
                onClick={(e) => !audioSrc && e.preventDefault()}
              >
                <Download size={20} />
              </a>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No audio loaded.</p>
        )}
      </CardContent>
    </Card>
  );
}