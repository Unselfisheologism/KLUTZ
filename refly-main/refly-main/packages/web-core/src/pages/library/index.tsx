import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { PanelGroup, Panel } from 'react-resizable-panels';

// 自定义组件
import { ContentPanel } from '@refly-packages/ai-workspace-common/components/workspace/content-panel';
import PageTitle from '../page-title';
// utils
// 自定义方法
// stores
// scss
import './index.scss';
import { useCookie } from 'react-use';
// types
import { useUserStoreShallow } from '@refly/stores';
import { getExtensionId } from '@refly/utils';
import { useTranslation } from 'react-i18next';

const Library = () => {
  const [token] = useCookie('_refly_ai_sid');

  const userStore = useUserStoreShallow((state) => ({
    userProfile: state.userProfile,
  }));

  const { t } = useTranslation();

  const handleSendMsgToExtension = async (status: 'success' | 'failed', token?: string) => {
    try {
      // @ts-ignore
      await chrome?.runtime.sendMessage(getExtensionId(), {
        name: 'external-refly-login-notify',
        body: {
          status,
          token,
        },
      });
    } catch (err) {
      console.log('handleSendMsgToExtension err', err);
    }

    console.log('dashboard close');
  };

  useEffect(() => {
    if (!(token || userStore?.userProfile?.uid)) return;

    const reflyLoginStatus = localStorage.getItem('refly-login-status');
    console.log('reflyLoginStatus', reflyLoginStatus, token);
    if ((token || userStore?.userProfile?.uid) && reflyLoginStatus) {
      // 从插件打开弹窗，给插件发消息
      handleSendMsgToExtension('success', token as string);
      localStorage.removeItem('refly-login-status');
      setTimeout(() => {
        window.close();
      }, 500);
    }
  }, [token, userStore?.userProfile?.uid]);

  return (
    <div className="workspace-container" style={{}}>
      <Helmet>
        <title>
          {t('productName')} | {t('landingPage.slogan')}
        </title>
        <meta name="description" content={t('landingPage.description')} />
      </Helmet>
      <div className="workspace-inner-container flex flex-col">
        <div className="px-4">
          <PageTitle title={t('loggedHomePage.siderMenu.library')} />
        </div>
        <PanelGroup direction="horizontal" className="workspace-panel-container flex-grow">
          <Panel minSize={50} className="workspace-content-panel">
            <ContentPanel />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Library;
