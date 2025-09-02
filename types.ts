
export enum Frequency {
  Weekly = 'Semanal',
  BiWeekly = 'Quincenal',
  Monthly = 'Mensual',
  Bimonthly = 'Bimestral',
}

export enum PaymentMethod {
  CreditCard = 'Tarjeta de crédito',
  DebitCard = 'Tarjeta de débito',
  Cash = 'Efectivo',
}

export enum ExpenseType {
  Recurring = 'Recurrente',
  Casual = 'Casual',
  Scheduled = 'Programado',
  Installment = 'A Plazos',
}

export enum IncomeType {
  Recurring = 'Recurrente',
  Casual = 'Casual',
}

export interface BaseItem {
  id: string;
  name: string;
  amount: number;
}

export interface RecurringExpense extends BaseItem {
  type: ExpenseType.Recurring;
  frequency: Frequency;
  paymentMethod: PaymentMethod;
  paymentSourceId?: string; // card id
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for others
  dayOfMonth2?: number; // For bi-weekly
  suspended: boolean;
}

export interface CasualExpense extends BaseItem {
  type: ExpenseType.Casual;
  date: string;
}

export interface ScheduledExpense extends BaseItem {
  type: ExpenseType.Scheduled;
  date: string;
}

export interface InstallmentExpense extends BaseItem {
  type: ExpenseType.Installment;
  totalAmount: number;
  frequency: Frequency;
  numberOfPayments: number;
  payments: { amount: number; paid: boolean }[];
  paymentMethod: PaymentMethod;
  paymentSourceId?: string; // card id
  startDate: string;
  suspended: boolean;
}

export type Expense = RecurringExpense | CasualExpense | ScheduledExpense | InstallmentExpense;

export interface RecurringIncome extends BaseItem {
  type: IncomeType.Recurring;
  frequency: Frequency;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for others
  suspended: boolean;
}

export interface CasualIncome extends BaseItem {
  type: IncomeType.Casual;
  date: string;
}

export type Income = RecurringIncome | CasualIncome;

export interface CreditCard {
  id: string;
  type: 'credit';
  name: string;
  creditLimit: number;
  cutoffDay: number; // 1-31
  paymentDay: number; // 1-31
}

export interface DebitCard {
  id: string;
  type: 'debit';
  name: string;
  balance: number;
}

export type Card = CreditCard | DebitCard;

export interface FinancialEvent {
  id: string;
  date: Date;
  title: string;
  type: 'expense' | 'income' | 'payment';
  amount: number;
}

export interface SavingsGoal {
  id: string;
  expenseId: string;
  expenseName: string;
  weekStartDate: string;
  amount: number;
  totalAmount: number;
  dueDate: string;
  status: 'pending' | 'saved' | 'postponed';
}

export type View = 'dashboard' | 'expenses' | 'income' | 'cards';