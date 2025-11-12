import { ExpenseData } from '../types';
import { saveToCloud, loadFromCloud, isCloudEnabled, getLastSyncTime } from '../services/dynamodb';

/**
 * ⚠️ CLOUD-ONLY MODE
 * 
 * This module has been modified to ONLY use DynamoDB for storage.
 * NO localStorage fallback - all data operations go directly to DynamoDB.
 * 
 * If DynamoDB is not configured, operations will fail.
 * This ensures data consistency across all devices.
 */

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

const getDefaultData = (): ExpenseData => ({
  events: [],
  expenseHeads: [],
  expenseEntries: [],
});

/**
 * Get current sync status
 */
export const getSyncStatus = (): SyncStatus => {
  return { ...syncStatus };
};

/**
 * Save data - CLOUD ONLY (no localStorage)
 */
export const saveDataWithSync = async (data: ExpenseData): Promise<void> => {
  if (!syncStatus.enabled) {
    console.error('❌ Cloud sync not configured. Cannot save data.');
    syncStatus.error = 'DynamoDB not configured';
    throw new Error('Cloud sync required but not configured. Please set up AWS Cognito.');
  }

  if (syncStatus.syncing) {
    console.warn('⚠️ Sync already in progress, skipping...');
    return;
  }

  syncStatus.syncing = true;
  syncStatus.error = null;

  const result = await saveToCloud(data);
  
  if (result.success) {
    syncStatus.lastSync = result.timestamp || new Date().toISOString();
    syncStatus.error = null;
    console.log('✅ Data saved to DynamoDB:', new Date().toLocaleTimeString());
  } else {
    syncStatus.error = result.error || 'Sync failed';
    console.error('❌ Failed to save to DynamoDB:', result.error);
    throw new Error(`Failed to save: ${result.error}`);
  }

  syncStatus.syncing = false;
};

/**
 * Load data - CLOUD ONLY (no localStorage fallback)
 */
export const loadDataWithSync = async (): Promise<ExpenseData> => {
  if (!syncStatus.enabled) {
    console.error('❌ Cloud sync not configured. Cannot load data.');
    syncStatus.error = 'DynamoDB not configured';
    return getDefaultData();
  }

  syncStatus.syncing = true;
  
  const { data: cloudData, error } = await loadFromCloud();
  
  if (cloudData) {
    syncStatus.lastSync = await getLastSyncTime();
    syncStatus.error = null;
    syncStatus.syncing = false;
    console.log('✅ Data loaded from DynamoDB');
    return cloudData;
  }
  
  if (error) {
    console.error('❌ Failed to load from DynamoDB:', error);
    syncStatus.error = error;
    syncStatus.syncing = false;
    // Return empty data if load fails
    return getDefaultData();
  }
  
  syncStatus.syncing = false;
  console.log('ℹ️ No data found in DynamoDB, starting fresh');
  return getDefaultData();
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


