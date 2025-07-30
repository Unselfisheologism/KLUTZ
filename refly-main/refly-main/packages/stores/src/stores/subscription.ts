import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { SubscriptionPlanType } from '@refly/openapi-schema';

interface SubscriptionState {
  // state
  planType: SubscriptionPlanType;
  subscribeModalVisible: boolean;
  storageExceededModalVisible: boolean;

  // method
  setPlanType: (val: SubscriptionPlanType) => void;
  setSubscribeModalVisible: (val: boolean) => void;
  setStorageExceededModalVisible: (val: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  devtools((set) => ({
    planType: 'free',
    subscribeModalVisible: false,
    storageExceededModalVisible: false,

    setPlanType: (val: SubscriptionPlanType) => set({ planType: val }),
    setSubscribeModalVisible: (val: boolean) => set({ subscribeModalVisible: val }),
    setStorageExceededModalVisible: (val: boolean) => set({ storageExceededModalVisible: val }),
  })),
);

export const useSubscriptionStoreShallow = <T>(selector: (state: SubscriptionState) => T) => {
  return useSubscriptionStore(useShallow(selector));
};
