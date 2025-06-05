// src/types/puter.d.ts

interface PuterAuth {
  getUser: () => Promise<any>;
  isSignedIn: () => Promise<boolean>;
  signIn: (options?: any) => Promise<any>;
  signOut: () => Promise<void>;
}

interface PuterAIChatOptions {
  model?: string;
  stream?: boolean;
  tools?: any[];
  testMode?: boolean;
}

interface PuterAIChatResponse {
  message: {
    role: string;
    content: string;
    tool_calls?: any[];
  };
  text: string; // For non-streaming response text shortcut
  // other properties if stream=true
}


interface PuterAI {
  chat: (prompt: string, options?: PuterAIChatOptions) => Promise<PuterAIChatResponse>;
  chat: (prompt: string, imageURL: string, options?: PuterAIChatOptions) => Promise<PuterAIChatResponse>;
  chat: (prompt: string, imageURL: string, testMode?: boolean, options?: PuterAIChatOptions) => Promise<PuterAIChatResponse>;
  chat: (prompt: string, imageURLArray: string[], options?: PuterAIChatOptions) => Promise<PuterAIChatResponse>;
  chat: (prompt: string, imageURLArray: string[], testMode?: boolean, options?: PuterAIChatOptions) => Promise<PuterAIChatResponse>;
  chat: (messages: Array<{role: string, content: any}>, testMode?: boolean, options?: PuterAIChatOptions) => Promise<PuterAIChatResponse>;

  img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string>;
  txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>;
  txt2speech: (text: string, language?: string, testMode?: boolean) => Promise<HTMLAudioElement>;
}

interface PuterFSItem {
  id: string;
  uid: string;
  name: string;
  path: string;
  is_dir: boolean;
  parent_id: string;
  parent_uid: string;
  created: number;
  modified: number;
  accessed: number;
  size: number | null;
  writable: boolean;
  read?: () => Promise<Blob>; // Method if item is a file
  readdir?: () => Promise<PuterFSItem[]>; // Method if item is a directory
}

interface PuterFSWriteOptions {
  overwrite?: boolean;
  dedupeName?: boolean;
  createMissingParents?: boolean;
}

interface PuterFSUploadOptions {
  // Define options if needed, e.g. for progress
}

interface PuterFS {
  copy: (source: string, destination: string, options?: any) => Promise<PuterFSItem>;
  delete: (path: string, options?: any) => Promise<void>;
  mkdir: (path: string, options?: any) => Promise<PuterFSItem>;
  move: (source: string, destination: string, options?: any) => Promise<PuterFSItem>;
  read: (path: string) => Promise<Blob>;
  readdir: (path: string) => Promise<PuterFSItem[]>;
  rename: (path: string, newName: string) => Promise<PuterFSItem>;
  stat: (path: string) => Promise<PuterFSItem>;
  upload: (items: FileList | File[] | InputFileList, dirPath?: string, options?: PuterFSUploadOptions) => Promise<PuterFSItem[]>;
  write: (path: string, data: string | File | Blob, options?: PuterFSWriteOptions) => Promise<PuterFSItem>;
}

interface PuterUI {
    alert: (message: string, buttons?: Array<{label: string, value?: any, type?: string}>) => Promise<any>;
    // ... other UI methods from docs
}

interface Puter {
  ai: PuterAI;
  auth: PuterAuth;
  fs: PuterFS;
  ui: PuterUI;
  randName: () => string;
  // ... other puter modules and properties like appID, env
}

// This is for <input type="file" />.files which is FileList
interface InputFileList extends FileList {
    item(index: number): File | null;
    [index: number]: File;
}


declare global {
  interface Window {
    puter: Puter;
  }
}

// Export empty object to make it a module
export {};
