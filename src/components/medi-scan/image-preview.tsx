import { useState } from 'react';
import type { ImageAttentionArea } from '@/types/heatmap-generator';

interface ImagePreviewProps {
  imageDataUrl: string;
  dataAiHint?: string;
  highAttentionAreas?: ImageAttentionArea[];
  lowAttentionAreas?: ImageAttentionArea[];
}

export default function ImagePreview({ 
  imageDataUrl, 
  dataAiHint = "medical image",
  highAttentionAreas,
  lowAttentionAreas 
}: ImagePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="mt-4">
      <div className="relative rounded-lg overflow-hidden border border-border">
        <img
          src={imageDataUrl}
          alt={`Preview of ${dataAiHint}`}
          className="w-full h-auto max-h-96 object-contain"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay attention areas for heatmap generator */}
        {imageLoaded && (highAttentionAreas || lowAttentionAreas) && (
          <div className="absolute inset-0 pointer-events-none">
            {/* High attention areas - red markers */}
            {highAttentionAreas?.map((area, index) => (
              <div
                key={`high-${index}`}
                className="absolute w-4 h-4 bg-red-500/70 rounded-full border-2 border-red-600"
                style={{
                  top: getLocationPosition(area.location_hint).top,
                  left: getLocationPosition(area.location_hint).left,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`High Attention: ${area.area_description}`}
              />
            ))}
            
            {/* Low attention areas - blue markers */}
            {lowAttentionAreas?.map((area, index) => (
              <div
                key={`low-${index}`}
                className="absolute w-4 h-4 bg-blue-500/70 rounded-full border-2 border-blue-600"
                style={{
                  top: getLocationPosition(area.location_hint).top,
                  left: getLocationPosition(area.location_hint).left,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`Low Attention: ${area.area_description}`}
              />
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        Preview of uploaded {dataAiHint}
      </p>
    </div>
  );
}

// Helper function to convert location hints to CSS positions
function getLocationPosition(locationHint?: string): { top: string; left: string } {
  if (!locationHint) return { top: '50%', left: '50%' };
  
  switch (locationHint.toLowerCase()) {
    case 'center':
      return { top: '50%', left: '50%' };
    case 'top-center':
      return { top: '20%', left: '50%' };
    case 'bottom-center':
      return { top: '80%', left: '50%' };
    case 'left-center':
      return { top: '50%', left: '20%' };
    case 'right-center':
      return { top: '50%', left: '80%' };
    case 'top-left':
      return { top: '20%', left: '20%' };
    case 'top-right':
      return { top: '20%', left: '80%' };
    case 'bottom-left':
      return { top: '80%', left: '20%' };
    case 'bottom-right':
      return { top: '80%', left: '80%' };
    default:
      // For custom location hints, try to parse or default to center
      return { top: '50%', left: '50%' };
  }
}