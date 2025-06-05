import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

interface ImagePreviewProps {
  imageDataUrl: string | null;
}

export default function ImagePreview({ imageDataUrl }: ImagePreviewProps) {
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
              alt="Uploaded medical scan"
              layout="fill"
              objectFit="contain"
              data-ai-hint="medical scan"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-border rounded-md bg-muted/50">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No image selected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
