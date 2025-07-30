import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { Button, Table, Segmented } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Spin } from '@refly-packages/ai-workspace-common/components/common/spin';
import { useTranslation } from 'react-i18next';
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';

import {
  useSubscriptionStoreShallow,
  useUserStoreShallow,
  useSiderStoreShallow,
} from '@refly/stores';
import {
  useGetCreditBalance,
  useGetCreditUsage,
  useGetCreditRecharge,
} from '@refly-packages/ai-workspace-common/queries/queries';
import { useSubscriptionUsage } from '@refly-packages/ai-workspace-common/hooks/use-subscription-usage';
import { logEvent } from '@refly/telemetry-web';

// styles
import './index.scss';
import { ContentHeader } from '@refly-packages/ai-workspace-common/components/settings/contentHeader';

// Define interfaces for the table data
interface CreditUsageRecord {
  usageId: string;
  description?: string;
  createdAt: string;
  amount: number;
}

interface CreditRechargeRecord {
  rechargeId: string;
  description?: string;
  source: string;
  createdAt: string;
  expiresAt: string;
  amount: number;
  balance: number;
  enabled: boolean;
}

const filesPlanMap = { free: 100, starter: 200, maker: 500 };

export const Subscription = () => {
  const { t } = useTranslation('ui');
  const { userProfile } = useUserStoreShallow((state) => ({
    userProfile: state.userProfile,
  }));

  // State to hold the subscription data for display, defaults to real data
  const [displaySubscription, setDisplaySubscription] = useState(userProfile?.subscription);

  // Update display subscription when real subscription data changes
  useEffect(() => {
    setDisplaySubscription(userProfile?.subscription);
  }, [userProfile?.subscription]);

  const { planType: subscriptionPlanType, cancelAt } = displaySubscription ?? {};

  const { setSubscribeModalVisible, setPlanType, planType } = useSubscriptionStoreShallow(
    (state) => ({
      setSubscribeModalVisible: state.setSubscribeModalVisible,
      setPlanType: state.setPlanType,
      planType: state.planType,
    }),
  );

  const { setShowSettingModal } = useSiderStoreShallow((state) => ({
    setShowSettingModal: state.setShowSettingModal,
  }));

  const { storageUsage, isUsageLoading } = useSubscriptionUsage();

  const { data: balanceData, isLoading: isBalanceLoading } = useGetCreditBalance();
  const creditBalance = balanceData?.data?.creditBalance ?? 0;

  // State for active history tab
  const [activeTab, setActiveTab] = useState<'usage' | 'recharge'>('usage');

  // Fetch credit history data - preload both types of data
  const { data: usageData, isLoading: isUsageHistoryLoading } = useGetCreditUsage(
    {},
    [],
    // @ts-ignore
    { enabled: true }, // Always load usage data regardless of active tab
  );
  const { data: rechargeData, isLoading: isRechargeHistoryLoading } = useGetCreditRecharge(
    {},
    [],
    // @ts-ignore
    { enabled: true }, // Always load recharge data regardless of active tab
  );

  // Only show loading state during initial data loading, not when switching tabs
  const isHistoryLoading =
    (activeTab === 'usage' && isUsageHistoryLoading) ||
    (activeTab === 'recharge' && isRechargeHistoryLoading);
  const isLoading = isBalanceLoading || isHistoryLoading || isUsageLoading;

  useEffect(() => {
    if (displaySubscription?.planType) {
      setPlanType(displaySubscription.planType);
    }
  }, [displaySubscription?.planType, setPlanType]);

  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageBilling = async () => {
    if (portalLoading) return;

    setPortalLoading(true);
    try {
      const { data } = await getClient().createPortalSession();
      setPortalLoading(false);
      if (data?.data?.url) {
        window.open(data.data.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to create portal session:', error);
      setPortalLoading(false);
    }
  };

  // Columns for Usage History Table
  const usageColumns: ColumnsType<CreditUsageRecord> = [
    {
      title: t('subscription.subscriptionManagement.usageDetails'),
      dataIndex: 'usageType',
      key: 'usageType',
      align: 'center',
      render: (value: string) => {
        const key = `subscription.subscriptionManagement.usageType.${value}`;
        return t(key);
      },
    },
    {
      title: t('subscription.subscriptionManagement.usageTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (text) => (text ? dayjs(text).format('YYYY.MM.DD HH:mm:ss') : ''),
    },
    {
      title: t('subscription.subscriptionManagement.creditChange'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      render: (amount) => `${amount > 0 ? '-' : ''}${amount.toLocaleString()}`,
    },
  ];

  // Columns for Recharge History Table
  const rechargeColumns: ColumnsType<CreditRechargeRecord> = [
    {
      title: t('subscription.subscriptionManagement.rechargeSource'),
      dataIndex: 'source',
      key: 'source',
      align: 'center',
      render: (source) => {
        const sourceMap: Record<string, string> = {
          purchase: t('credit.recharge.source.purchase'),
          gift: t('credit.recharge.source.gift'),
          promotion: t('credit.recharge.source.promotion'),
          refund: t('credit.recharge.source.refund'),
          subscription: t('credit.recharge.source.subscription'),
        };
        return sourceMap[source] || source;
      },
    },
    {
      title: t('subscription.subscriptionManagement.rechargeTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (text) => (text ? dayjs(text).format('YYYY.MM.DD HH:mm:ss') : ''),
    },
    {
      title: t('subscription.subscriptionManagement.expiryDate'),
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      align: 'center',
      render: (text) => (text ? dayjs(text).format('YYYY.MM.DD') : '-'),
    },
    {
      title: t('subscription.subscriptionManagement.creditChange'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      render: (amount) => `${amount > 0 ? '+' : ''}${amount.toLocaleString()}`,
    },
    {
      title: t('subscription.subscriptionManagement.remaining'),
      dataIndex: 'balance',
      key: 'balance',
      align: 'center',
      render: (balance) => balance.toLocaleString(),
    },
    {
      title: t('subscription.subscriptionManagement.status'),
      key: 'status',
      align: 'center',
      render: (_, record) => {
        if (!record.enabled) {
          return t('subscription.subscriptionManagement.disabled');
        }
        if (record.balance <= 0) {
          return t('subscription.subscriptionManagement.depleted');
        }
        const now = new Date();
        const expiryDate = new Date(record.expiresAt);
        if (expiryDate < now) {
          return t('subscription.subscriptionManagement.expired');
        }
        return t('subscription.subscriptionManagement.available');
      },
    },
  ];

  const handleClickSubscription = useCallback(() => {
    logEvent('subscription::upgrade_click', 'settings');
    setShowSettingModal(false);
    setSubscribeModalVisible(true);
  }, [setSubscribeModalVisible, setShowSettingModal]);

  const PaidPlanCard = () => {
    return (
      <div className={`subscription-plan-card plan-${planType} w-full`}>
        <div className="plan-info w-full">
          <div className="current-plan-label">
            {t('subscription.subscriptionManagement.currentPlan')}
          </div>
          <div className="current-plan-name flex items-center w-full justify-between">
            {t(`subscription.plans.${planType}.title`)}{' '}
            <div className="flex items-center gap-3 plan-actions">
              <div className="plan-renewal-info">
                {cancelAt
                  ? `${dayjs(cancelAt).format('YYYY.MM.DD')} ${t('subscription.subscriptionManagement.willExpire')}`
                  : t('subscription.subscriptionManagement.willAutoRenew')}
              </div>
              <div
                className="cursor-pointer text-sm font-semibold leading-5 flex h-[var(--height-button\_default,32px)] [padding:var(--spacing-button\_default-paddingTop,6px)_var(--spacing-button\_default-paddingRight,12px)_var(--spacing-button\_default-paddingTop,6px)_var(--spacing-button\_default-paddingLeft,12px)] justify-center items-center border-[color:var(--border---refly-Card-Border,rgba(0,0,0,0.10))] [background:var(--tertiary---refly-tertiary-default,rgba(0,0,0,0.04))] hover:[background:var(--refly-tertiary-hover,#00000014)] rounded-lg border-0 border-solid transition-colors duration-200"
                onClick={handleManageBilling}
              >
                {portalLoading
                  ? t('common.loading')
                  : t('subscription.subscriptionManagement.viewBilling')}
              </div>
              {subscriptionPlanType === 'free' && (
                <Button
                  type="primary"
                  className="ant-btn-primary"
                  onClick={handleClickSubscription}
                >
                  {t('subscription.subscriptionManagement.changePlan')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FreePlanCard = () => (
    <div className="subscription-plan-card plan-free w-full">
      <div className="plan-info w-full">
        <div className="current-plan-label">
          {t('subscription.subscriptionManagement.currentPlan')}
        </div>

        <div className="current-plan-name flex items-center w-full justify-between">
          {t('subscription.subscriptionManagement.planNames.freePlan')}
          <Button
            type="primary"
            className="upgrade-button ant-btn-primary"
            onClick={() => {
              setShowSettingModal(false);
              setSubscribeModalVisible(true);
            }}
          >
            {t('subscription.subscriptionManagement.upgradePlan')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPlanCard = () => {
    if (subscriptionPlanType && subscriptionPlanType !== 'free') {
      return <PaidPlanCard />;
    }
    return <FreePlanCard />;
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <ContentHeader title={t('subscription.subscriptionManagement.title')} />

      <div className="subscription-management-page">
        <div className="subscription-content">
          {isLoading ? (
            <Spin
              spinning={isLoading}
              style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          ) : (
            <>
              {renderPlanCard()}

              <div className="usage-cards">
                <div className="usage-card points-card">
                  <div className="usage-label">
                    {t('subscription.subscriptionManagement.availableCredits')}
                  </div>
                  <div className="usage-value">{creditBalance.toLocaleString()}</div>
                </div>
                <div className="usage-card files-card">
                  <div className="usage-label">
                    {t('subscription.subscriptionManagement.knowledgeBaseFiles')}
                  </div>
                  <div className="usage-value">
                    {storageUsage?.fileCountUsed || 0}{' '}
                    <span className="quota-text">
                      /{' '}
                      {storageUsage?.fileCountQuota < 0
                        ? filesPlanMap[planType]
                        : storageUsage?.fileCountQuota}
                    </span>
                  </div>
                </div>
              </div>

              <div className="points-history">
                <Segmented
                  options={[
                    {
                      label: t('subscription.subscriptionManagement.creditUsageDetails'),
                      value: 'usage',
                    },
                    {
                      label: t('subscription.subscriptionManagement.creditRechargeDetails'),
                      value: 'recharge',
                    },
                  ]}
                  value={activeTab}
                  onChange={(value) => setActiveTab(value as 'usage' | 'recharge')}
                  className="history-tabs"
                  size="large"
                />
                <Spin spinning={isHistoryLoading}>
                  <Table<any>
                    columns={activeTab === 'usage' ? usageColumns : rechargeColumns}
                    dataSource={
                      activeTab === 'usage' ? usageData?.data || [] : rechargeData?.data || []
                    }
                    rowKey={activeTab === 'usage' ? 'usageId' : 'rechargeId'}
                    pagination={{ showSizeChanger: false }}
                    className="history-table"
                    bordered={false}
                  />
                </Spin>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
