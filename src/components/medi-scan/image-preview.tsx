
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';
import type { ImageAttentionArea } from '@/types/heatmap-generator'; // Import the type

interface ImagePreviewProps {
  imageDataUrl: string | null;
  altText?: string;
  dataAiHint?: string;
  highAttentionAreas?: ImageAttentionArea[];
  lowAttentionAreas?: ImageAttentionArea[];
}

const getLocationStyles = (hint: ImageAttentionArea['location_hint']): React.CSSProperties => {
  const size = '8%'; // Size of the marker
  const offset = '2%'; // Offset from edges

  switch (hint) {
    case 'center': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: size, height: size };
    case 'top-left': return { top: offset, left: offset, width: size, height: size };
    case 'top-right': return { top: offset, right: offset, width: size, height: size };
    case 'bottom-left': return { bottom: offset, left: offset, width: size, height: size };
    case 'bottom-right': return { bottom: offset, right: offset, width: size, height: size };
    case 'top-center': return { top: offset, left: '50%', transform: 'translateX(-50%)', width: size, height: size };
    case 'bottom-center': return { bottom: offset, left: '50%', transform: 'translateX(-50%)', width: size, height: size };
    case 'left-center': return { top: '50%', left: offset, transform: 'translateY(-50%)', width: size, height: size };
    case 'right-center': return { top: '50%', right: offset, transform: 'translateY(-50%)', width: size, height: size };
    default: return { display: 'none' }; // Hide if hint is not recognized or too general
  }
};

export default function ImagePreview({ 
  imageDataUrl, 
  altText = "Uploaded image", 
  dataAiHint = "image",
  highAttentionAreas,
  lowAttentionAreas
}: ImagePreviewProps) {
  const allAreas = [
    ...(highAttentionAreas || []).map(area => ({ ...area, type: 'high' as const })),
    ...(lowAttentionAreas || []).map(area => ({ ...area, type: 'low' as const }))
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <ImageIcon className="mr-2 h-5 w-5 text-primary" />
          Image Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {imageDataUrl ? (
          <div className="relative aspect-video w-full rounded-md overflow-hidden border border-border">
            <Image
              src={imageDataUrl}
              alt={altText}
              fill={true}
              style={{ objectFit: 'contain' }}
              data-ai-hint={dataAiHint}
              priority // Preload the image as it's key content
            />
            {allAreas.map((area, index) => (
              area.location_hint && (
                <div
                  key={`${area.type}-${index}`}
                  title={`${area.type === 'high' ? 'High' : 'Low'} Attention: ${area.area_description}`}
                  className={`absolute rounded-full pointer-events-none border-2 border-white/70 shadow-lg
                    ${area.type === 'high' ? 'bg-red-500/50' : 'bg-blue-500/50'}`}
                  style={getLocationStyles(area.location_hint)}
                />
              )
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-border rounded-md bg-muted/50">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No image selected</p>
          </div>
        )}
         {(highAttentionAreas || lowAttentionAreas) && (highAttentionAreas?.length || 0) + (lowAttentionAreas?.length || 0) > 0 && (
            <div className="mt-3 flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500/70 mr-1.5"></span> High Attention</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500/70 mr-1.5"></span> Low Attention</span>
                <span>(Approximate visual cues)</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
