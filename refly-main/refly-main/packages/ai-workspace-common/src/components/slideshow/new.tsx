import { useState, useEffect } from 'react';
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';
import { CanvasNode } from '@refly/openapi-schema';
import {
  useGetPageByCanvasId,
  useAddNodesToCanvasPage,
} from '@refly-packages/ai-workspace-common/queries/queries';
import { Card, Button, Input, Checkbox, Divider, Badge, Tooltip, message } from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// 步骤指示器组件
const StepIndicator = ({
  currentStep,
  totalSteps,
}: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-lg p-4 dark:bg-gray-950">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <div key={index} className="flex items-center">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            index + 1 <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {index + 1}
        </div>
        {index < totalSteps - 1 && (
          <div
            className={`h-1 w-16 mx-2 ${index + 1 < currentStep ? 'bg-blue-500' : 'bg-gray-200'}`}
          />
        )}
      </div>
    ))}
  </div>
);

// 加载指示器组件
const Spinner = ({ size = 'normal' }: { size?: 'small' | 'normal' }) => (
  <div
    className={`animate-spin rounded-full border-t-2 border-blue-500 ${
      size === 'small' ? 'h-4 w-4' : 'h-6 w-6'
    }`}
  />
);

export default function CanvasPageTest() {
  const [canvasId, setCanvasId] = useState('');
  const [nodeIds, setNodeIds] = useState<string[]>([]);
  const [availableNodes, setAvailableNodes] = useState<CanvasNode[]>([]);
  const [loading, setCanvasLoading] = useState(false);
  const [_error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // 1. 使用 getPageByCanvasId 查询 Canvas 关联的 Page
  const {
    data: pageData,
    isLoading: isPageLoading,
    refetch: refetchPage,
  } = useGetPageByCanvasId(
    {
      path: { canvasId: canvasId || 'placeholder' },
    },
    undefined,
    {
      enabled: false, // 不自动查询，等用户点击按钮
      onError: (err) => {
        console.error('Failed to get page by canvas ID:', err);
        setError(`获取页面失败: ${err instanceof Error ? err.message : String(err)}`);
        messageApi.error('获取页面失败，请检查 Canvas ID 是否正确');
      },
      onSuccess: () => {
        setCurrentStep(Math.max(currentStep, 2));
      },
    },
  );

  // 2. 使用 addNodesToCanvasPage 为 Canvas 添加节点
  const { mutate: addNodes, isPending: isAddingNodes } = useAddNodesToCanvasPage(undefined, {
    onSuccess: () => {
      setSuccess('节点添加成功！');
      messageApi.success('节点添加成功！');
      // 添加成功后重新获取页面数据
      if (canvasId) {
        refetchPage();
      }
      setCurrentStep(3);
    },
    onError: (error) => {
      console.error('Failed to add nodes:', error);
      setError(`添加节点失败: ${error instanceof Error ? error.message : String(error)}`);
      messageApi.error('添加节点失败，请重试');
    },
  });

  // 加载 Canvas 数据获取可用节点
  const fetchCanvasData = async () => {
    if (!canvasId.trim()) {
      setAvailableNodes([]);
      return;
    }

    try {
      setCanvasLoading(true);
      setError('');
      const client = getClient();

      // 调用 API 获取 Canvas 数据
      const response = await client.getCanvasData({
        query: { canvasId },
      });

      const data = response?.data;

      if (data?.success && data?.data) {
        const canvasData = data.data;

        if (canvasData.nodes && Array.isArray(canvasData.nodes)) {
          const nodes = canvasData.nodes;
          const validNodes = nodes.filter(
            (node: any) => node?.type && node.data && node.data.entityId,
          );

          if (validNodes.length > 0) {
            setAvailableNodes(validNodes as CanvasNode[]);
            messageApi.success(`成功加载 ${validNodes.length} 个节点`);
            setCurrentStep(Math.max(currentStep, 2));
          } else {
            setError('没有找到有效的节点');
            messageApi.warning('没有找到有效的节点');
            setAvailableNodes([]);
          }
        } else {
          setError('没有找到节点');
          messageApi.warning('没有找到节点');
          setAvailableNodes([]);
        }
      } else {
        setError('无效的 API 响应');
        messageApi.error('获取数据失败，请检查 Canvas ID 是否正确');
        setAvailableNodes([]);
      }
    } catch (err) {
      console.error('Failed to fetch Canvas data:', err);
      setError(`获取 Canvas 数据失败: ${err instanceof Error ? err.message : String(err)}`);
      messageApi.error('获取 Canvas 数据失败，请稍后重试');
      setAvailableNodes([]);
    } finally {
      setCanvasLoading(false);
    }
  };

  // 处理节点选择
  const handleNodeToggle = (nodeId: string) => {
    setNodeIds((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId],
    );
  };

  const navigatePage = (pageId?: string) => {
    navigate(`/pages/${pageId}`);
  };

  // 获取 Canvas 关联的 Page
  const handleGetPage = () => {
    if (!canvasId.trim()) {
      setError('请输入 Canvas ID');
      messageApi.warning('请输入 Canvas ID');
      return;
    }

    setError('');
    setSuccess('');
    refetchPage();
  };

  // 添加节点到 Canvas 关联的 Page
  const handleAddNodes = () => {
    if (!canvasId.trim()) {
      setError('请输入 Canvas ID');
      messageApi.warning('请输入 Canvas ID');
      return;
    }

    if (nodeIds.length === 0) {
      setError('请至少选择一个节点');
      messageApi.warning('请至少选择一个节点');
      return;
    }

    setError('');
    setSuccess('');

    addNodes({
      path: { canvasId },
      body: { nodeIds },
    });
  };

  // 自动聚焦到输入框
  useEffect(() => {
    const inputElement = document.getElementById('canvasId');
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  // 当 canvasId 变化且不为空时自动调用 fetchCanvasData
  useEffect(() => {
    fetchCanvasData();
    refetchPage();
  }, [canvasId]);

  // 根据节点类型获取颜色
  const getNodeTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      document: 'blue',
      codeArtifact: 'purple',
      website: 'cyan',
      resource: 'green',
      skill: 'orange',
      skillResponse: 'gold',
      toolResponse: 'lime',
      memo: 'volcano',
      group: 'geekblue',
      image: 'magenta',
      mindMap: 'red',
    };

    return typeColors[type] || 'default';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {contextHolder}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Canvas-Page 接口测试</h1>
        <Tooltip title="测试 Canvas 和 Page 之间的关联关系">
          <InfoCircleOutlined className="text-gray-400 text-xl" />
        </Tooltip>
      </div>

      <StepIndicator currentStep={currentStep} totalSteps={3} />

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 flex items-center">
          <div className="text-green-500 mr-2">✓</div>
          {success}
        </div>
      )}

      {/* {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 flex items-center">
          <div className="text-red-500 mr-2">✗</div>
          {error}
        </div>
      )} */}

      <Card className="mb-6 shadow-sm" title="步骤 1: 输入 Canvas ID 并加载数据">
        <div className="flex gap-2 items-center">
          <Input
            id="canvasId"
            value={canvasId}
            onChange={(e) => setCanvasId(e.target.value)}
            placeholder="输入 Canvas ID"
            prefix={<SearchOutlined className="text-gray-400" />}
            className="flex-1"
            onPressEnter={fetchCanvasData}
            disabled={loading}
          />
          <Button
            type="primary"
            onClick={fetchCanvasData}
            disabled={loading || !canvasId.trim()}
            icon={loading ? <Spinner size="small" /> : <ReloadOutlined />}
          >
            加载节点
          </Button>
          <Button
            onClick={handleGetPage}
            disabled={isPageLoading || !canvasId.trim()}
            icon={isPageLoading ? <Spinner size="small" /> : <SearchOutlined />}
          >
            获取关联页面
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 显示页面数据 */}
        <Card
          className="shadow-sm"
          title={
            <div className="flex items-center">
              <span>步骤 2: 页面数据</span>
              {pageData?.data && (
                <Badge
                  count={pageData.data.nodeRelations?.length || 0}
                  className="ml-2"
                  style={{ backgroundColor: '#108ee9' }}
                />
              )}
            </div>
          }
        >
          {pageData?.data ? (
            <div>
              <div
                className="mb-2 flex justify-between cursor-pointer"
                onClick={() =>
                  pageData?.data?.page?.pageId && navigatePage(pageData?.data?.page?.pageId)
                }
              >
                <span className="font-medium">页面 ID:</span>
                <span className="text-gray-700">
                  {pageData.data.page ? pageData.data.page.pageId : '无关联页面'}
                </span>
              </div>

              {pageData.data.page && (
                <div className="mb-2 flex justify-between">
                  <span className="font-medium">标题:</span>
                  <span className="text-gray-700">{pageData.data.page.title}</span>
                </div>
              )}

              <Divider className="my-3" />

              {pageData.data.nodeRelations && pageData.data.nodeRelations.length > 0 ? (
                <div>
                  <h3 className="text-md font-medium mb-2">节点关系:</h3>
                  <div className="max-h-60 overflow-y-auto pr-2">
                    {pageData.data.nodeRelations.map((relation) => (
                      <div
                        key={relation.relationId}
                        className="mb-2 p-2 bg-gray-50 dark:bg-gray-950 rounded-md border border-gray-100 flex items-center justify-between"
                      >
                        <div className="truncate max-w-[70%]" title={relation.nodeId}>
                          {relation.nodeId}
                        </div>
                        <Badge
                          color={getNodeTypeColor(relation.nodeType)}
                          text={relation.nodeType}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">暂无节点关系</div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {isPageLoading ? (
                <div className="flex flex-col items-center">
                  <Spinner />
                  <span className="mt-2">加载中...</span>
                </div>
              ) : (
                <span>请先获取页面数据</span>
              )}
            </div>
          )}
        </Card>

        {/* 节点选择区域 */}
        <Card
          className="shadow-sm"
          title={
            <div className="flex items-center justify-between">
              <span>步骤 3: 选择节点</span>
              <div>
                {availableNodes.length > 0 && (
                  <div className="text-xs text-gray-500">
                    已选择: {nodeIds.length}/{availableNodes.length}
                  </div>
                )}
              </div>
            </div>
          }
          extra={
            availableNodes.length > 0 && (
              <div className="flex gap-2">
                <Button
                  size="small"
                  onClick={() => setNodeIds(availableNodes.map((node) => node.data.entityId))}
                  disabled={nodeIds.length === availableNodes.length}
                >
                  全选
                </Button>
                <Button size="small" onClick={() => setNodeIds([])} disabled={nodeIds.length === 0}>
                  清空
                </Button>
              </div>
            )
          }
        >
          {availableNodes.length > 0 ? (
            <div>
              <div className="max-h-60 overflow-y-auto pr-1">
                {availableNodes.map((node) => (
                  <div
                    key={node.data.entityId}
                    className="mb-2 p-2 hover:bg-gray-50 rounded-md border border-gray-100 transition-colors dark:hover:bg-gray-950 dark:border-gray-800"
                  >
                    <Checkbox
                      checked={nodeIds.includes(node.data.entityId)}
                      onChange={() => handleNodeToggle(node.data.entityId)}
                      className="w-full"
                    >
                      <div className="ml-2">
                        <div className="font-medium truncate" title={node.data.title || '无标题'}>
                          {node.data.title || '无标题'}
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <Badge color={getNodeTypeColor(node.type)} text={node.type} />
                          <Tooltip title={node.data.entityId}>
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">
                              {node.data.entityId.substring(0, 10)}...
                            </span>
                          </Tooltip>
                        </div>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </div>

              <Divider className="my-3" />

              <Button
                type="primary"
                icon={isAddingNodes ? <Spinner size="small" /> : <PlusOutlined />}
                onClick={handleAddNodes}
                disabled={isAddingNodes || nodeIds.length === 0 || !canvasId.trim()}
                className="w-full"
              >
                添加节点到页面
              </Button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {loading ? (
                <div className="flex flex-col items-center">
                  <Spinner />
                  <span className="mt-2">加载中...</span>
                </div>
              ) : (
                <span>请先加载 Canvas 数据</span>
              )}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6 shadow-sm bg-gray-50 dark:bg-gray-950" title="使用说明">
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-200">
          <li>输入有效的 Canvas ID 并点击"加载节点"按钮</li>
          <li>点击"获取关联页面"查看是否已有关联页面</li>
          <li>从加载的节点列表中选择要添加的节点</li>
          <li>点击"添加节点到页面"将选中的节点添加到页面</li>
          <li>再次点击"获取关联页面"查看更新后的页面数据</li>
        </ol>
      </Card>
    </div>
  );
}
