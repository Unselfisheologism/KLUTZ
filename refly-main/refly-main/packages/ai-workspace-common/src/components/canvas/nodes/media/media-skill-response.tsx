import { memo, useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useReactFlow, Position } from '@xyflow/react';
import { CanvasNode, CanvasNodeData, ResponseNodeMeta } from '@refly/canvas-common';
import { useNodeHoverEffect } from '@refly-packages/ai-workspace-common/hooks/canvas/use-node-hover';
import {
  useNodeSize,
  MAX_HEIGHT_CLASS,
} from '@refly-packages/ai-workspace-common/hooks/canvas/use-node-size';
import { useCanvasStoreShallow } from '@refly/stores';
import { getNodeCommonStyles } from '../index';
import { CustomHandle } from '../shared/custom-handle';
import { useActionResultStoreShallow } from '@refly/stores';
import { useActionPolling } from '@refly-packages/ai-workspace-common/hooks/canvas/use-action-polling';
import { useAddNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-add-node';
import { useDeleteNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-delete-node';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';
import { useSelectedNodeZIndex } from '@refly-packages/ai-workspace-common/hooks/canvas/use-selected-node-zIndex';
import { useTranslation } from 'react-i18next';
import {
  IconImage,
  IconLoading,
  IconError,
  IconRerun,
} from '@refly-packages/ai-workspace-common/components/common/icon';
import { HiOutlineFilm, HiOutlineSpeakerWave } from 'react-icons/hi2';
import { genImageID, genVideoID, genAudioID } from '@refly/utils/id';
import { Button, Spin, message } from 'antd';
import { cn } from '@refly/utils/cn';
import { NodeProps } from '@xyflow/react';
import { CanvasNodeFilter } from '@refly/canvas-common';
import classNames from 'classnames';
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';
import {
  nodeActionEmitter,
  createNodeEventName,
} from '@refly-packages/ai-workspace-common/events/nodeActions';
import { CanvasNodeType } from '@refly/openapi-schema';
import { useSetNodeDataByEntity } from '@refly-packages/ai-workspace-common/hooks/canvas';
import { MediaType } from '@refly-packages/ai-workspace-common/events/nodeOperations';

interface MediaSkillResponseNodeMeta extends ResponseNodeMeta {
  mediaType?: MediaType;
  prompt?: string;
  model?: string;
  resultId?: string;
}

interface MediaSkillResponseNodeProps extends NodeProps {
  data: CanvasNodeData<MediaSkillResponseNodeMeta>;
  isPreview?: boolean;
  hideHandles?: boolean;
  onNodeClick?: () => void;
}

const MediaSkillResponseNode = memo(
  ({ id, data, isPreview, selected, hideHandles, onNodeClick }: MediaSkillResponseNodeProps) => {
    const { t } = useTranslation();
    const { metadata } = data ?? {};
    const { mediaType = 'image', prompt = '', model = '', resultId = '', status } = metadata ?? {};

    const [isHovered, setIsHovered] = useState(false);
    const { handleMouseEnter: onHoverStart, handleMouseLeave: onHoverEnd } = useNodeHoverEffect(id);
    const targetRef = useRef<HTMLDivElement>(null);
    const { getNode, getEdges, getNodes } = useReactFlow();
    const setNodeDataByEntity = useSetNodeDataByEntity();

    useSelectedNodeZIndex(id, selected);

    const { addNode } = useAddNode();
    const { deleteNode } = useDeleteNode();
    const { readonly } = useCanvasContext();

    const { operatingNodeId } = useCanvasStoreShallow((state) => ({
      operatingNodeId: state.operatingNodeId,
    }));

    const isOperating = operatingNodeId === id;
    const node = useMemo(() => getNode(id), [id, getNode]);

    const { containerStyle } = useNodeSize({
      id,
      node,
      readonly,
      isOperating,
      minWidth: 200,
      maxWidth: 500,
      minHeight: 120,
      defaultWidth: 180,
      defaultHeight: 180,
    });

    const { result, isPolling, removeStreamResult, removeActionResult } =
      useActionResultStoreShallow((state) => ({
        result: state.resultMap[resultId],
        isPolling: !!state.pollingStateMap[resultId]?.isPolling,
        removeStreamResult: state.removeStreamResult,
        removeActionResult: state.removeActionResult,
      }));

    const { startPolling, stopPolling, resetFailedState } = useActionPolling();

    useEffect(() => {
      if (resultId && (status === 'waiting' || status === 'executing')) {
        startPolling(resultId, 0);
      }

      return () => {
        if (resultId) {
          stopPolling(resultId);
        }
      };
    }, [resultId, status, startPolling, stopPolling]);

    // Handle polling results
    useEffect(() => {
      if (result && resultId) {
        if (result.status === 'finish' && result.outputUrl) {
          // Create appropriate media node
          handleCreateMediaNode(result.outputUrl, result.storageKey);
        } else if (result.status === 'failed') {
          // Update node to show error state
          console.error('Media generation failed:', result.errors);
        }
      }
    }, [result, resultId]);

    const handleCreateMediaNode = useCallback(
      async (outputUrl: string, storageKey: string) => {
        try {
          const entityId =
            mediaType === 'image'
              ? genImageID()
              : mediaType === 'video'
                ? genVideoID()
                : genAudioID();

          const urlKey =
            mediaType === 'image' ? 'imageUrl' : mediaType === 'video' ? 'videoUrl' : 'audioUrl';

          // Get current node position before deletion
          const currentNode = getNode(id);
          const nodePosition = currentNode?.position || { x: 0, y: 0 };

          const newNode = {
            type: mediaType as CanvasNodeType,
            data: {
              title: prompt,
              entityId,
              metadata: {
                [urlKey]: outputUrl,
                storageKey,
              },
            },
            position: nodePosition,
          };

          // Find the mediaSkill node that connects to this mediaSkillResponse node
          const edges = getEdges();
          const nodes = getNodes();

          // Find edges where current node is the target (incoming connections)
          const incomingEdges = edges?.filter((edge) => edge.target === id) ?? [];

          // Find the mediaSkill node that connects to this node
          const mediaSkillNode = nodes?.find((node) => {
            return (
              node.type === 'mediaSkill' && incomingEdges.some((edge) => edge.source === node.id)
            );
          });

          const connectedTo: CanvasNodeFilter[] = [];

          if (mediaSkillNode) {
            // Connect the new media node to the mediaSkill node's source
            connectedTo.push({
              type: 'mediaSkill' as CanvasNodeType,
              entityId: mediaSkillNode.data?.entityId as string,
              handleType: 'source',
            });
          }

          console.log('connectedTo', mediaSkillNode, connectedTo);

          // Delete this MediaSkillResponse node
          deleteNode(
            {
              id,
              type: 'mediaSkillResponse',
              data,
              position: nodePosition,
            },
            {
              showMessage: false,
            },
          );

          // Add the new media node at the same position
          addNode(newNode, connectedTo, false, true);

          message.success(
            t('canvas.nodes.mediaSkillResponse.success', 'Media generated successfully!'),
          );
        } catch (error) {
          console.error('Failed to create media node:', error);
          message.error(
            t('canvas.nodes.mediaSkillResponse.createFailed', 'Failed to create media node'),
          );
        }
      },
      [mediaType, prompt, id, data, getNode, getEdges, getNodes, addNode, deleteNode, t],
    );

    const handleRetry = useCallback(async () => {
      if (!resultId) return;

      try {
        // Reset polling state for current resultId
        resetFailedState(resultId);

        // Stop current polling
        stopPolling(resultId);

        // Remove old result from store to clear failed state
        removeStreamResult(resultId);
        removeActionResult(resultId);

        // Retry the media generation
        const { data: responseData } = await getClient().generateMedia({
          body: {
            prompt,
            mediaType,
            model,
            provider: 'replicate',
          },
        });

        if (responseData?.success && responseData?.resultId) {
          // Update node metadata with new resultId and set status to waiting
          setNodeDataByEntity(
            {
              type: 'mediaSkillResponse',
              entityId: data?.entityId,
            },
            {
              metadata: {
                ...data?.metadata,
                resultId: responseData?.resultId,
                status: 'waiting',
              },
            },
          );
        }
      } catch (error) {
        console.error('Failed to retry media generation:', error);
        message.error(t('canvas.nodes.mediaSkill.failed', 'Failed to retry generation'));
      }
    }, [
      resultId,
      prompt,
      mediaType,
      model,
      resetFailedState,
      stopPolling,
      removeStreamResult,
      removeActionResult,
      startPolling,
      setNodeDataByEntity,
      id,
      data?.metadata,
      t,
    ]);

    const handleDelete = useCallback(() => {
      if (resultId) {
        stopPolling(resultId);
      }
      deleteNode({
        id,
        type: 'mediaSkillResponse',
        data,
        position: { x: 0, y: 0 },
      } as unknown as CanvasNode);
    }, [id, data, resultId, stopPolling, deleteNode]);

    const safeContainerStyle = useMemo(() => {
      const style = { ...containerStyle };
      if (typeof style.height === 'number' && Number.isNaN(style.height)) {
        style.height = 'auto';
      }
      return style;
    }, [containerStyle]);

    useEffect(() => {
      const handleNodeRerun = () => handleRetry();
      const handleNodeDelete = () => handleDelete();

      nodeActionEmitter.on(createNodeEventName(id, 'rerun'), handleNodeRerun);
      nodeActionEmitter.on(createNodeEventName(id, 'delete'), handleNodeDelete);

      return () => {
        nodeActionEmitter.off(createNodeEventName(id, 'rerun'), handleNodeRerun);
        nodeActionEmitter.off(createNodeEventName(id, 'delete'), handleNodeDelete);
      };
    }, [id, handleRetry, handleDelete]);

    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
      onHoverStart();
    }, [onHoverStart]);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
      onHoverEnd();
    }, [onHoverEnd]);

    const getMediaIcon = useCallback(() => {
      switch (mediaType) {
        case 'image':
          return IconImage;
        case 'video':
          return HiOutlineFilm;
        case 'audio':
          return HiOutlineSpeakerWave;
        default:
          return IconImage;
      }
    }, [mediaType]);

    const getMediaTypeLabel = useCallback(() => {
      switch (mediaType) {
        case 'image':
          return t('canvas.nodes.mediaSkill.image', 'Image');
        case 'video':
          return t('canvas.nodes.mediaSkill.video', 'Video');
        case 'audio':
          return t('canvas.nodes.mediaSkill.audio', 'Audio');
        default:
          return t('canvas.nodes.mediaSkill.media', 'Media');
      }
    }, [mediaType, t]);

    if (!data) {
      return null;
    }

    const MediaIcon = getMediaIcon();
    const isGenerating =
      (result && (result.status === 'waiting' || result.status === 'executing')) ||
      status === 'waiting' ||
      status === 'executing' ||
      isPolling;
    const hasFailed = result?.status === 'failed' || status === 'failed';

    return (
      <div className={isOperating && isHovered ? 'nowheel' : ''}>
        <div
          ref={targetRef}
          onMouseEnter={!isPreview ? handleMouseEnter : undefined}
          onMouseLeave={!isPreview ? handleMouseLeave : undefined}
          style={isPreview ? { width: 320, height: 180 } : safeContainerStyle}
          onClick={onNodeClick}
          className={classNames({
            'nodrag nopan select-text': isOperating,
          })}
        >
          <div
            className={`w-full h-full ${getNodeCommonStyles({ selected: !isPreview && selected, isHovered })}`}
          >
            {!isPreview && !hideHandles && (
              <>
                <CustomHandle
                  id={`${id}-target`}
                  nodeId={id}
                  type="target"
                  position={Position.Left}
                  isConnected={false}
                  isNodeHovered={isHovered}
                  nodeType="mediaSkillResponse"
                />
                <CustomHandle
                  id={`${id}-source`}
                  nodeId={id}
                  type="source"
                  position={Position.Right}
                  isConnected={false}
                  isNodeHovered={isHovered}
                  nodeType="mediaSkillResponse"
                />
              </>
            )}

            <div className={cn('flex flex-col h-full relative box-border p-4', MAX_HEIGHT_CLASS)}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <MediaIcon className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('canvas.nodes.mediaSkill.generating', 'Generating {{type}}...', {
                      type: getMediaTypeLabel(),
                    })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{prompt}</div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {isGenerating && !hasFailed && (
                  <div className="text-center">
                    <Spin
                      indicator={<IconLoading className="animate-spin text-2xl text-green-500" />}
                      size="large"
                    />
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {t('canvas.nodes.mediaSkill.generating', 'Generating {{type}}...', {
                        type: getMediaTypeLabel(),
                      })}
                    </div>
                  </div>
                )}

                {hasFailed && (
                  <div className="text-center">
                    <IconError className="text-2xl text-red-500" />
                    <div className="text-sm text-red-600 dark:text-red-400 mb-3">
                      {t('canvas.nodes.mediaSkill.failed', 'Generation failed')}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        type="primary"
                        icon={<IconRerun className="text-xs" />}
                        onClick={handleRetry}
                      >
                        {t('common.retry', 'Retry')}
                      </Button>
                      <Button size="small" onClick={handleDelete}>
                        {t('common.delete', 'Delete')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

MediaSkillResponseNode.displayName = 'MediaSkillResponseNode';

export { MediaSkillResponseNode };
