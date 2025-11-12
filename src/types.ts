export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface ExpenseHead {
  id: string;
  eventId: string; // Links to Event
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
  events: Event[];
  expenseHeads: ExpenseHead[];
  expenseEntries: ExpenseEntry[];
}

export interface ExpenseWithStats extends ExpenseHead {
  amountPaid: number;
  amountDue: number;
}

export interface EventWithStats extends Event {
  totalExpenseHeads: number;
  totalBudget: number;
  totalSpent: number;
  totalDue: number;
}

