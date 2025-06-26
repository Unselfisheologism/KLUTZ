// audioWorker.ts

// This worker handles heavy audio processing for amplitude and frequency data extraction.

self.onmessage = async (e: MessageEvent) => {
    const { type, audioBufferData, sampleRate, numPlotPoints, numBars, fftSize } = e.data;
  
    if (!audioBufferData || !sampleRate) {
      self.postMessage({ error: "Missing audioBufferData or sampleRate" });
      return;
    }
  
    if (type === "amplitude") {
      // Downsample amplitude data for plotting
      const channelData = audioBufferData[0]; // Use first channel
      const totalSamples = channelData.length;
      const pointsToRender = Math.min(numPlotPoints, totalSamples);
      const step = totalSamples / pointsToRender;
      const dataPoints = [];
  
      for (let i = 0; i < pointsToRender; i++) {
        const sampleIndex = Math.floor(i * step);
        const boundedSampleIndex = Math.min(sampleIndex, totalSamples - 1);
        const amplitudeValue = channelData[boundedSampleIndex];
        const timeMs = (boundedSampleIndex / sampleRate) * 1000;
        dataPoints.push({ time: timeMs, amplitude: amplitudeValue });
      }
  
      // Ensure last sample is included
      if (pointsToRender > 0 && dataPoints.length > 0) {
        const lastSampledIndexInLoop = Math.min(Math.floor((pointsToRender - 1) * step), totalSamples - 1);
        if (lastSampledIndexInLoop < totalSamples - 1) {
          const finalSampleIndex = totalSamples - 1;
          const amplitudeValue = channelData[finalSampleIndex];
          const timeMs = (finalSampleIndex / sampleRate) * 1000;
          if (dataPoints[dataPoints.length - 1].time < timeMs) {
            dataPoints.push({ time: timeMs, amplitude: amplitudeValue });
          }
        }
      }
  
      self.postMessage({ type: "amplitude", data: dataPoints });
    }
  
    if (type === "frequency") {
      // Compute frequency data using FFT
      // We'll use a simple FFT implementation (since we can't use WebAudio API in worker)
      // For real-world, consider importing an FFT library like fft.js or dsp.js
      // Here, we use a naive implementation for demonstration
  
      function fftMag(buffer: Float32Array, fftSize: number) {
        // Zero-pad if needed
        const N = fftSize;
        const re = new Float32Array(N);
        const im = new Float32Array(N);
        for (let i = 0; i < Math.min(buffer.length, N); i++) {
          re[i] = buffer[i];
        }
        // DFT (slow, for small N)
        const mags = new Float32Array(N / 2);
        for (let k = 0; k < N / 2; k++) {
          let sumRe = 0, sumIm = 0;
          for (let n = 0; n < N; n++) {
            const angle = (2 * Math.PI * k * n) / N;
            sumRe += re[n] * Math.cos(angle) + im[n] * Math.sin(angle);
            sumIm += -re[n] * Math.sin(angle) + im[n] * Math.cos(angle);
          }
          mags[k] = Math.sqrt(sumRe * sumRe + sumIm * sumIm);
        }
        return mags;
      }
  
      const channelData = audioBufferData[0];
      const N = fftSize || 256;
      const mags = fftMag(channelData, N);
  
      // Group into bars
      const bars = [];
      const binCount = mags.length;
      const step = Math.max(1, Math.floor(binCount / numBars));
      for (let i = 0; i < numBars; i++) {
        let sum = 0;
        const startBin = i * step;
        const endBin = Math.min(startBin + step, binCount);
        if (startBin >= binCount) break;
        for (let j = startBin; j < endBin; j++) {
          sum += mags[j];
        }
        const countInStep = endBin - startBin;
        const average = countInStep > 0 ? sum / countInStep : 0;
        // Normalize to 0-255 for display
        bars.push({ band: `${i + 1}`, level: Math.min(255, Math.max(0, average * 2)) });
      }
  
      self.postMessage({ type: "frequency", data: bars });
    }
  };
  
  export {};