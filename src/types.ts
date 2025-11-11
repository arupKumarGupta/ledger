export interface ExpenseHead {
  id: string;
  name: string;
  category: string;
  totalAmount: number;
  createdAt: string;
}

export interface ExpenseEntry {
  id: string;
  expenseHeadId: string;
  amountPaid: number;
  date: string;
  image?: string; // base64 encoded image
}

export interface ExpenseData {
  expenseHeads: ExpenseHead[];
  expenseEntries: ExpenseEntry[];
}

export interface ExpenseWithStats extends ExpenseHead {
  amountPaid: number;
  amountDue: number;
}

