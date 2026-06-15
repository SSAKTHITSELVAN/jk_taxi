import { create } from 'zustand';
import { ridesApi } from '../api/rides';

interface StatusState {
  isOnline: boolean;
  isUpdating: boolean;
  error: string | null;

  // Actions
  toggleStatus: () => Promise<void>;
  setOnlineStatus: (status: boolean) => Promise<void>;
}

export const useStatusStore = create<StatusState>((set, get) => ({
  isOnline: false,
  isUpdating: false,
  error: null,

  toggleStatus: async () => {
    const newStatus = !get().isOnline;
    try {
      set({ isUpdating: true, error: null });
      await ridesApi.updateStatus({ is_online: newStatus });
      set({ isOnline: newStatus, isUpdating: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to update status';
      set({ error: errorMsg, isUpdating: false });
      throw error;
    }
  },

  setOnlineStatus: async (status: boolean) => {
    try {
      set({ isUpdating: true, error: null });
      await ridesApi.updateStatus({ is_online: status });
      set({ isOnline: status, isUpdating: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to update status';
      set({ error: errorMsg, isUpdating: false });
      throw error;
    }
  },
}));
