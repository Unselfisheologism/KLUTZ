import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Position } from '@xyflow/react';
import { CanvasNode } from '@refly/canvas-common';
import { useNodeHoverEffect } from '@refly-packages/ai-workspace-common/hooks/canvas/use-node-hover';

import { useCanvasStoreShallow } from '@refly/stores';
import { CustomHandle } from './shared/custom-handle';
import { ImageNodeProps } from './shared/types';
import classNames from 'classnames';
import { NodeHeader } from './shared/node-header';
import { IconImage } from '@refly-packages/ai-workspace-common/components/common/icon';
import {
  nodeActionEmitter,
  createNodeEventName,
  cleanupNodeEvents,
} from '@refly-packages/ai-workspace-common/events/nodeActions';
import { useAddNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-add-node';
import { genSkillID } from '@refly/utils/id';
import { IContextItem } from '@refly/common-types';
import { useAddToContext } from '@refly-packages/ai-workspace-common/hooks/canvas/use-add-to-context';
import { useDeleteNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-delete-node';
import Moveable from 'react-moveable';
import { useSetNodeDataByEntity } from '@refly-packages/ai-workspace-common/hooks/canvas/use-set-node-data-by-entity';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';
import cn from 'classnames';
import { ImagePreview } from '@refly-packages/ai-workspace-common/components/common/image-preview';
import { useSelectedNodeZIndex } from '@refly-packages/ai-workspace-common/hooks/canvas/use-selected-node-zIndex';
import { NodeActionButtons } from './shared/node-action-buttons';
import { useGetNodeConnectFromDragCreateInfo } from '@refly-packages/ai-workspace-common/hooks/canvas/use-get-node-connect';
import { NodeDragCreateInfo } from '@refly-packages/ai-workspace-common/events/nodeOperations';
import { useNodeData } from '@refly-packages/ai-workspace-common/hooks/canvas';

const NODE_SIDE_CONFIG = { width: 320, height: 'auto' };
export const ImageNode = memo(
  ({ id, data, isPreview, selected, hideHandles, onNodeClick }: ImageNodeProps) => {
    const { metadata } = data ?? {};
    const imageUrl = metadata?.imageUrl ?? '';
    const [isHovered, setIsHovered] = useState(false);
    const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
    const { handleMouseEnter: onHoverStart, handleMouseLeave: onHoverEnd } = useNodeHoverEffect(id);
    const targetRef = useRef<HTMLDivElement>(null);
    useSelectedNodeZIndex(id, selected);
    const { addNode } = useAddNode();
    const { addToContext } = useAddToContext();
    const { deleteNode } = useDeleteNode();
    const setNodeDataByEntity = useSetNodeDataByEntity();
    const { getConnectionInfo } = useGetNodeConnectFromDragCreateInfo();
    const { readonly } = useCanvasContext();
    const { setNodeStyle } = useNodeData();

    const { operatingNodeId } = useCanvasStoreShallow((state) => ({
      operatingNodeId: state.operatingNodeId,
    }));

    const isOperating = operatingNodeId === id;

    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
      onHoverStart();
    }, [onHoverStart]);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
      onHoverEnd();
    }, [onHoverEnd]);

    const handleAddToContext = useCallback(() => {
      addToContext({
        type: 'image',
        title: data.title,
        entityId: data.entityId,
        metadata: data.metadata,
      });
    }, [data, addToContext]);

    const handleDelete = useCallback(() => {
      deleteNode({
        id,
        type: 'image',
        data,
        position: { x: 0, y: 0 },
      } as unknown as CanvasNode);
    }, [id, data, deleteNode]);

    const handleAskAI = useCallback(
      (dragCreateInfo?: NodeDragCreateInfo) => {
        const { position, connectTo } = getConnectionInfo(
          { entityId: data.entityId, type: 'image' },
          dragCreateInfo,
        );

        addNode(
          {
            type: 'skill',
            data: {
              title: 'Skill',
              entityId: genSkillID(),
              metadata: {
                contextItems: [
                  {
                    type: 'image',
                    title: data.title,
                    entityId: data.entityId,
                    metadata: data.metadata,
                  },
                ] as IContextItem[],
              },
            },
            position,
          },
          connectTo,
          false,
          true,
        );
      },
      [data, addNode, getConnectionInfo],
    );

    const handlePreview = useCallback(() => {
      setIsPreviewModalVisible(true);
    }, []);

    const handleImageClick = useCallback(() => {
      if (selected || readonly) {
        handlePreview();
      }
    }, [selected, readonly, handlePreview]);

    const onTitleChange = (newTitle: string) => {
      setNodeDataByEntity(
        {
          entityId: data.entityId,
          type: 'image',
        },
        {
          title: newTitle,
        },
      );
    };

    useEffect(() => {
      setNodeStyle(id, NODE_SIDE_CONFIG);
    }, [id, setNodeStyle]);

    // Add event handling
    useEffect(() => {
      // Create node-specific event handlers
      const handleNodeAddToContext = () => handleAddToContext();
      const handleNodeDelete = () => handleDelete();
      const handleNodeAskAI = (event?: { dragCreateInfo?: NodeDragCreateInfo }) => {
        handleAskAI(event?.dragCreateInfo);
      };
      const handleNodePreview = () => handlePreview();

      // Register events with node ID
      nodeActionEmitter.on(createNodeEventName(id, 'addToContext'), handleNodeAddToContext);
      nodeActionEmitter.on(createNodeEventName(id, 'delete'), handleNodeDelete);
      nodeActionEmitter.on(createNodeEventName(id, 'askAI'), handleNodeAskAI);
      nodeActionEmitter.on(createNodeEventName(id, 'preview'), handleNodePreview);

      return () => {
        // Cleanup events when component unmounts
        nodeActionEmitter.off(createNodeEventName(id, 'addToContext'), handleNodeAddToContext);
        nodeActionEmitter.off(createNodeEventName(id, 'delete'), handleNodeDelete);
        nodeActionEmitter.off(createNodeEventName(id, 'askAI'), handleNodeAskAI);
        nodeActionEmitter.off(createNodeEventName(id, 'preview'), handleNodePreview);

        // Clean up all node events
        cleanupNodeEvents(id);
      };
    }, [id, handleAddToContext, handleDelete, handleAskAI, handlePreview]);

    const moveableRef = useRef<Moveable>(null);

    const resizeMoveable = useCallback((width: number, height: number) => {
      moveableRef.current?.request('resizable', { width, height });
    }, []);

    useEffect(() => {
      setTimeout(() => {
        if (!targetRef.current || readonly) return;
        const { offsetWidth, offsetHeight } = targetRef.current;
        resizeMoveable(offsetWidth, offsetHeight);
      }, 1);
    }, [resizeMoveable, targetRef.current?.offsetHeight]);

    if (!data || !imageUrl) {
      return null;
    }

    return (
      <div
        onMouseEnter={!isPreview ? handleMouseEnter : undefined}
        onMouseLeave={!isPreview ? handleMouseLeave : undefined}
        style={NODE_SIDE_CONFIG}
        onClick={onNodeClick}
        className={classNames({
          relative: true,
          nowheel: isOperating && isHovered,
          'nodrag nopan select-text': isOperating,
        })}
      >
        <div className="absolute w-full -top-8 left-3 right-0 z-10 flex items-center h-8 gap-2 w-[60%]">
          <div
            className={cn(
              'flex-1 min-w-0 rounded-t-lg px-1 py-1 transition-opacity duration-200 bg-transparent',
              {
                'opacity-100': isHovered,
                'opacity-0': !isHovered,
              },
            )}
          >
            <NodeHeader
              title={data.title}
              Icon={IconImage}
              iconBgColor="#02b0c7"
              canEdit={!readonly}
              updateTitle={onTitleChange}
            />
          </div>
        </div>

        {!isPreview && !readonly && (
          <NodeActionButtons
            nodeId={id}
            nodeType="image"
            isNodeHovered={isHovered}
            isSelected={selected}
          />
        )}

        {!isPreview && !hideHandles && (
          <>
            <CustomHandle
              id={`${id}-target`}
              nodeId={id}
              type="target"
              position={Position.Left}
              isConnected={false}
              isNodeHovered={isHovered}
              nodeType="image"
            />
            <CustomHandle
              id={`${id}-source`}
              nodeId={id}
              type="source"
              position={Position.Right}
              isConnected={false}
              isNodeHovered={isHovered}
              nodeType="image"
            />
          </>
        )}

        <div className="w-full relative z-1 rounded-2xl overflow-hidden flex items-center justify-center">
          <img
            onClick={handleImageClick}
            src={imageUrl}
            alt={data.title || 'Image'}
            className="w-full h-full object-cover"
            style={{ cursor: selected || readonly ? 'pointer' : 'default' }}
          />
          {/* only for preview image */}
          {isPreviewModalVisible && !isPreview && (
            <ImagePreview
              isPreviewModalVisible={isPreviewModalVisible}
              setIsPreviewModalVisible={setIsPreviewModalVisible}
              imageUrl={imageUrl}
              imageTitle={data?.title}
            />
          )}
        </div>
      </div>
    );
  },
);

ImageNode.displayName = 'ImageNode';
