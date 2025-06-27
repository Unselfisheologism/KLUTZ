export type TextToSpeechInput =
  | { type: 'text'; content: string }
  | { type: 'file'; file: File };

export type TextToSpeechOutput = {
  type: 'audio';
  audioData: ArrayBuffer; // Or Blob, or a stream type depending on implementation
};

export type TextToSpeechError = {
  type: 'error';
  message: string;
  details?: string;
};

export type TextToSpeechResult = TextToSpeechOutput | TextToSpeechError;