
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Settings2, Repeat as LoopIcon } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Keep this import

interface ExportPanelProps {
  processedAudioDataUrl: string | null;
  onExport: (format: string, quality: string, loopCount: number) => void;
  isLoading: boolean;
}

export function ExportPanel({ processedAudioDataUrl, onExport, isLoading }: ExportPanelProps) {
  const [format, setFormat] = useState('wav');
  const [quality, setQuality] = useState('high');
  const [loopCount, setLoopCount] = useState(1);

  const handleExportClick = () => {
    if (processedAudioDataUrl) {
      // For large files, consider exporting in a Web Worker
      onExport(format, quality, loopCount);
    }
  };

  const handleLoopCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      value = 1; // Default to 1 if input is not a number
    }
    value = Math.max(1, Math.min(10, value)); // Clamp between 1 and 10
    setLoopCount(value);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Settings2 className="text-primary" />
          Export Configuration
        </CardTitle>
        <CardDescription>Choose your preferred output settings and loop options.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat} disabled={isLoading || !processedAudioDataUrl}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wav">WAV</SelectItem>
                <SelectItem value="mp3">MP3</SelectItem>
                <SelectItem value="flac">FLAC</SelectItem>
                <SelectItem value="ogg">OGG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="quality">Quality</Label>
            <Select value={quality} onValueChange={setQuality} disabled={isLoading || !processedAudioDataUrl || format !== 'mp3'}> {/* Quality typically for lossy like MP3 */}
              <SelectTrigger id="quality">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (320kbps)</SelectItem>
                <SelectItem value="medium">Medium (192kbps)</SelectItem>
                <SelectItem value="low">Low (128kbps)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="loop-count" className="flex items-center gap-1">
            <LoopIcon className="h-4 w-4" />
            Number of Loops
          </Label>
          <Input
            id="loop-count"
            type="number"
            min="1"
            max="10"
            value={loopCount}
            onChange={handleLoopCountChange}
            onBlur={(e) => { // Ensure value is clamped on blur if user types something out of range
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 1) value = 1;
                if (value > 10) value = 10;
                setLoopCount(value);
            }}
            disabled={isLoading || !processedAudioDataUrl}
            className="w-full sm:w-1/2"
          />
          <p className="text-xs text-muted-foreground">Set how many times the audio should loop (1-10 times). 1 means no looping.</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleExportClick}
          disabled={!processedAudioDataUrl || isLoading}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Audio
        </Button>
      </CardFooter>
    </Card>

  );
}