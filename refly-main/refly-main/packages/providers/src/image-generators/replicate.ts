import { BaseImageGenerator, ImageGenerationRequest, ImageGenerationResponse } from './base';

export class ReplicateImageGenerator extends BaseImageGenerator {
  async generate(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const url = `https://api.replicate.com/v1/models/${request.model}/predictions`;

    const headers = {
      Authorization: `Bearer ${request.apiKey}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    };

    const data = {
      input: {
        prompt: request.prompt,
        aspectRatio: request.aspectRatio,
      },
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
