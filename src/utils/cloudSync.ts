import { ExpenseData } from '../types';
import { saveData as saveToLocalStorage, loadData as loadFromLocalStorage } from './storage';
import { saveToCloud, loadFromCloud, isCloudEnabled, getLastSyncTime } from '../services/dynamodb';

export interface SyncStatus {
  enabled: boolean;
  lastSync: string | null;
  syncing: boolean;
  error: string | null;
}

let syncStatus: SyncStatus = {
  enabled: isCloudEnabled(),
  lastSync: null,
  syncing: false,
  error: null,
};

/**
 * Get current sync status
 */
export const getSyncStatus = (): SyncStatus => {
  return { ...syncStatus };
};

/**
 * Save data with automatic cloud sync
 */
export const saveDataWithSync = async (data: ExpenseData): Promise<void> => {
  // Always save to localStorage first (for offline capability)
  saveToLocalStorage(data);

  // Try to sync to cloud if enabled
  if (syncStatus.enabled && !syncStatus.syncing) {
    syncStatus.syncing = true;
    syncStatus.error = null;

    const result = await saveToCloud(data);
    
    if (result.success) {
      syncStatus.lastSync = result.timestamp || new Date().toISOString();
      syncStatus.error = null;
    } else {
      syncStatus.error = result.error || 'Sync failed';
      console.warn('Cloud sync failed:', result.error);
    }

    syncStatus.syncing = false;
  }
};

/**
 * Load data with cloud sync fallback
 */
export const loadDataWithSync = async (): Promise<ExpenseData> => {
  // Try to load from cloud first
  if (syncStatus.enabled) {
    syncStatus.syncing = true;
    
    const { data: cloudData, error } = await loadFromCloud();
    
    if (cloudData) {
      // Save cloud data to localStorage for offline use
      saveToLocalStorage(cloudData);
      syncStatus.lastSync = await getLastSyncTime();
      syncStatus.error = null;
      syncStatus.syncing = false;
      return cloudData;
    }
    
    if (error) {
      console.warn('Failed to load from cloud, using localStorage:', error);
      syncStatus.error = error;
    }
    
    syncStatus.syncing = false;
  }

  // Fallback to localStorage
  return loadFromLocalStorage();
};

/**
 * Manually trigger sync to cloud
 */
export const syncToCloud = async (data: ExpenseData): Promise<{ success: boolean; error?: string }> => {
  if (!syncStatus.enabled) {
    return { success: false, error: 'Cloud sync not configured' };
  }

  syncStatus.syncing = true;
  const result = await saveToCloud(data);
  
  if (result.success) {
    syncStatus.lastSync = result.timestamp || new Date().toISOString();
    syncStatus.error = null;
  } else {
    syncStatus.error = result.error || 'Sync failed';
  }
  
  syncStatus.syncing = false;
  return result;
};

/**
 * Initialize sync status
 */
export const initSyncStatus = async (): Promise<void> => {
  if (syncStatus.enabled) {
    syncStatus.lastSync = await getLastSyncTime();
  }
};


