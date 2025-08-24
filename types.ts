
export enum Frequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  BIMONTHLY = 'bimonthly',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
}

export interface BaseItem {
  id: string;
  name: string;
  amount: number;
}

export interface RecurringItem extends BaseItem {
  frequency: Frequency;
  frequencyDetail: number; // Day of week (0-6) or day of month (1-31)
  status: 'active' | 'suspended';
}

export interface RecurringExpense extends RecurringItem {
  paymentMethod: PaymentMethod;
  paymentMethodDetail?: string; // e.g., card ID
}

export interface CasualExpense extends BaseItem {
  date: string; // ISO string
  paymentMethod: PaymentMethod;
  paymentMethodDetail?: string; // e.g., card ID
}

export interface ScheduledExpense extends BaseItem {
  date: string; // ISO string
  paymentMethod: PaymentMethod;
  paymentMethodDetail?: string; // e.g., card ID
}

export type RecurringIncome = RecurringItem;

export type CasualIncome = BaseItem;

export interface CreditCard {
  id: string;
  name: string;
  creditLimit: number;
  closingDate: number; // Day of month
  paymentDueDate: number; // Day of month
}

export interface DebitCard {
  id:string;
  name: string;
  balance: number;
}

export type Expense = RecurringExpense | CasualExpense | ScheduledExpense;
export type Income = RecurringIncome | CasualIncome;

export interface AppState {
  recurringExpenses: RecurringExpense[];
  casualExpenses: CasualExpense[];
  scheduledExpenses: ScheduledExpense[];
  recurringIncomes: RecurringIncome[];
  casualIncomes: CasualIncome[];
  creditCards: CreditCard[];
  debitCards: DebitCard[];
}

export type View = 'dashboard' | 'expenses' | 'income' | 'cards';