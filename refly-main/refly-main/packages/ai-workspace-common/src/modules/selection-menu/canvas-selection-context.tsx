import React, { useCallback } from 'react';
import { Button, message } from 'antd';
import { MessageSquareDiff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReactFlow } from '@xyflow/react';
import { SelectionBubble } from './selection-bubble';
import { useSelectionContext } from './use-selection-context';
import { CanvasNode } from '../../components/canvas/nodes/shared/types';

interface CanvasSelectionContextProps {
  containerClass?: string;
  containerRef: React.RefObject<HTMLDivElement>;
  getNodeData: (text: string) => CanvasNode;
  nodeId: string;
}

export const CanvasSelectionContext: React.FC<CanvasSelectionContextProps> = ({
  containerClass,
  containerRef,
  getNodeData,
  nodeId,
}) => {
  const { t } = useTranslation();
  const { selectedText, isSelecting, addToContext } = useSelectionContext({
    containerClass,
    containerRef,
  });
  const { getNode, getZoom } = useReactFlow();

  const getNodePosition = useCallback(() => {
    try {
      const node = getNode(nodeId);
      if (!node) return null;

      const selection = window.getSelection();
      if (!selection?.rangeCount) return null;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const zoom = getZoom();

      // 基准缩放比例为 0.83 (83%)
      const baseZoom = 0.83;

      // 计算缩放比例的调整系数
      const zoomFactor = baseZoom / zoom;

      // 基准偏移量
      const baseOffsetTop = 90;
      const baseOffsetLeft = 220;

      // 根据缩放比例调整偏移量
      const adjustedOffsetTop = baseOffsetTop * zoomFactor;
      const adjustedOffsetLeft = baseOffsetLeft * zoomFactor;

      return {
        width: rect.width,
        height: rect.height,
        top: rect.top + adjustedOffsetTop,
        left: rect.left + adjustedOffsetLeft,
        right: rect.right,
        bottom: rect.bottom,
        x: rect.left,
        y: rect.top,
      };
    } catch (error) {
      console.error('Error getting node position:', error);
      return null;
    }
  }, [nodeId, getNode, getZoom]);

  const handleAddToContext = useCallback(
    (text: string) => {
      if (!text?.trim()) {
        console.warn('No text selected');
        return;
      }

      try {
        const node = getNodeData(text);
        addToContext(node);
        message.success(t('knowledgeBase.context.addToContextSuccess'));
      } catch (error) {
        console.error('Error adding to context:', error);
        message.error(t('knowledgeBase.context.addToContextError'));
      }
    },
    [getNodeData, addToContext, t],
  );

  if (!selectedText || !isSelecting) {
    return null;
  }

  return (
    <SelectionBubble
      containerRef={containerRef}
      containerClass={containerClass}
      placement="top"
      offset={[0, 10]}
      getPosition={getNodePosition}
      enabled={true}
    >
      <div
        className="refly-selector-hover-menu"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.10)',
          boxShadow: '0 2px 6px 0 rgba(0,0,0,0.10)',
          borderRadius: '8px',
          padding: '2px 4px',
        }}
      >
        <Button
          type="text"
          size="small"
          className="text-[#00968F] hover:text-[#00968F]/80"
          onClick={() => handleAddToContext(selectedText)}
          icon={<MessageSquareDiff size={12} className="text-[#00968F]" />}
        >
          <span className="font-medium text-xs text-[#00968F]">
            {t('knowledgeBase.context.addToContext')}
          </span>
        </Button>
      </div>
    </SelectionBubble>
  );
};
