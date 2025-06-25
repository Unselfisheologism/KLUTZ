
import type React from 'react';
import { FileUploadArea } from './FileUploadArea';
import { EffectCard } from './EffectCard';
import { effectsList, effectGroups } from '@/app/audio-forge/effects';
import type { Effect, EffectSettings } from '@/types/audio-forge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface AudioControlsPanelProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  onApplyEffect: (effectId: string, params: EffectSettings) => void;
  onParameterChange: (effectId: string, paramName: string, value: any) => void;
  effectSettings: Record<string, EffectSettings>;
  isLoading: boolean;
  isAudioLoaded: boolean;
  analysisResult: string | null;
  analysisSourceEffectId: string | null;
}

export function AudioControlsPanel({
  onFileSelect,
  selectedFile,
  onApplyEffect,
  onParameterChange,
  effectSettings,
  isLoading,
  isAudioLoaded,
  analysisResult,
  analysisSourceEffectId,
}: AudioControlsPanelProps) {
  
  const getEffectSettings = (effectId: string): EffectSettings => {
    return effectSettings[effectId] || 
           effectsList.find(e => e.id === effectId)?.parameters?.reduce((acc, param) => {
             acc[param.name] = param.defaultValue;
             return acc;
           }, {} as EffectSettings) || 
           {};
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <FileUploadArea 
            onFileSelect={onFileSelect} 
            selectedFile={selectedFile}
            isLoading={isLoading}
        />
      </div>
      <ScrollArea className="flex-grow p-4">
        <Accordion type="multiple" defaultValue={effectGroups} className="w-full space-y-4">
          {effectGroups.map((groupName) => (
            <AccordionItem value={groupName} key={groupName} className="border bg-card rounded-lg shadow">
              <AccordionTrigger className="px-4 py-3 text-base font-semibold text-primary hover:no-underline">
                <div className="flex items-baseline">
                  <span>{groupName}</span>
                  {groupName === 'Spatial Effects' && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">(Only Stereo sounds)</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-0 pb-4">
                <div className="space-y-4">
                {effectsList
                  .filter((effect) => effect.groupName === groupName)
                  .map((effect) => (
                    <EffectCard
                      key={effect.id}
                      effect={effect}
                      onApplyEffect={onApplyEffect}
                      onParameterChange={onParameterChange}
                      currentSettings={getEffectSettings(effect.id)}
                      isLoading={isLoading} 
                      isAudioLoaded={isAudioLoaded}
                      analysisResult={analysisResult}
                      analysisSourceEffectId={analysisSourceEffectId}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}