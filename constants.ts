import { Frequency } from './types';

export const WEEK_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const FREQUENCY_OPTIONS = [
  { value: Frequency.WEEKLY, label: 'Semanal' },
  { value: Frequency.BIWEEKLY, label: 'Quincenal (15 y 30)' },
  { value: Frequency.MONTHLY, label: 'Mensual' },
  { value: Frequency.BIMONTHLY, label: 'Bimestral' },
];

export const PAYMENT_METHOD_OPTIONS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'credit_card', label: 'Tarjeta de crédito' },
    { value: 'debit_card', label: 'Tarjeta de débito' },
];