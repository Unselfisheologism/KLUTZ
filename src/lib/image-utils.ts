export const preprocessImage = (
  file: File,
  targetWidth: number,
  quality: number = 0.85 // Default JPEG quality
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file."));
      }
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const aspectRatio = img.width / img.height;
        
        canvas.width = targetWidth;
        canvas.height = targetWidth / aspectRatio;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error("Failed to get canvas context."));
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Determine output format based on original file type for transparency, default to JPEG
        let outputFormat = 'image/jpeg';
        if (file.type === 'image/png') {
          outputFormat = 'image/png';
        }
        
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => {
        reject(new Error(`Failed to load image: ${error}`));
      };
      img.src = event.target.result as string;
    };
    reader.onerror = (error) => {
      reject(new Error(`FileReader error: ${error}`));
    };
    reader.readAsDataURL(file);
  });
};
