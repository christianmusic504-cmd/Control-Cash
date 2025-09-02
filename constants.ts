
import { Frequency, PaymentMethod, ExpenseType, IncomeType } from './types';

export const FREQUENCY_OPTIONS = [
  { value: Frequency.Weekly, label: 'Semanal' },
  { value: Frequency.BiWeekly, label: 'Quincenal' },
  { value: Frequency.Monthly, label: 'Mensual' },
  { value: Frequency.Bimonthly, label: 'Bimestral' },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.CreditCard, label: 'Tarjeta de Crédito' },
  { value: PaymentMethod.DebitCard, label: 'Tarjeta de Débito' },
  { value: PaymentMethod.Cash, label: 'Efectivo' },
];

export const EXPENSE_TYPE_OPTIONS = [
  { value: ExpenseType.Recurring, label: 'Recurrente' },
  { value: ExpenseType.Casual, label: 'Casual' },
  { value: ExpenseType.Scheduled, label: 'Programado' },
  { value: ExpenseType.Installment, label: 'A Plazos' },
];

export const INCOME_TYPE_OPTIONS = [
    { value: IncomeType.Recurring, label: 'Recurrente' },
    { value: IncomeType.Casual, label: 'Casual' },
];

export const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const EVENT_COLORS: { [key: string]: string } = {
  expense: 'bg-red-500/20 border border-red-500 text-red-300',
  income: 'bg-green-500/20 border border-green-500 text-green-300',
  payment: 'bg-blue-500/20 border border-blue-500 text-blue-300',
};
