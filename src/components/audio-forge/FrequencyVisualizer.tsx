
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartBig } from 'lucide-react';

interface FunctionalFrequencyVisualizerProps {
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
}

const chartConfig = {
  level: { label: "Level (dB)", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const NUM_BARS = 32; // Number of bars to display
const FFT_SIZE = 256; // Must be a power of 2. frequencyBinCount = FFT_SIZE / 2;

export function FunctionalFrequencyVisualizer({ audioBuffer, isPlaying }: FunctionalFrequencyVisualizerProps) {
  const [frequencyData, setFrequencyData] = useState<{ band: string; level: number }[]>(
    Array(NUM_BARS).fill(null).map((_, i) => ({ band: `${i + 1}`, level: 0 }))
  );
  const workerRef = useRef<Worker | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup function for the effect
    const cleanup = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      setFrequencyData(Array(NUM_BARS).fill(null).map((_, i) => ({ band: `${i + 1}`, level: 0 })));
    };

    if (!audioBuffer || !isPlaying) {
      cleanup();
      return;
    }

    // Create worker if not exists
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('@/workers/audioWorker.ts', import.meta.url));
    }
    const worker = workerRef.current;

    // Prepare transferable data
    const channelData = audioBuffer.getChannelData(0);
    const channelCopy = new Float32Array(channelData.length);
    channelCopy.set(channelData);

    let stopped = false;

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === "frequency" && !stopped) {
        setFrequencyData(e.data.data);
      }
    };

    // Animation loop to simulate real-time updates while playing
    const updateFrequency = () => {
      worker.postMessage({
        type: "frequency",
        audioBufferData: [channelCopy],
        sampleRate: audioBuffer.sampleRate,
        numBars: NUM_BARS,
        fftSize: FFT_SIZE,
      });
      animationFrameIdRef.current = requestAnimationFrame(updateFrequency);
    };

    updateFrequency();

    return () => {
      stopped = true;
      cleanup();
      // Optionally terminate worker if you want to clean up
      // worker.terminate();
    };
  }, [audioBuffer, isPlaying]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <BarChartBig className="text-primary h-5 w-5" />
          <span className="text-xl">Frequency Visualizer</span>
          <span className="text-sm text-muted-foreground ml-1">(Play an audio)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[200px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart accessibilityLayer data={frequencyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} barGap={2}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis 
                dataKey="band" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                fontSize={10} 
                interval="preserveStartEnd" 
            />
            <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                width={30} 
                fontSize={10} 
                domain={[0, 255]} 
            />
            <ChartTooltip 
                cursor={false} 
                content={<ChartTooltipContent indicator="dot" hideLabel />} 
            />
            <Bar dataKey="level" fill="var(--color-level)" radius={1} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}