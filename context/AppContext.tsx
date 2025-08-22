import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { AppState, RecurringExpense, CasualExpense, ScheduledExpense, RecurringIncome, CasualIncome, CreditCard, DebitCard } from '../types';

const initialState: AppState = {
  recurringExpenses: [],
  casualExpenses: [],
  scheduledExpenses: [],
  recurringIncomes: [],
  casualIncomes: [],
  creditCards: [],
  debitCards: [],
};

interface AppContextType extends AppState {
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => void;
  updateRecurringExpense: (expense: RecurringExpense) => void;
  deleteRecurringExpense: (id: string) => void;
  addCasualExpense: (expense: Omit<CasualExpense, 'id'>) => void;
  updateCasualExpense: (expense: CasualExpense) => void;
  deleteCasualExpense: (id: string) => void;
  addScheduledExpense: (expense: Omit<ScheduledExpense, 'id'>) => void;
  updateScheduledExpense: (expense: ScheduledExpense) => void;
  deleteScheduledExpense: (id: string) => void;
  addRecurringIncome: (income: Omit<RecurringIncome, 'id'>) => void;
  updateRecurringIncome: (income: RecurringIncome) => void;
  deleteRecurringIncome: (id: string) => void;
  addCasualIncome: (income: Omit<CasualIncome, 'id'>) => void;
  updateCasualIncome: (income: CasualIncome) => void;
  deleteCasualIncome: (id: string) => void;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
  updateCreditCard: (card: CreditCard) => void;
  deleteCreditCard: (id: string) => void;
  addDebitCard: (card: Omit<DebitCard, 'id'>) => void;
  updateDebitCard: (card: DebitCard) => void;
  deleteDebitCard: (id: string) => void;
  addFundsToDebitCard: (cardId: string, amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useLocalStorage<AppState>('control-cash-data', initialState);

  const crudFactory = <T extends { id: string },>(key: keyof AppState) => ({
    add: (item: Omit<T, 'id'>) => {
      setState(prev => ({ ...prev, [key]: [...(prev[key] as unknown as T[]), { ...item, id: crypto.randomUUID() } as T] }));
    },
    update: (item: T) => {
      setState(prev => ({ ...prev, [key]: (prev[key] as unknown as T[]).map(i => i.id === item.id ? item : i) }));
    },
    remove: (id: string) => {
      setState(prev => ({ ...prev, [key]: (prev[key] as unknown as T[]).filter(i => i.id !== id) }));
    },
  });

  const recurringExpensesCrud = crudFactory<RecurringExpense>('recurringExpenses');
  const casualExpensesCrud = crudFactory<CasualExpense>('casualExpenses');
  const scheduledExpensesCrud = crudFactory<ScheduledExpense>('scheduledExpenses');
  const recurringIncomesCrud = crudFactory<RecurringIncome>('recurringIncomes');
  const casualIncomesCrud = crudFactory<CasualIncome>('casualIncomes');
  const creditCardsCrud = crudFactory<CreditCard>('creditCards');
  const debitCardsCrud = crudFactory<DebitCard>('debitCards');

  const addFundsToDebitCard = (cardId: string, amount: number) => {
    setState(prev => {
      const updatedDebitCards = prev.debitCards.map(card => {
        if (card.id === cardId) {
          return { ...card, balance: (card.balance || 0) + amount };
        }
        return card;
      });
      return { ...prev, debitCards: updatedDebitCards };
    });
  };

  const value: AppContextType = {
    ...state,
    addRecurringExpense: recurringExpensesCrud.add,
    updateRecurringExpense: recurringExpensesCrud.update,
    deleteRecurringExpense: recurringExpensesCrud.remove,
    addCasualExpense: casualExpensesCrud.add,
    updateCasualExpense: casualExpensesCrud.update,
    deleteCasualExpense: casualExpensesCrud.remove,
    addScheduledExpense: scheduledExpensesCrud.add,
    updateScheduledExpense: scheduledExpensesCrud.update,
    deleteScheduledExpense: scheduledExpensesCrud.remove,
    addRecurringIncome: recurringIncomesCrud.add,
    updateRecurringIncome: recurringIncomesCrud.update,
    deleteRecurringIncome: recurringIncomesCrud.remove,
    addCasualIncome: casualIncomesCrud.add,
    updateCasualIncome: casualIncomesCrud.update,
    deleteCasualIncome: casualIncomesCrud.remove,
    addCreditCard: creditCardsCrud.add,
    updateCreditCard: creditCardsCrud.update,
    deleteCreditCard: creditCardsCrud.remove,
    addDebitCard: debitCardsCrud.add,
    updateDebitCard: debitCardsCrud.update,
    deleteDebitCard: debitCardsCrud.remove,
    addFundsToDebitCard,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};