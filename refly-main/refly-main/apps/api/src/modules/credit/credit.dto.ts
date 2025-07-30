import { CreditBilling, TokenUsageItem } from '@refly/openapi-schema';
export type CheckRequestCreditUsageResult = {
  canUse: boolean;
  message: string;
};

export interface SyncTokenCreditUsageJobData {
  uid: string;
  resultId?: string;
  providerItemId?: string;
  usage: TokenUsageItem;
  creditBilling?: CreditBilling;
  timestamp: Date;
}

export interface SyncMediaCreditUsageJobData {
  uid: string;
  resultId?: string;
  creditBilling?: CreditBilling;
  timestamp: Date;
}

export interface CreditBalance {
  creditAmount: number;
  creditBalance: number;
}
