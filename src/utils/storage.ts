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

