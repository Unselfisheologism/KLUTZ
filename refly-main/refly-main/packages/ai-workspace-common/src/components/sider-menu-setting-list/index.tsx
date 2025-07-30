import { useTranslation } from 'react-i18next';
import { Dropdown } from 'antd';
import { LuMonitor } from 'react-icons/lu';
import { useUserStore } from '@refly/stores';
import { useSiderStoreShallow } from '@refly/stores';
import { useLogout } from '@refly-packages/ai-workspace-common/hooks/use-logout';
import { EXTENSION_DOWNLOAD_LINK } from '@refly/utils/url';
import { useThemeStoreShallow } from '@refly/stores';
import { useCallback, useMemo } from 'react';
import { SettingsModalActiveTab } from '@refly/stores';
import {
  Settings,
  Subscription,
  InterfaceDark,
  InterfaceLight,
  ArrowRight,
  Cuttools,
  Contact,
  Exit,
} from 'refly-icons';
import './index.scss';
import React from 'react';
import { TFunction } from 'i18next';

// Reusable dropdown item component
const DropdownItem = React.memo(
  ({
    icon,
    children,
  }: {
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center gap-2">
      {icon}
      <span>{children}</span>
    </div>
  ),
);

// User info component
const UserInfo = React.memo(({ nickname, email }: { nickname?: string; email?: string }) => (
  <div className="px-1.5 py-2">
    <div className="text-sm font-semibold text-refly-text-0 leading-5 truncate">{nickname}</div>
    <div className="text-xs text-refly-text-2 leading-4 truncate">
      {email ?? 'No email provided'}
    </div>
  </div>
));

// Theme appearance item component
const ThemeAppearanceItem = React.memo(({ themeMode, t }: { themeMode: string; t: TFunction }) => (
  <div className="flex items-center gap-2">
    {themeMode === 'dark' ? <InterfaceDark size={18} /> : <InterfaceLight size={18} />}
    <div className="flex flex-1 items-center justify-between gap-1">
      <span>{t('loggedHomePage.siderMenu.systemTheme')}</span>
      <ArrowRight size={16} />
    </div>
  </div>
));

export const SiderMenuSettingList = (props: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const { setShowSettingModal, setSettingsModalActiveTab } = useSiderStoreShallow((state) => ({
    setShowSettingModal: state.setShowSettingModal,
    setSettingsModalActiveTab: state.setSettingsModalActiveTab,
  }));
  const { handleLogout, contextHolder } = useLogout();
  const { themeMode, setThemeMode } = useThemeStoreShallow((state) => ({
    themeMode: state.themeMode,
    setThemeMode: state.setThemeMode,
  }));

  // Handle menu item clicks
  const handleSettingsClick = useCallback(() => {
    setShowSettingModal(true);
  }, [setShowSettingModal]);

  const handleSubscriptionClick = useCallback(() => {
    setSettingsModalActiveTab(SettingsModalActiveTab.Subscription);
    setShowSettingModal(true);
  }, [setSettingsModalActiveTab, setShowSettingModal]);

  const handleContactUsClick = useCallback(() => {
    window.open('https://docs.refly.ai/community/contact-us', '_blank');
  }, []);

  const handleChromeExtensionClick = useCallback(() => {
    window.open(EXTENSION_DOWNLOAD_LINK, '_blank');
  }, []);

  const handleLogoutClick = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  // Theme mode options
  const themeOptions = useMemo(
    () => [
      {
        key: 'light',
        label: t('settings.appearance.lightMode'),
        icon: <InterfaceLight size={18} />,
        active: themeMode === 'light',
      },
      {
        key: 'dark',
        label: t('settings.appearance.darkMode'),
        icon: <InterfaceDark size={18} />,
        active: themeMode === 'dark',
      },
      {
        key: 'system',
        label: t('settings.appearance.systemMode'),
        icon: <LuMonitor size={14} />,
        active: themeMode === 'system',
      },
    ],
    [themeMode, t],
  );

  const handleThemeModeChange = useCallback(
    (mode: 'light' | 'dark' | 'system') => {
      setThemeMode(mode);
    },
    [setThemeMode],
  );

  // Theme dropdown items
  const themeDropdownItems = useMemo(
    () => [
      {
        key: 'theme-submenu',
        type: 'group' as const,
        className: 'theme-dropdown-submenu',
        children: themeOptions.map((option) => ({
          key: option.key,
          label: <DropdownItem icon={option.icon}>{option.label}</DropdownItem>,
          onClick: () => handleThemeModeChange(option.key as 'light' | 'dark' | 'system'),
          className: option.active ? 'bg-refly-bg-content-z1' : '',
        })),
      },
    ],
    [themeOptions, handleThemeModeChange],
  );

  // Main dropdown items
  const dropdownItems = useMemo(
    () => [
      {
        key: 'user-info',
        type: 'group' as const,
        children: [
          {
            key: 'user-header',
            className: 'user-header',
            label: (
              <UserInfo
                nickname={userStore?.userProfile?.nickname}
                email={userStore?.userProfile?.email}
              />
            ),
            disabled: true,
          },
        ],
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'settings',
        label: (
          <DropdownItem icon={<Settings size={18} />}>
            {t('loggedHomePage.siderMenu.settings')}
          </DropdownItem>
        ),
        onClick: handleSettingsClick,
      },
      {
        key: 'subscription',
        label: (
          <DropdownItem icon={<Subscription size={18} />}>
            {t('loggedHomePage.siderMenu.subscription')}
          </DropdownItem>
        ),
        onClick: handleSubscriptionClick,
      },
      {
        key: 'appearance',
        type: 'submenu' as const,
        label: <ThemeAppearanceItem themeMode={themeMode} t={t} />,
        children: themeDropdownItems,
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'contact-us',
        label: (
          <DropdownItem icon={<Contact size={18} />}>
            {t('loggedHomePage.siderMenu.contactUs')}
          </DropdownItem>
        ),
        onClick: handleContactUsClick,
      },
      {
        key: 'chrome-extension',
        label: (
          <DropdownItem icon={<Cuttools size={18} />}>
            {t('loggedHomePage.siderMenu.addToChrome')}
          </DropdownItem>
        ),
        onClick: handleChromeExtensionClick,
      },
      {
        key: 'logout',
        label: (
          <DropdownItem icon={<Exit size={18} />}>
            {t('loggedHomePage.siderMenu.logout')}
          </DropdownItem>
        ),
        onClick: handleLogoutClick,
      },
    ],
    [
      userStore?.userProfile?.nickname,
      userStore?.userProfile?.email,
      t,
      handleSettingsClick,
      handleSubscriptionClick,
      themeMode,
      themeDropdownItems,
      handleContactUsClick,
      handleChromeExtensionClick,
      handleLogoutClick,
    ],
  );

  return (
    <div>
      <Dropdown
        menu={{ items: dropdownItems }}
        trigger={['click']}
        placement="bottom"
        overlayClassName="sider-menu-setting-list-dropdown"
        arrow={false}
        align={{
          offset: [0, 10],
        }}
      >
        {props.children}
      </Dropdown>
      {contextHolder}
    </div>
  );
};
