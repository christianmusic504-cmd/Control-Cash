import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, Income, Expense, SavingsGoal, DebitCard, IncomeType, Frequency, ExpenseType, RecurringIncome, CreditCard, InstallmentExpense, RecurringExpense, FinancialEvent } from '../types';
import { 
    addDays, addMonths, differenceInDays, differenceInMonths, eachDayOfInterval, endOfMonth, endOfWeek, 
    format, getDate, getDay, getDaysInMonth, getMonth, isAfter, isBefore, isSameDay, isWithinInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, LandmarkIcon, SaveIcon, TrendingDownIcon, TrendingUpIcon, WalletIcon, XIcon } from './icons';
import { EVENT_COLORS } from '../constants';
import { ExpenseSavings } from './ExpenseSavings';


const InfoCard: React.FC<{title: string, amount: number, icon: React.ReactNode, color: string}> = ({title, amount, icon, color}) => (
    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 flex items-start justify-between">
        <div>
            <p className="text-slate-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{amount.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</p>
        </div>
        <div className={`p-3 bg-slate-800 rounded-lg ${color}`}>{icon}</div>
    </div>
);

const SavingsGoalItem: React.FC<{goal: SavingsGoal, onSave: (goal: SavingsGoal) => void, onPostpone: (id: string) => void}> = ({goal, onSave, onPostpone}) => {
    const progress = (goal.totalAmount > 0) ? ((goal.totalAmount - goal.amount) / goal.totalAmount * 100) : 0;
    const isSaved = goal.status === 'saved';
    const isPostponed = goal.status === 'postponed';
    const isSpent = goal.status === 'spent';
    const isInactive = isSaved || isPostponed || isSpent;

    const getProgressBarClass = () => {
        if (isSpent) return 'bg-slate-600';
        if (isSaved) return 'bg-green-700';
        if (isPostponed) return 'bg-yellow-700';
        return 'bg-green-500';
    };

    const getProgressWidth = () => {
        if (isSpent || isSaved) return 100;
        if (isPostponed) return 0;
        return progress;
    };

    return (
        <div className={`p-4 rounded-lg flex items-center gap-4 transition ${isInactive ? 'bg-slate-800/50 opacity-60' : 'bg-slate-800'}`}>
            <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                    <span className={`font-semibold ${isInactive ? 'text-slate-400' : 'text-white'}`}>{goal.expenseName}</span>
                    <span className={`text-sm ${isInactive ? 'text-slate-500' : 'text-slate-400'}`}>
                         {isPostponed ? (
                            <span className="font-semibold text-yellow-500">$0.00 (Redistribuido)</span>
                         ) : (
                            <>
                            {goal.amount.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})} / {goal.totalAmount.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}
                            </>
                         )}
                    </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${getProgressBarClass()}`} style={{width: `${getProgressWidth()}%`}}></div>
                </div>
            </div>
            {goal.status === 'pending' && (
                <div className="flex gap-2">
                    <button onClick={() => onSave(goal)} title="Ahorrar" className="p-2 bg-green-500/20 text-green-400 rounded-md hover:bg-green-500/40 transition"><SaveIcon /></button>
                    <button onClick={() => onPostpone(goal.id)} title="Posponer" className="p-2 bg-yellow-500/20 text-yellow-400 rounded-md hover:bg-yellow-500/40 transition"><ClockIcon /></button>
                </div>
            )}
            {isPostponed && (
                <span className="text-xs font-bold text-yellow-400 uppercase">Pospuesto</span>
            )}
             {isSaved && (
                <span className="text-xs font-bold text-green-400 uppercase">Ahorrado</span>
            )}
            {isSpent && (
                <span className="text-xs font-bold text-slate-500 uppercase">Utilizado</span>
            )}
        </div>
    );
};

const DebitCardSelectionModal: React.FC<{goal: SavingsGoal, debitCards: DebitCard[], onSelect: (cardId: string) => void, onClose: () => void}> = ({goal, debitCards, onSelect, onClose}) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><XIcon/></button>
            <h2 className="text-2xl font-bold text-white mb-2">Seleccionar Tarjeta de Débito</h2>
            <p className="text-slate-400 mb-6">¿Dónde quieres guardar los {goal.amount.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})} para "{goal.expenseName}"?</p>
            <div className="space-y-3">
                {debitCards.map(card => (
                    <button key={card.id} onClick={() => onSelect(card.id)} className="w-full text-left p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
                        <p className="font-semibold text-white">{card.name}</p>
                        <p className="text-sm text-slate-400">Saldo actual: {card.balance.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</p>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

// FIX: Polyfill for startOfWeek as it was reported as not exported from date-fns.
const getStartOfWeek = (date: Date, options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): Date => {
  const weekStartsOn = options?.weekStartsOn ?? 0;
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const FinancialCalendar: React.FC<{
  events: FinancialEvent[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}> = ({ events, currentDate, setCurrentDate }) => {
  // FIX: Polyfill for startOfMonth as it was reported as not exported from date-fns.
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const monthStart = startOfMonth(currentDate);
  const calendarEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const calendarStart = getStartOfWeek(monthStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // FIX: Replace subMonths with addMonths(..., -1) as subMonths was reported as not exported.
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white capitalize">{format(currentDate, 'MMMM yyyy', { locale: es })}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"><ChevronLeftIcon /></button>
          <button onClick={nextMonth} className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"><ChevronRightIcon /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-slate-400 mb-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());
          const dayEvents = events.filter(e => isSameDay(e.date, day));

          return (
            <div key={day.toISOString()} className={`h-24 p-1 rounded-md transition flex flex-col ${isCurrentMonth ? 'bg-slate-800/50' : 'bg-slate-900/30 text-slate-600'} ${isToday ? 'bg-green-500/20' : ''}`}>
              <span className={`flex items-center justify-center text-xs h-6 w-6 rounded-full mb-1 ${isToday ? 'bg-green-500 text-white font-bold' : ''}`}>
                {format(day, 'd')}
              </span>
              <div className="space-y-0.5 overflow-hidden text-xs flex-1">
                {dayEvents.slice(0, 2).map(event => (
                    <div key={event.id} title={`${event.title} - ${event.amount.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}`} className={`px-1 rounded-sm truncate text-left ${EVENT_COLORS[event.type]}`}>
                        {event.title}
                    </div>
                ))}
                 {dayEvents.length > 2 && <div className="text-slate-500 text-center text-[10px]">+ {dayEvents.length - 2} más</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

interface DashboardProps {
    savingsGoals: SavingsGoal[];
    cards: Card[];
    incomes: Income[];
    expenses: Expense[];
    setSavingsGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    handlePayWithSavings: (expenseId: string, paymentAmount: number, sourceCardId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ savingsGoals, cards, incomes, expenses, setSavingsGoals, setCards, handlePayWithSavings }) => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [calendarDate, setCalendarDate] = useState(new Date());
    
    const weekStart = getStartOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

    const weeklyIncomes = incomes.filter(i => {
        if (i.type === IncomeType.Recurring && i.frequency === Frequency.Weekly && !i.suspended) {
          return true;
        }
        return false;
    }).reduce((sum, i) => sum + i.amount, 0);

    const weeklyGoals = savingsGoals.filter(g => {
        const goalWeekStartDate = new Date(g.weekStartDate + 'T00:00:00');
        return isSameDay(goalWeekStartDate, weekStart);
    });
    
    const weeklySavingsProgrammed = weeklyGoals.reduce((sum, g) => g.status === 'pending' ? sum + g.amount : sum, 0);
    
    const savingsMadeThisWeek = savingsGoals.reduce((sum, g) => {
        if ((g.status === 'saved' || g.status === 'spent') && g.savedDate) {
            const savedDate = new Date(g.savedDate);
            if (isWithinInterval(savedDate, { start: weekStart, end: weekEnd })) {
                return sum + g.amount;
            }
        }
        return sum;
    }, 0);

    const freeCash = weeklyIncomes - savingsMadeThisWeek;
    
    const accumulatedSavings = (cards.filter(c => c.type === 'debit') as DebitCard[]).reduce((sum, card) => sum + card.balance, 0);

    const [debitCardModal, setDebitCardModal] = useState<{isOpen: boolean; goal: SavingsGoal | null}>({isOpen: false, goal: null});
    const debitCards = cards.filter(c => c.type === 'debit') as DebitCard[];

    const handleSave = (goal: SavingsGoal) => {
        if(debitCards.length > 1) {
            setDebitCardModal({isOpen: true, goal});
        } else if (debitCards.length === 1) {
            saveToCard(goal, debitCards[0].id);
        } else {
            alert("Por favor, agregue una tarjeta de débito para guardar sus ahorros.");
        }
    };

    const saveToCard = (goal: SavingsGoal, cardId: string) => {
        setSavingsGoals(prev => prev.map(g => g.id === goal.id ? {...g, status: 'saved', savedDate: new Date().toISOString()} : g));
        setCards(prev => prev.map(c => c.id === cardId ? {...c, balance: (c as DebitCard).balance + goal.amount} : c));
        setDebitCardModal({isOpen: false, goal: null});
    };
    
    const handlePostpone = (goalId: string) => {
        setSavingsGoals(prevGoals => {
            const goals = [...prevGoals];
            const goalToPostpone = goals.find(g => g.id === goalId);
            if (!goalToPostpone || goalToPostpone.status !== 'pending') return prevGoals;

            const futureGoals = goals.filter(g =>
                g.expenseId === goalToPostpone.expenseId &&
                g.status === 'pending' &&
                isAfter(new Date(g.weekStartDate + 'T00:00:00'), new Date(goalToPostpone.weekStartDate + 'T00:00:00'))
            );

            if (futureGoals.length > 0) {
                const amountToRedistribute = goalToPostpone.amount;
                const amountPerGoal = amountToRedistribute / futureGoals.length;
                futureGoals.forEach(g => {
                    const goalIndex = goals.findIndex(goal => goal.id === g.id);
                    if (goalIndex !== -1) {
                        goals[goalIndex] = { ...goals[goalIndex], amount: goals[goalIndex].amount + amountPerGoal };
                    }
                });
            }
            
            const postponedGoalIndex = goals.findIndex(g => g.id === goalId);
            if (postponedGoalIndex !== -1) {
                goals[postponedGoalIndex] = { ...goals[postponedGoalIndex], status: 'postponed' };
            }

            return goals;
        });
    };

    const nextWeek = () => setCurrentWeek(addDays(currentWeek, 7));
    const prevWeek = () => setCurrentWeek(addDays(currentWeek, -7));
    
    const calculateWeeklySavingsGoals = useCallback(() => {
        // FIX: Polyfill for startOfDay as it was reported as not exported from date-fns.
        const startOfDay = (date: Date) => new Date(new Date(date).setHours(0,0,0,0));
        const today = startOfDay(new Date());
        const weeklyIncome = incomes.find(i =>
            i.type === IncomeType.Recurring &&
            i.frequency === Frequency.Weekly &&
            !i.suspended
        ) as RecurringIncome | undefined;

        if (!weeklyIncome || weeklyIncome.dayOfWeek === undefined) {
            setSavingsGoals([]);
            return;
        }

        const newGoals: SavingsGoal[] = [];
        const expensesToProcess = expenses.filter(e => {
            if ('suspended' in e && e.suspended) return false;
            if (e.type === ExpenseType.Installment) return true;
            if (e.type === ExpenseType.Recurring && e.frequency !== Frequency.Weekly) return true;
            return false;
        });

        for (const expense of expensesToProcess) {
            let paymentEvents: { dueDate: Date, periodStart: Date, amount: number }[] = [];

            if (expense.type === ExpenseType.Recurring) {
                const intervalMonths = expense.frequency === Frequency.Bimonthly ? 2 : 1;
                let paymentDays: {day: number, amount: number}[] = [];

                if (expense.frequency === Frequency.BiWeekly) {
                     if (expense.dayOfMonth) paymentDays.push({ day: expense.dayOfMonth, amount: expense.amount / 2 });
                     if (expense.dayOfMonth2) paymentDays.push({ day: expense.dayOfMonth2, amount: expense.amount / 2 });
                } else {
                    paymentDays.push({ day: expense.dayOfMonth || 1, amount: expense.amount });
                }

                for (const p of paymentDays) {
                    // FIX: Polyfill for setDate as it was reported as not exported from date-fns.
                    const setDate = (date: Date, day: number) => { const d = new Date(date); d.setDate(day); return d; };
                    let nextPaymentDate = setDate(today, p.day);
                    while (!isAfter(nextPaymentDate, today)) {
                        nextPaymentDate = addMonths(nextPaymentDate, intervalMonths);
                    }
                    // FIX: Replace subMonths with addMonths(..., -n) as subMonths was reported as not exported.
                    const previousPaymentDate = addMonths(nextPaymentDate, -intervalMonths);
                    paymentEvents.push({ dueDate: nextPaymentDate, periodStart: previousPaymentDate, amount: p.amount });
                }
            } else if (expense.type === ExpenseType.Installment) {
                const nextPaymentIndex = expense.payments.findIndex(p => !p.paid);
                if (nextPaymentIndex === -1) continue;

                const expenseAmount = expense.payments[nextPaymentIndex].amount;
                const startDate = new Date(expense.startDate);

                const paymentDateCalculator = (index: number): Date => {
                    switch (expense.frequency) {
                        case Frequency.Weekly: return addDays(startDate, index * 7);
                        case Frequency.BiWeekly: return addDays(startDate, index * 15);
                        case Frequency.Monthly: return addMonths(startDate, index);
                        case Frequency.Bimonthly: return addMonths(startDate, index * 2);
                        default: return startDate;
                    }
                };
                
                const nextPaymentDate = paymentDateCalculator(nextPaymentIndex);
                const previousPaymentDate = nextPaymentIndex === 0 ? startDate : paymentDateCalculator(nextPaymentIndex - 1);
                
                paymentEvents.push({ dueDate: nextPaymentDate, periodStart: previousPaymentDate, amount: expenseAmount });
            }

            for (const event of paymentEvents) {
                if (isBefore(event.dueDate, event.periodStart)) continue;
                
                const paymentPeriodDays = eachDayOfInterval({ start: event.periodStart, end: event.dueDate });
                const incomeDatesInPeriod = paymentPeriodDays.filter(day => getDay(day) === weeklyIncome.dayOfWeek);
                const incomeCount = incomeDatesInPeriod.length;
                if (incomeCount === 0) continue;

                const weeklyQuota = event.amount / incomeCount;

                for (const incomeDate of incomeDatesInPeriod) {
                    const weekStart = getStartOfWeek(incomeDate, { weekStartsOn: 1 });
                    const weekStartDateString = format(weekStart, 'yyyy-MM-dd');
                    const goalId = `${expense.id}-${format(event.dueDate, 'yyyy-MM-dd')}-${weekStartDateString}`;

                    newGoals.push({
                        id: goalId,
                        expenseId: expense.id,
                        expenseName: expense.name,
                        weekStartDate: weekStartDateString,
                        amount: weeklyQuota,
                        totalAmount: event.amount,
                        dueDate: format(event.dueDate, 'yyyy-MM-dd'),
                        status: 'pending',
                    });
                }
            }
        }
        
        setSavingsGoals(prevGoals => {
            const prevGoalsMap = new Map(prevGoals.map(g => [g.id, g]));
            return newGoals.map(newGoal => {
                const existingGoal = prevGoalsMap.get(newGoal.id);
                if (existingGoal) {
                    let finalAmount = newGoal.amount; // Default to the newly calculated amount

                    // If the goal's status is 'saved' or 'postponed', its amount is considered final and should be preserved.
                    if (existingGoal.status === 'saved' || existingGoal.status === 'postponed' || existingGoal.status === 'spent') {
                        finalAmount = existingGoal.amount;
                    } 
                    // If the goal is 'pending' and its underlying total expense amount has NOT changed,
                    // preserve the existing amount. This handles cases where the amount was adjusted
                    // by postponing another week's goal.
                    else if (existingGoal.status === 'pending' && existingGoal.totalAmount === newGoal.totalAmount) {
                        finalAmount = existingGoal.amount;
                    }
                    // If the goal is 'pending' and the totalAmount has changed, `finalAmount` remains `newGoal.amount`,
                    // effectively resetting the goal to its new base quota.

                    return {
                        ...newGoal,
                        status: existingGoal.status, // Always preserve status
                        amount: finalAmount,
                        savedDate: existingGoal.savedDate,
                    };
                }
                return newGoal;
            });
        });
    }, [expenses, incomes, setSavingsGoals]);


    useEffect(() => {
        calculateWeeklySavingsGoals();
    }, [calculateWeeklySavingsGoals]);

     const financialEvents = useMemo(() => {
        const eventMap = new Map<string, FinancialEvent>();
        const addEvent = (event: Omit<FinancialEvent, 'id'>, baseId: string) => {
            const eventId = `${baseId}-${format(event.date, 'yyyy-MM-dd')}`;
            if (!eventMap.has(eventId)) {
                eventMap.set(eventId, { ...event, id: eventId });
            }
        };
        
        // FIX: Polyfill for startOfMonth as it was reported as not exported from date-fns.
        const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
        const monthStart = startOfMonth(calendarDate);
        const monthEnd = endOfMonth(calendarDate);
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

        daysInMonth.forEach(day => {
            [...expenses, ...incomes].forEach(item => {
                if ('date' in item && item.date && isSameDay(day, new Date(item.date + 'T00:00:00'))) {
                    addEvent({
                        date: day,
                        title: item.name,
                        amount: item.amount,
                        type: 'paymentMethod' in item ? 'expense' : 'income',
                    }, item.id);
                }
            });

            const scheduledItems = [
                ...incomes.filter(i => i.type === IncomeType.Recurring && !i.suspended),
                ...expenses.filter(e => (e.type === ExpenseType.Recurring || e.type === ExpenseType.Installment) && !e.suspended)
            ] as (RecurringIncome | RecurringExpense | InstallmentExpense)[];

            scheduledItems.forEach(item => {
                let occursOnDay = false;
                let eventAmount = item.amount;

                if (item.type === ExpenseType.Installment) {
                    // FIX: Polyfill for startOfDay as it was reported as not exported from date-fns.
                    const startOfDay = (date: Date) => new Date(new Date(date).setHours(0,0,0,0));
                    const startDate = startOfDay(new Date(item.startDate + 'T00:00:00'));
                     if (isBefore(day, startDate)) return;

                    const daysDiff = differenceInDays(day, startDate);
                    const totalPayments = item.payments.length;
                    if (daysDiff >= 0) {
                        if (item.frequency === Frequency.Weekly && daysDiff % 7 === 0 && (daysDiff/7 < totalPayments) ) occursOnDay = true;
                        if (item.frequency === Frequency.BiWeekly && daysDiff % 15 === 0 && (daysDiff/15 < totalPayments)) occursOnDay = true;
                        if ((item.frequency === Frequency.Monthly || item.frequency === Frequency.Bimonthly) && getDate(day) === getDate(startDate)) {
                            const monthDiff = differenceInMonths(day, startDate);
                            if (monthDiff >= 0) {
                                if (item.frequency === Frequency.Monthly && monthDiff < totalPayments) occursOnDay = true;
                                if (item.frequency === Frequency.Bimonthly && monthDiff % 2 === 0 && (monthDiff/2 < totalPayments)) occursOnDay = true;
                            }
                        }
                    }
                } else { // Recurring
                    if (item.frequency === Frequency.Weekly && getDay(day) === item.dayOfWeek) occursOnDay = true;
                    if (item.frequency === Frequency.Monthly && getDate(day) === item.dayOfMonth) occursOnDay = true;
                    // FIX: Bimonthly logic should be deterministic, not based on the current date.
                    // This will trigger on odd months (Jan, Mar, May...).
                    if (item.frequency === Frequency.Bimonthly && getDate(day) === item.dayOfMonth && getMonth(day) % 2 === 0) occursOnDay = true;
                    // FIX: Check item type before accessing dayOfMonth2, which only exists on RecurringExpense
                    if (item.frequency === Frequency.BiWeekly) {
                        if ('paymentMethod' in item) { // Distinguishes RecurringExpense
                            if (getDate(day) === item.dayOfMonth || getDate(day) === item.dayOfMonth2) {
                                occursOnDay = true;
                                eventAmount = item.amount / 2;
                            }
                        } else { // Is RecurringIncome, which only has one payment day for bi-weekly
                            if (getDate(day) === item.dayOfMonth) {
                                occursOnDay = true;
                            }
                        }
                    }
                }

                if (occursOnDay) {
                    addEvent({
                        date: day,
                        title: item.name,
                        amount: eventAmount,
                        type: 'paymentMethod' in item ? 'expense' : 'income',
                    }, item.id);
                }
            });
        });

        cards.filter((c): c is CreditCard => c.type === 'credit').forEach(card => {
            // FIX: Polyfill for setDate as it was reported as not exported from date-fns.
            const setDate = (date: Date, day: number) => { const d = new Date(date); d.setDate(day); return d; };
            const paymentDate = setDate(monthStart, card.paymentDay);
             if (isWithinInterval(paymentDate, { start: monthStart, end: monthEnd })) {
                addEvent({
                    date: paymentDate,
                    title: `Pago ${card.name}`,
                    amount: 0,
                    type: 'payment',
                }, card.id);
            }
        });

        return Array.from(eventMap.values());
    }, [calendarDate, expenses, incomes, cards]);

    return (
        <div className="space-y-8">
             <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoCard title="Ingreso Semanal" amount={weeklyIncomes} icon={<TrendingUpIcon />} color="text-green-400" />
                <InfoCard title="Ahorro Programado" amount={weeklySavingsProgrammed} icon={<TrendingDownIcon />} color="text-red-400" />
                <InfoCard title="Dinero Libre" amount={freeCash} icon={<WalletIcon />} color="text-blue-400" />
                <InfoCard title="Ahorro Acumulado" amount={accumulatedSavings} icon={<LandmarkIcon />} color="text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Ahorro Semanal</h2>
                            <p className="text-slate-400">
                                {format(weekStart, 'd MMMM', { locale: es })} - {format(weekEnd, 'd MMMM yyyy', { locale: es })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={prevWeek} className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"><ChevronLeftIcon /></button>
                            <button onClick={nextWeek} className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"><ChevronRightIcon /></button>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                        {weeklyGoals.length > 0 ? weeklyGoals.map(goal => (
                            <SavingsGoalItem key={goal.id} goal={goal} onSave={handleSave} onPostpone={handlePostpone} />
                        )) : <p className="text-slate-500 text-center py-8">No hay metas de ahorro para esta semana.</p>}
                    </div>
                </div>

                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    <FinancialCalendar events={financialEvents} currentDate={calendarDate} setCurrentDate={setCalendarDate} />
                </div>
            </div>

            <ExpenseSavings 
                expenses={expenses}
                savingsGoals={savingsGoals}
                debitCards={debitCards}
                handlePayWithSavings={handlePayWithSavings}
            />

             {debitCardModal.isOpen && debitCardModal.goal && (
                <DebitCardSelectionModal 
                    goal={debitCardModal.goal} 
                    debitCards={debitCards} 
                    onSelect={(cardId) => saveToCard(debitCardModal.goal!, cardId)} 
                    onClose={() => setDebitCardModal({isOpen: false, goal: null})} 
                />
            )}
        </div>
    );
};