
import type React from 'react';
import type { Effect, EffectParameter, EffectSettings } from '@/types/audio-forge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { fallbackIcon } from '@/app/audio-forge/effects';
import { Loader2 } from 'lucide-react';

interface EffectCardProps {
  effect: Effect;
  onApplyEffect: (effectId: string, params: EffectSettings) => void;
  onParameterChange: (effectId: string, paramName: string, value: any) => void;
  currentSettings: EffectSettings;
  isLoading: boolean;
  isAudioLoaded: boolean;
  analysisResult?: string | null;
  analysisSourceEffectId?: string | null;
}

export function EffectCard({ 
  effect, 
  onApplyEffect, 
  onParameterChange, 
  currentSettings, 
  isLoading, 
  isAudioLoaded,
  analysisResult,
  analysisSourceEffectId 
}: EffectCardProps) {
  const IconComponent = effect.icon || fallbackIcon;

  const handleSliderChange = (paramName: string, value: number[]) => {
    onParameterChange(effect.id, paramName, value[0]);
  };

  const handleInputChange = (paramName: string, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const paramConfig = effect.parameters?.find(p => p.name === paramName);
    let value: string | number = event.target.value;

    if (paramConfig?.type === 'number_input') {
      if (event.target.value === '') {
        value = ""; // Keep as empty string for controlled input
      } else {
        const parsedValue = parseFloat(event.target.value);
        // If parsing results in NaN, keep it as NaN to be handled by validation or default logic later
        // Otherwise, use the parsed number.
        value = isNaN(parsedValue) ? event.target.value : parsedValue; 
      }
    }
    onParameterChange(effect.id, paramName, value);
  };
  
  const handleInputBlur = (paramName: string, event: React.FocusEvent<HTMLInputElement>) => {
    const paramConfig = effect.parameters?.find(p => p.name === paramName);
    if (paramConfig?.type === 'number_input') {
      let value = parseFloat(event.target.value);
      if (isNaN(value)) {
        value = paramConfig.defaultValue as number; // Reset to default if invalid
      } else {
        if (paramConfig.min !== undefined) value = Math.max(paramConfig.min, value);
        if (paramConfig.max !== undefined) value = Math.min(paramConfig.max, value);
      }
      onParameterChange(effect.id, paramName, value);
    }
  };


  const handleSelectChange = (paramName: string, value: string) => {
    onParameterChange(effect.id, paramName, value);
  };

  const handleToggleChange = (paramName: string, checked: boolean) => {
    onParameterChange(effect.id, paramName, checked);
  };

  const renderParameterControl = (param: EffectParameter) => {
    const elementId = `${effect.id}-${param.name}`;
    console.log(`Generating ID: ${elementId} for effect: ${effect.name}, parameter: ${param.label}`);
    const rawValue = currentSettings[param.name] ?? param.defaultValue;
    
    switch (param.type) {
      case 'slider':
        return (
          <div key={param.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={elementId}>{param.label}</Label>
              <span className="text-sm text-muted-foreground">{Number(rawValue).toFixed(param.step && param.step < 1 ? 2 : 0)}</span>
            </div>
            <Slider
              id={elementId}
              value={[Number(rawValue)]}
              min={param.min}
              max={param.max}
              step={param.step}
              onValueChange={(val) => handleSliderChange(param.name, val)}
              disabled={isLoading || !isAudioLoaded}
            />
          </div>
        );
      case 'number_input':
        return (
          <div key={param.name} className="space-y-2">
            <Label htmlFor={elementId}>{param.label}</Label>
            <Input
              id={elementId}
              type="number"
              value={rawValue === "" || (typeof rawValue === 'number' && isNaN(rawValue)) ? "" : String(rawValue)}
              min={param.min}
              max={param.max}
              step={param.step}
              onChange={(e) => handleInputChange(param.name, e)}
              onBlur={(e) => handleInputBlur(param.name, e)}
              disabled={isLoading || !isAudioLoaded}
              className="w-full"
            />
          </div>
        );
      case 'select':
        return (
          <div key={param.name} className="space-y-2">
            <Label htmlFor={`${effect.id}-${param.name}`}>{param.label}</Label>
            <Select
              value={String(rawValue)}
              onValueChange={(val) => handleSelectChange(param.name, val)}
              disabled={isLoading || !isAudioLoaded}
            >
              <SelectTrigger id={`${effect.id}-${param.name}`}>
                <SelectValue placeholder={`Select ${param.label}`} />
              </SelectTrigger>
              <SelectContent>
                {param.options?.map(opt => (
                  <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'textarea':
        return (
          <div key={param.name} className="space-y-2">
            <Label htmlFor={`${effect.id}-${param.name}`}>{param.label}</Label>
            <Textarea
              id={`${effect.id}-${param.name}`}
              value={rawValue as string}
              placeholder={param.placeholder}
              rows={param.rows || 3}
              onChange={(e) => handleInputChange(param.name, e)}
              disabled={isLoading || !isAudioLoaded}
            />
          </div>
        );
      case 'button': 
        return (
            <Button
              key={param.name}
              variant="outline"
              size="sm"
              onClick={() => onApplyEffect(param.handlerKey || effect.id, { preset: param.name, ...currentSettings })}
              disabled={isLoading || !isAudioLoaded}
              className="w-full"
            >
              {param.label}
            </Button>
        );
      default:
        return null;
    }
  };
  
  const shouldShowApplyButton = 
    effect.parameters && effect.parameters.length > 0 && 
    !(effect.controlType === 'button' && effect.actionLabel) && 
    !(effect.controlType === 'group' && effect.parameters.every(p => p.type === 'button')) && 
    effect.controlType !== 'toggle'; 

  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle>
          {/* Changed from div to h2 for accessibility */}
          <h2 className="flex items-center gap-2 text-lg">
            <IconComponent className="h-5 w-5 text-primary" />
            {effect.name}
          </h2>
        </CardTitle>
        <CardDescription className="text-xs">{effect.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {effect.parameters?.map(renderParameterControl)}
        {effect.outputsAnalysis && effect.id === analysisSourceEffectId && analysisResult && (
          <div className="pt-3 mt-3 border-t border-border">
            <p className="text-sm font-semibold text-primary mb-1">Analysis Report:</p>
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">{analysisResult}</p>
          </div>
        )}
      </CardContent>
      
      {(effect.controlType === 'button' && effect.actionLabel && !effect.parameters?.some(p => p.type === 'button')) && (
        <CardFooter>
          <Button
            onClick={() => onApplyEffect(effect.id, currentSettings)}
            disabled={isLoading || !isAudioLoaded}
            className="w-full"
          >
            {isLoading && currentSettings?.isProcessingThis === effect.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {effect.actionLabel}
          </Button>
        </CardFooter>
      )}

      {effect.controlType === 'toggle' && effect.parameters && (
        <CardFooter className="flex items-center justify-between">
          <Label htmlFor={`${effect.id}-${effect.parameters[0].name}`}>{effect.parameters[0].label}</Label>
          <Switch
            id={`${effect.id}-${effect.parameters[0].name}`}
            checked={currentSettings[effect.parameters[0].name] ?? effect.parameters[0].defaultValue}
            onCheckedChange={(checked) => handleToggleChange(effect.parameters![0].name, checked)}
            disabled={isLoading || !isAudioLoaded}
          />
        </CardFooter>
      )}

      {shouldShowApplyButton && (
        <CardFooter>
          <Button
            onClick={() => onApplyEffect(effect.id, currentSettings)}
            disabled={isLoading || !isAudioLoaded}
            className="w-full"
          >
            {isLoading && currentSettings?.isProcessingThis === effect.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading && currentSettings?.isProcessingThis === effect.id ? 'Applying...' : `Apply ${effect.name}`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}