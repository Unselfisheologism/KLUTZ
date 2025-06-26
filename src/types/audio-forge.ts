import type { LucideIcon } from 'lucide-react';

export type ControlType = 'slider' | 'button' | 'toggle' | 'select' | 'number_input' | 'group' | 'textarea';

export interface EffectParameterOption {
  value: string | number;
  label: string;
}

export interface EffectParameter {
  name: string;
  label: string;
  type: 'slider' | 'number_input' | 'select' | 'textarea' | 'button'; // Added 'button' for grouped buttons
  defaultValue: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: EffectParameterOption[];
  placeholder?: string;
  rows?: number;
  handlerKey?: string; // For buttons within a group that have specific actions
}

export interface Effect {
  id: string;
  name:string;
  description: string;
  icon: LucideIcon;
  controlType: ControlType;
  parameters?: EffectParameter[];
  actionLabel?: string; // For buttons
  handlerKey?: string; // Key to map to a handler function
  groupName?: string; // For grouping effects in UI
  outputsAnalysis?: boolean; // If tool outputs analysis text
}

export interface EffectSettings {
  [key: string]: any;
}