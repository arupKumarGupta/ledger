import { ExpenseData, Event, ExpenseHead, ExpenseEntry } from '../types';

const STORAGE_KEY = 'expense-manager-data';

const getDefaultData = (): ExpenseData => ({
  events: [],
  expenseHeads: [],
  expenseEntries: [],
});

export const loadData = (): ExpenseData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  return getDefaultData();
};

export const saveData = (data: ExpenseData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

export const exportDataToJSON = (data: ExpenseData): void => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `expenses-${dateStr}-${timeStr}.json`;
  
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importDataFromJSON = (file: File): Promise<ExpenseData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Validate the data structure - support both old and new formats
        const isValidOldFormat = data && Array.isArray(data.expenseHeads) && Array.isArray(data.expenseEntries);
        const isValidNewFormat = isValidOldFormat && Array.isArray(data.events);
        
        if (isValidNewFormat) {
          resolve(data);
        } else if (isValidOldFormat) {
          // Migrate old format: create a default event for all expenses
          const defaultEvent: Event = {
            id: `event-${Date.now()}`,
            name: 'Imported Expenses',
            description: 'Auto-created event for imported expenses',
            startDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
          
          // Add eventId to all expense heads
          const migratedHeads = data.expenseHeads.map((head: ExpenseHead) => ({
            ...head,
            eventId: head.eventId || defaultEvent.id,
          }));
          
          resolve({
            events: [defaultEvent],
            expenseHeads: migratedHeads,
            expenseEntries: data.expenseEntries,
          });
        } else {
          reject(new Error('Invalid data format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

export const mergeImportedData = (
  currentData: ExpenseData,
  importedData: ExpenseData
): { mergedData: ExpenseData; stats: { addedEvents: number; addedHeads: number; addedEntries: number; skippedEvents: number; skippedHeads: number; skippedEntries: number } } => {
  // ✅ ID-ONLY duplicate detection (simpler and more reliable)
  const existingEventIds = new Set(currentData.events.map(event => event.id));
  const existingHeadIds = new Set(currentData.expenseHeads.map(head => head.id));
  const existingEntryIds = new Set(currentData.expenseEntries.map(entry => entry.id));
  
  // Filter out duplicates based on ID only
  const newEvents = importedData.events.filter(event => !existingEventIds.has(event.id));
  const newExpenseHeads = importedData.expenseHeads.filter(head => !existingHeadIds.has(head.id));
  const newExpenseEntries = importedData.expenseEntries.filter(entry => !existingEntryIds.has(entry.id));
  
  // Merge data
  const mergedData: ExpenseData = {
    events: [...currentData.events, ...newEvents],
    expenseHeads: [...currentData.expenseHeads, ...newExpenseHeads],
    expenseEntries: [...currentData.expenseEntries, ...newExpenseEntries],
  };
  
  // Calculate statistics
  const stats = {
    addedEvents: newEvents.length,
    addedHeads: newExpenseHeads.length,
    addedEntries: newExpenseEntries.length,
    skippedEvents: importedData.events.length - newEvents.length,
    skippedHeads: importedData.expenseHeads.length - newExpenseHeads.length,
    skippedEntries: importedData.expenseEntries.length - newExpenseEntries.length,
  };
  
  return { mergedData, stats };
};

