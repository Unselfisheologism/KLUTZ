import { BaseAudioGenerator, AudioGenerationRequest, AudioGenerationResponse } from './base';

/**
 * Replicate Audio Generator
 */
export class ReplicateAudioGenerator extends BaseAudioGenerator {
  /**
   * Replicate API
   * @param request audio generation request
   * @returns audio generation response
   */
  async generate(request: AudioGenerationRequest): Promise<AudioGenerationResponse> {
    const url = `https://api.replicate.com/v1/models/${request.model}/predictions`;

    const headers = {
      Authorization: `Bearer ${request.apiKey}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    };

    // switch text or prompt according to model type
    const isTextModel =
      request.model === 'minimax/speech-02-hd' ||
      request.model === 'minimax/speech-02-turbo' ||
      request.model === 'jaaari/kokoro-82m' ||
      request.model === 'haoheliu/audio-ldm';

    const isMusicModel = request.model === 'minimax/music-01';
    const isAceStepModel = request.model === 'lucataco/ace-step';

    let inputData = {};

    if (isTextModel) {
      // text
      inputData = { text: request.prompt };
    } else if (isMusicModel) {
      // minimax/music-01 lyrics song_file
      inputData = {
        lyrics: request.prompt,
        song_file:
          'https://replicate.delivery/pbxt/M9zum1Y6qujy02jeigHTJzn0lBTQOemB7OkH5XmmPSC5OUoO/MiniMax-Electronic.wav',
      };
    } else if (isAceStepModel) {
      // lucataco/ace-step lyrics tags
      inputData = {
        lyrics: request.prompt,
        tags: 'synth-pop, electronic, pop, synthesizer, drums, bass, piano, 128 BPM, energetic, uplifting, modern',
      };
    } else {
      // prompt
      inputData = { prompt: request.prompt };
    }

    const data = {
      input: inputData,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Replicate API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();

    if (!result.output) {
      const errorMessage = result.error ? `:${JSON.stringify(result.error)}` : '';
      throw new Error(`No URL${errorMessage}`);
    }

    return {
      output: Array.isArray(result.output) ? result.output[0] : result.output,
    };
  }
}
