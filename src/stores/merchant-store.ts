import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MerchantRole } from '@/types/api.types';

interface MerchantState {
  apiKey: string | null;
  merchantId: string | null;
  merchantName: string | null;
  email: string | null;
  role: MerchantRole | null;
  isAuthenticated: boolean;
  setMerchant: (data: {
    apiKey: string;
    merchantId: string;
    merchantName: string;
    email: string;
    role: MerchantRole;
  }) => void;
  clearMerchant: () => void;
}

export const useMerchantStore = create<MerchantState>()(
  persist(
    (set) => ({
      apiKey: null,
      merchantId: null,
      merchantName: null,
      email: null,
      role: null,
      isAuthenticated: false,
      setMerchant: (data) =>
        set({
          ...data,
          isAuthenticated: true,
        }),
      clearMerchant: () =>
        set({
          apiKey: null,
          merchantId: null,
          merchantName: null,
          email: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'dari-merchant-store',
    }
  )
);

// UI State Store
interface UIState {
  sidebarOpen: boolean;
  activeFeature: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveFeature: (feature: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  activeFeature: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveFeature: (feature) => set({ activeFeature: feature }),
}));

// Filter/Search State Store
interface FilterState {
  paymentLinksFilter: {
    isActive?: boolean;
    search?: string;
  };
  invoicesFilter: {
    status?: string;
    customerEmail?: string;
    search?: string;
  };
  subscriptionsFilter: {
    status?: string;
    planId?: string;
    search?: string;
  };
  refundsFilter: {
    status?: string;
    paymentSessionId?: string;
  };
  setPaymentLinksFilter: (filter: FilterState['paymentLinksFilter']) => void;
  setInvoicesFilter: (filter: FilterState['invoicesFilter']) => void;
  setSubscriptionsFilter: (filter: FilterState['subscriptionsFilter']) => void;
  setRefundsFilter: (filter: FilterState['refundsFilter']) => void;
  resetFilters: () => void;
}

const initialFilterState = {
  paymentLinksFilter: {},
  invoicesFilter: {},
  subscriptionsFilter: {},
  refundsFilter: {},
};

export const useFilterStore = create<FilterState>()((set) => ({
  ...initialFilterState,
  setPaymentLinksFilter: (filter) =>
    set((state) => ({
      paymentLinksFilter: { ...state.paymentLinksFilter, ...filter },
    })),
  setInvoicesFilter: (filter) =>
    set((state) => ({
      invoicesFilter: { ...state.invoicesFilter, ...filter },
    })),
  setSubscriptionsFilter: (filter) =>
    set((state) => ({
      subscriptionsFilter: { ...state.subscriptionsFilter, ...filter },
    })),
  setRefundsFilter: (filter) =>
    set((state) => ({
      refundsFilter: { ...state.refundsFilter, ...filter },
    })),
  resetFilters: () => set(initialFilterState),
}));
