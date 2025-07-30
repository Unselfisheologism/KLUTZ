import { CanvasNodeData, ResponseNodeMeta } from '@refly/canvas-common';

// Navigation context for copilot
export interface NavigationContext {
  type: 'canvas' | 'document' | 'project' | 'global';
  id?: string;
  title?: string;
  metadata?: Record<string, any>;
}

// Locale types
export type OutputLocale = 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru';

// Project directory types
export interface SourceObject {
  id: string;
  type: string;
  name: string;
  path?: string;
  children?: SourceObject[];
  metadata?: Record<string, any>;
}

// Message intent source for chat
export enum MessageIntentSource {
  Canvas = 'canvas',
  Document = 'document',
  Project = 'project',
  Global = 'global',
  Search = 'search',
}

export interface SiderData {
  id: string;
  name: string;
  updatedAt: string;
  type: 'canvas' | 'document' | 'resource' | 'project';
  description?: string;
  coverUrl?: string;
}

export enum SettingsModalActiveTab {
  Language = 'language',
  Subscription = 'subscription',
  Account = 'account',
  ModelProviders = 'modelProviders',
  ModelConfig = 'modelConfig',
  ParserConfig = 'parserConfig',
  DefaultModel = 'defaultModel',
  McpServer = 'mcpServer',
  Appearance = 'appearance',
}

export interface LinearThreadMessage {
  id: string;
  resultId: string;
  nodeId: string;
  timestamp: number;
  data: CanvasNodeData<ResponseNodeMeta>;
}
