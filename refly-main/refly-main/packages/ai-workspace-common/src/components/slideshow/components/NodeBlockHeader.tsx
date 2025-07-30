import React, { memo, useCallback } from 'react';
import { Button, Dropdown, Popconfirm } from 'antd';
import type { MenuProps } from 'antd';
import {
  MoreHorizontal,
  X,
  Maximize2,
  Minimize2,
  FileText,
  Sparkles,
  Wrench,
  Trash2,
} from 'lucide-react';
import { NODE_COLORS } from '@refly-packages/ai-workspace-common/components/canvas/nodes/shared/colors';
import { NodeHeader } from '@refly-packages/ai-workspace-common/components/canvas/nodes/shared/node-header';
import { type NodeRelation } from './ArtifactRenderer';
import {
  IconWideMode,
  IconDocument,
  IconResource,
  IconResponse,
  IconCodeArtifact,
  IconWebsite,
} from '@refly-packages/ai-workspace-common/components/common/icon';
import { useTranslation } from 'react-i18next';

// Get node icon component
const getNodeIcon = (nodeType: string) => {
  switch (nodeType) {
    case 'document':
      return IconDocument;
    case 'resource':
      return IconResource;
    case 'skillResponse':
      return IconResponse;
    case 'toolResponse':
      return IconResponse;
    case 'codeArtifact':
      return IconCodeArtifact;
    case 'website':
      return IconWebsite;
    case 'skill':
      // We can return different icons based on skillType, but we simplify it for now
      return Sparkles;
    case 'tool':
      return Wrench;
    default:
      return FileText;
  }
};

// Get node title
const getNodeTitle = (node: NodeRelation) => {
  const { t } = useTranslation();
  return node.nodeData?.title || t('pages.components.nodeBlock.untitledNode');
};

interface NodeBlockHeaderProps {
  node: NodeRelation;
  onClose?: () => void;
  onMaximize?: () => void;
  onWideMode?: () => void;
  isMaximized?: boolean;
  isWideMode?: boolean;
  isMinimap?: boolean;
  onDelete?: (nodeId: string) => void;
}

export const NodeBlockHeader: React.FC<NodeBlockHeaderProps> = memo(
  ({
    node,
    onClose,
    onMaximize,
    onWideMode,
    isMaximized = false,
    isWideMode = false,
    isMinimap = false,
    onDelete,
  }) => {
    const { t } = useTranslation();
    const IconComponent = getNodeIcon(node.nodeType);
    const nodeColor = NODE_COLORS[node.nodeType as keyof typeof NODE_COLORS] || '#17B26A';
    const title = getNodeTitle(node);

    // Handle title update
    const handleTitleUpdate = useCallback((newTitle: string) => {
      // Logic for title update can be added here
      console.log('Title updated:', newTitle);
    }, []);

    // Define dropdown menu items
    const menuItems: MenuProps['items'] = onDelete
      ? [
          {
            key: 'delete',
            label: (
              <Popconfirm
                title={t('pages.components.nodeBlock.confirmDelete')}
                description={t('pages.components.nodeBlock.confirmDeleteContent')}
                onConfirm={() => onDelete(node.nodeId)}
                okText={t('common.confirm')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true }}
              >
                <div className="flex items-center gap-2 text-red-600 whitespace-nowrap">
                  <Trash2 className="w-4 h-4 flex-shrink-0" />
                  <span>{t('pages.components.nodeBlock.deleteNode')}</span>
                </div>
              </Popconfirm>
            ),
          },
        ]
      : [];

    // If in minimap mode, don't display header
    if (isMinimap) {
      return null;
    }

    return (
      <div className="flex justify-between items-center py-2 px-4 border-b border-[#EAECF0] relative">
        {/* Left: Icon and Title */}
        <div className="flex items-center gap-2 flex-grow overflow-hidden">
          <div className="flex-grow overflow-hidden">
            <NodeHeader
              source="node"
              title={title}
              Icon={IconComponent}
              iconBgColor={nodeColor}
              canEdit={false}
              updateTitle={handleTitleUpdate}
            />
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {onWideMode && (
            <Button
              type="text"
              className={`p-1.5 hover:bg-gray-100 ${isWideMode ? 'text-primary-600' : 'text-gray-500'}`}
              onClick={onWideMode}
              title={t('pages.components.nodeBlock.wideModeView')}
            >
              <IconWideMode className="w-4 h-4" />
            </Button>
          )}
          {onMaximize && (
            <Button
              type="text"
              className={`p-1.5 hover:bg-gray-100 ${isMaximized ? 'text-primary-600' : 'text-gray-500'}`}
              onClick={onMaximize}
              title={t('pages.components.nodeBlock.slideshowPreview')}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}

          {menuItems?.length > 0 && (
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
              overlayClassName="min-w-[160px] w-max"
              getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
              dropdownRender={(menu) => (
                <div className="min-w-[160px] bg-white rounded-lg border-[0.5px] border-[rgba(0,0,0,0.03)] shadow-lg">
                  {menu}
                </div>
              )}
            >
              <Button type="text" className="p-1.5 hover:bg-gray-100 text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </Dropdown>
          )}
          {onClose && (
            <Button type="text" className="p-1.5 hover:bg-gray-100 text-gray-500" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  },
);

NodeBlockHeader.displayName = 'NodeBlockHeader';
