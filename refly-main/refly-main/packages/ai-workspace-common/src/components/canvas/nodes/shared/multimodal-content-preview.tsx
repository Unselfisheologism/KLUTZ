import { memo, useMemo } from 'react';
import { Source } from '@refly/openapi-schema';
import { Spin } from 'antd';
import { Markdown } from '@refly-packages/ai-workspace-common/components/markdown';

interface MultimodalContentPreviewProps {
  content: string;
  sources?: Source[];
  isOperating: boolean;
  className?: string;
  resultId?: string;
  metadata?: {
    contentType?: string;
    generationConfig?: any;
  };
}

// Preview components for different content types
const ImagePreview = memo(({ config }: { config?: any }) => (
  <div className="text-gray-600 text-sm">
    <div className="flex items-center gap-2 mb-2">
      <Spin className="w-4 h-4" />
      <span>Generating image...</span>
    </div>
    {config && (
      <div className="text-xs text-gray-500">
        Style: {config.style || 'realistic'} | Ratio: {config.aspectRatio || '1:1'}
      </div>
    )}
  </div>
));

const VideoPreview = memo(({ config }: { config?: any }) => (
  <div className="text-gray-600 text-sm">
    <div className="flex items-center gap-2 mb-2">
      <Spin className="w-4 h-4" />
      <span>Generating video...</span>
    </div>
    {config && (
      <div className="text-xs text-gray-500">
        Duration: {config.duration || 30}s | Ratio: {config.aspectRatio || '16:9'} | Style:{' '}
        {config.style || 'realistic'}
      </div>
    )}
  </div>
));

const AudioPreview = memo(({ config }: { config?: any }) => (
  <div className="text-gray-600 text-sm">
    <div className="flex items-center gap-2 mb-2">
      <Spin className="w-4 h-4" />
      <span>Generating audio...</span>
    </div>
    {config && (
      <div className="text-xs text-gray-500">
        Type: {config.audioType || 'music'} | Duration: {config.duration || 60}s | Mood:{' '}
        {config.mood || 'neutral'}
      </div>
    )}
  </div>
));

const TextContent = memo(
  ({
    content,
    sources,
    isOperating,
    className,
    resultId,
  }: {
    content: string;
    sources?: Source[];
    isOperating: boolean;
    className?: string;
    resultId?: string;
  }) => {
    const markdownClassName = useMemo(
      () =>
        `text-xs overflow-hidden max-h-[120px] truncate ${
          isOperating
            ? 'pointer-events-auto cursor-text select-text'
            : 'pointer-events-none select-none'
        } ${className}`,
      [isOperating, className],
    );

    return (
      <Markdown
        className={markdownClassName}
        content={content}
        sources={sources ?? []}
        resultId={resultId}
      />
    );
  },
);

export const MultimodalContentPreview = memo(
  ({
    content,
    sources,
    isOperating,
    className = '',
    resultId,
    metadata,
  }: MultimodalContentPreviewProps) => {
    const contentType = metadata?.contentType || 'text';
    const generationConfig = metadata?.generationConfig;

    const renderContent = () => {
      switch (contentType) {
        case 'image':
          return <ImagePreview config={generationConfig} />;
        case 'video':
          return <VideoPreview config={generationConfig} />;
        case 'audio':
          return <AudioPreview config={generationConfig} />;
        default:
          return (
            <TextContent
              content={content}
              sources={sources}
              isOperating={isOperating}
              className={className}
              resultId={resultId}
            />
          );
      }
    };

    return <div className="multimodal-content-preview">{renderContent()}</div>;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.content === nextProps.content &&
      prevProps.isOperating === nextProps.isOperating &&
      prevProps.className === nextProps.className &&
      JSON.stringify(prevProps.sources) === JSON.stringify(nextProps.sources) &&
      JSON.stringify(prevProps.metadata) === JSON.stringify(nextProps.metadata)
    );
  },
);
