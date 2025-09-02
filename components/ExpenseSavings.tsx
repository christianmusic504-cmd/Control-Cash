import React, { useMemo, useState } from 'react';
import { Expense, SavingsGoal, DebitCard, ExpenseType, InstallmentExpense, RecurringExpense, Frequency } from '../types';
// FIX: Removed unused 'parseISO' import that was causing an error.
import { addDays, addMonths, format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { PayWithSavingsModal } from './PayWithSavingsModal';
import { SendIcon } from './icons';

interface ExpenseSavingsProps {
    expenses: Expense[];
    savingsGoals: SavingsGoal[];
    debitCards: DebitCard[];
    handlePayWithSavings: (expenseId: string, paymentAmount: number, sourceCardId: string) => void;
}

const getNextPaymentInfo = (expense: RecurringExpense | InstallmentExpense): { date: Date, amount: number } | null => {
    const today = new Date();
    if (expense.type === ExpenseType.Installment) {
        const nextPaymentIndex = expense.payments.findIndex(p => !p.paid);
        if (nextPaymentIndex === -1) return null;

        const startDate = new Date(expense.startDate + 'T00:00:00');
        const paymentDateCalculator = (index: number): Date => {
            switch (expense.frequency) {
                case Frequency.Weekly: return addDays(startDate, index * 7);
                case Frequency.BiWeekly: return addDays(startDate, index * 15);
                case Frequency.Monthly: return addMonths(startDate, index);
                case Frequency.Bimonthly: return addMonths(startDate, index * 2);
                default: return startDate;
            }
        };
        return {
            date: paymentDateCalculator(nextPaymentIndex),
            amount: expense.payments[nextPaymentIndex].amount
        };
    } else { // Recurring Expense
        const intervalMonths = expense.frequency === Frequency.Bimonthly ? 2 : 1;
        const setDate = (date: Date, day: number) => { const d = new Date(date); d.setDate(day); return d; };
        let nextPaymentDate = setDate(today, expense.dayOfMonth || 1);
        while (!isAfter(nextPaymentDate, today)) {
            nextPaymentDate = addMonths(nextPaymentDate, intervalMonths);
        }
        return { date: nextPaymentDate, amount: expense.amount };
    }
};

const ExpenseSavingItem: React.FC<{
    expense: RecurringExpense | InstallmentExpense;
    totalSaved: number;
    onPay: (expense: Expense, paymentAmount: number) => void;
}> = ({ expense, totalSaved, onPay }) => {
    const paymentInfo = getNextPaymentInfo(expense);
    if (!paymentInfo) return null;

    const { date: nextPaymentDate, amount: nextPaymentAmount } = paymentInfo;
    const progress = (nextPaymentAmount > 0) ? (totalSaved / nextPaymentAmount * 100) : 0;
    const canPay = totalSaved >= nextPaymentAmount;

    return (
        <div className="bg-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
                <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-white">{expense.name}</span>
                    <span className="text-sm text-slate-400">
                        Próximo pago: {format(nextPaymentDate, 'd MMMM yyyy', { locale: es })}
                    </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5 my-1">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className={`text-sm font-semibold ${canPay ? 'text-green-400' : 'text-slate-300'}`}>
                        {totalSaved.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </span>
                    <span className="text-sm text-slate-500">
                        / {nextPaymentAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </span>
                </div>
            </div>
            <button
                onClick={() => onPay(expense, nextPaymentAmount)}
                disabled={!canPay}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition bg-green-500 text-white disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-green-600"
            >
                <SendIcon />
                Pagar
            </button>
        </div>
    );
};

export const ExpenseSavings: React.FC<ExpenseSavingsProps> = ({ expenses, savingsGoals, debitCards, handlePayWithSavings }) => {
    const [modalState, setModalState] = useState<{ isOpen: boolean; expense: Expense | null; paymentAmount: number }>({
        isOpen: false,
        expense: null,
        paymentAmount: 0,
    });

    const expensesWithSavings = useMemo(() => {
        const expenseMap = new Map<string, { expense: RecurringExpense | InstallmentExpense; totalSaved: number }>();

        savingsGoals.forEach(goal => {
            if (goal.status === 'saved') {
                const existing = expenseMap.get(goal.expenseId);
                if (existing) {
                    existing.totalSaved += goal.amount;
                } else {
                    const expense = expenses.find(e => e.id === goal.expenseId) as RecurringExpense | InstallmentExpense | undefined;
                    if (expense && (expense.type === ExpenseType.Installment || expense.type === ExpenseType.Recurring)) {
                        expenseMap.set(goal.expenseId, { expense, totalSaved: goal.amount });
                    }
                }
            }
        });
        
        // Also include expenses that have a plan but 0 saved yet
        expenses.forEach(expense => {
            if ((expense.type === ExpenseType.Installment || expense.type === ExpenseType.Recurring) && !expenseMap.has(expense.id)) {
                 if (savingsGoals.some(g => g.expenseId === expense.id)) {
                     expenseMap.set(expense.id, { expense, totalSaved: 0 });
                 }
            }
        })

        return Array.from(expenseMap.values());
    }, [expenses, savingsGoals]);

    if (expensesWithSavings.length === 0) {
        return null;
    }

    const handleOpenPayModal = (expense: Expense, paymentAmount: number) => {
        setModalState({ isOpen: true, expense, paymentAmount });
    };

    const handleClosePayModal = () => {
        setModalState({ isOpen: false, expense: null, paymentAmount: 0 });
    };

    const handleConfirmPayment = (cardId: string) => {
        if (modalState.expense) {
            handlePayWithSavings(modalState.expense.id, modalState.paymentAmount, cardId);
            handleClosePayModal();
        }
    };

    return (
        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6">Ahorros por Gasto</h2>
            <div className="space-y-4">
                {expensesWithSavings.map(({ expense, totalSaved }) => (
                    <ExpenseSavingItem
                        key={expense.id}
                        expense={expense}
                        totalSaved={totalSaved}
                        onPay={handleOpenPayModal}
                    />
                ))}
            </div>
            {modalState.isOpen && modalState.expense && (
                <PayWithSavingsModal
                    isOpen={modalState.isOpen}
                    onClose={handleClosePayModal}
                    expense={modalState.expense}
                    paymentAmount={modalState.paymentAmount}
                    debitCards={debitCards}
                    onPay={handleConfirmPayment}
                />
            )}
        </div>
    );
};