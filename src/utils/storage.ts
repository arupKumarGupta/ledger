import { ExpenseData, ExpenseHead, ExpenseEntry } from '../types';

const STORAGE_KEY = 'expense-manager-data';

const getDefaultData = (): ExpenseData => ({
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
        // Validate the data structure
        if (data && Array.isArray(data.expenseHeads) && Array.isArray(data.expenseEntries)) {
          resolve(data);
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
): { mergedData: ExpenseData; stats: { addedHeads: number; addedEntries: number; skippedHeads: number; skippedEntries: number } } => {
  // Create uniqueness keys for expense heads using name + category + totalAmount
  const existingHeadKeys = new Set(
    currentData.expenseHeads.map(head => 
      `${head.name}|${head.category}|${head.totalAmount}`
    )
  );
  
  // Create uniqueness keys for expense entries using expenseHeadId + amountPaid + date
  const existingEntryKeys = new Set(
    currentData.expenseEntries.map(entry => 
      `${entry.expenseHeadId}|${entry.amountPaid}|${entry.date}`
    )
  );
  
  // Filter out duplicate expense heads based on concatenated key
  const newExpenseHeads = importedData.expenseHeads.filter(head => {
    const key = `${head.name}|${head.category}|${head.totalAmount}`;
    return !existingHeadKeys.has(key);
  });
  
  // Filter out duplicate expense entries based on concatenated key
  const newExpenseEntries = importedData.expenseEntries.filter(entry => {
    const key = `${entry.expenseHeadId}|${entry.amountPaid}|${entry.date}`;
    return !existingEntryKeys.has(key);
  });
  
  // Merge data
  const mergedData: ExpenseData = {
    expenseHeads: [...currentData.expenseHeads, ...newExpenseHeads],
    expenseEntries: [...currentData.expenseEntries, ...newExpenseEntries],
  };
  
  // Calculate statistics
  const stats = {
    addedHeads: newExpenseHeads.length,
    addedEntries: newExpenseEntries.length,
    skippedHeads: importedData.expenseHeads.length - newExpenseHeads.length,
    skippedEntries: importedData.expenseEntries.length - newExpenseEntries.length,
  };
  
  return { mergedData, stats };
};

