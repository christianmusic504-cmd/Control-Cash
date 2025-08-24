import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Frequency, RecurringExpense, RecurringIncome, CreditCard, ScheduledExpense, CasualExpense, DebitCard } from '../types';
import { Modal } from './shared/ManagerComponents';
import useLocalStorage from '../hooks/useLocalStorage';

const Calendar: React.FC = () => {
  const { recurringExpenses, scheduledExpenses, recurringIncomes, creditCards } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    const events = [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    recurringExpenses.forEach(e => {
        if(e.status === 'active') {
            if (e.frequency === Frequency.MONTHLY && e.frequencyDetail === day) events.push({type: 'expense', name: e.name});
            if (e.frequency === Frequency.WEEKLY && e.frequencyDetail === date.getDay()) events.push({type: 'expense', name: e.name});
            if (e.frequency === Frequency.BIWEEKLY && (day === 15 || day === 30)) events.push({type: 'expense', name: e.name});
            if (e.frequency === Frequency.BIMONTHLY) {
                 const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), e.frequencyDetail);
                 if (d.getDate() === day && (d.getMonth() % 2 === 0)) { // Assuming bimonthly is every 2 months starting Jan
                    events.push({type: 'expense', name: e.name});
                 }
            }
        }
    });

    recurringIncomes.forEach(i => {
        if(i.status === 'active') {
            if (i.frequency === Frequency.MONTHLY && i.frequencyDetail === day) events.push({type: 'income', name: i.name});
            if (i.frequency === Frequency.WEEKLY && i.frequencyDetail === date.getDay()) events.push({type: 'income', name: i.name});
            if (i.frequency === Frequency.BIWEEKLY && (day === 15 || day === 30)) events.push({type: 'income', name: i.name});
            if (i.frequency === Frequency.BIMONTHLY) {
                 const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i.frequencyDetail);
                 if (d.getDate() === day && (d.getMonth() % 2 === 0)) {
                    events.push({type: 'income', name: i.name});
                 }
            }
        }
    });

    scheduledExpenses.forEach(e => {
        const eDate = new Date(e.date);
        // Adjust for timezone offset to compare dates correctly
        const eventDate = new Date(eDate.valueOf() + eDate.getTimezoneOffset() * 60 * 1000);
        if (eventDate.getFullYear() === date.getFullYear() && eventDate.getMonth() === date.getMonth() && eventDate.getDate() === day) {
            events.push({type: 'expense', name: e.name});
        }
    });
    
    creditCards.forEach(c => {
      if (c.paymentDueDate === day) events.push({type: 'card', name: `Pagar ${c.name}`});
    })

    return events;
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-700">&lt;</button>
        <h3 className="text-xl font-semibold capitalize">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-700">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-slate-400">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => {
          const events = getEventsForDay(day);
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
          return (
            <div key={day} className={`relative h-20 border border-slate-700 rounded-md p-1 text-left ${isToday ? 'bg-cyan-900/50' : ''}`}>
              <span className={`text-xs ${isToday ? 'font-bold text-cyan-400' : ''}`}>{day}</span>
              <div className="flex flex-col mt-1 space-y-1">
                {events.slice(0, 2).map((event, i) => (
                  <div key={i} className={`h-2 w-2 rounded-full ${event.type === 'income' ? 'bg-green-500' : event.type === 'expense' ? 'bg-red-500' : 'bg-yellow-500'}`} title={event.name}></div>
                ))}
                {events.length > 2 && <div className="text-xs text-slate-400">+{events.length-2} más</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

const getNextDueDate = (item: { frequency: Frequency, frequencyDetail: number }, today: Date): Date => {
    const { frequency, frequencyDetail } = item;
    const year = today.getFullYear();
    let month = today.getMonth();
    const day = today.getDate();

    switch (frequency) {
        case Frequency.WEEKLY: {
            const nextDate = new Date(today);
            const dayOffset = (frequencyDetail - today.getDay() + 7) % 7;
            nextDate.setDate(day + (dayOffset === 0 ? 7 : dayOffset));
            return nextDate;
        }
        case Frequency.BIWEEKLY: {
            if (day < 15) return new Date(year, month, 15);
            if (day < 30) return new Date(year, month, 30);
            return new Date(year, month + 1, 15);
        }
        case Frequency.MONTHLY: {
            let nextDate = new Date(year, month, frequencyDetail);
            if (day >= frequencyDetail) {
                nextDate.setMonth(month + 1);
            }
            return nextDate;
        }
        case Frequency.BIMONTHLY: {
            let nextDate = new Date(year, month, frequencyDetail);
            if (today >= nextDate) {
                 // Assuming bimonthly is every 2 months starting Jan (0, 2, 4...)
                if(month % 2 === 0) { // e.g., Jan
                    nextDate.setMonth(month + 2);
                } else { // e.g., Feb
                    nextDate.setMonth(month + 1);
                }
            }
            return nextDate;
        }
        default: return today;
    }
};

const countPaydays = (startDate: Date, endDate: Date, paydayWeekday: number): number => {
  let count = 0;
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (currentDate.getDay() === paydayWeekday) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return count;
};

// Returns a string like "2024-32" for the week number of the year
const getWeekId = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${weekNo}`;
};

// Returns a formatted string like "Semana del 22 jul. al 28 jul."
const getWeekRangeFromId = (weekId: string): string => {
    const [year, week] = weekId.split('-').map(Number);
    
    // Find the date of the Thursday of week 1
    const d = new Date(Date.UTC(year, 0, 4));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day); // Go to the first Thursday of the year

    // Add weeks to get to the target week's Thursday
    d.setUTCDate(d.getUTCDate() + (week - 1) * 7);
    
    // d is now the Thursday of the target week.
    // Monday is Thursday - 3 days
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - 3);

    // Sunday is Monday + 6 days
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const locale = 'es-ES';
    
    return `Semana del ${monday.toLocaleDateString(locale, options)} al ${sunday.toLocaleDateString(locale, options)}`;
}


type Goal = {
  name: string;
  amountToSave: number;
};

const SaveGoalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  onSave: (debitCardId: string) => void;
}> = ({ isOpen, onClose, goal, onSave }) => {
  const { debitCards } = useAppContext();
  const [selectedCardId, setSelectedCardId] = useState<string>('');

  useEffect(() => {
    if (isOpen && debitCards.length > 0) {
      setSelectedCardId(debitCards[0].id);
    }
  }, [isOpen, debitCards]);

  const handleSave = () => {
    if (selectedCardId) {
      onSave(selectedCardId);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ahorrar para "${goal.name}"`}>
      <div className="space-y-4">
        <p>Selecciona la tarjeta de débito donde quieres guardar <span className="font-bold text-green-400">${goal.amountToSave.toFixed(2)}</span>.</p>
        {debitCards.length > 0 ? (
          <>
            <select
              value={selectedCardId}
              onChange={e => setSelectedCardId(e.target.value)}
              className="w-full bg-slate-700 p-2 rounded-md"
            >
              {debitCards.map(card => (
                <option key={card.id} value={card.id}>{card.name} (Saldo: ${(card.balance || 0).toFixed(2)})</option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={!selectedCardId}
              className="w-full bg-cyan-500 text-white p-2 rounded-md font-semibold hover:bg-cyan-600 disabled:bg-slate-600"
            >
              Confirmar Ahorro
            </button>
          </>
        ) : (
          <p className="text-orange-400">No tienes tarjetas de débito. Agrega una en la sección de "Tarjetas" para poder ahorrar.</p>
        )}
      </div>
    </Modal>
  );
};

const WeeklySavingsInfo: React.FC = () => {
    const { recurringIncomes, recurringExpenses, creditCards, scheduledExpenses, casualExpenses, addFundsToDebitCard } = useAppContext();
    const [isSaveModalOpen, setSaveModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [savedGoals, setSavedGoals] = useLocalStorage<{ [key: string]: string }>('saved-weekly-goals', {});

    const currentWeekId = getWeekId(new Date());

    const handleOpenSaveModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setSaveModalOpen(true);
    };

    const handleSaveGoal = (debitCardId: string) => {
        if (selectedGoal) {
            addFundsToDebitCard(debitCardId, selectedGoal.amountToSave);
            setSavedGoals(prev => ({
                ...prev,
                [selectedGoal.name]: currentWeekId
            }));
        }
    };

    const savingsGoals = useMemo(() => {
        const primaryIncome = recurringIncomes.find(i => i.frequency === Frequency.WEEKLY && i.status === 'active');
        if (!primaryIncome) return { recurrent: [], scheduled: [] };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Calculate savings for recurring expenses (non-credit card)
        const recurrent = recurringExpenses
            .filter(e => e.status === 'active' && e.paymentMethod !== 'credit_card')
            .map(item => {
                const nextDueDate = getNextDueDate(item, today);
                const incomeCount = countPaydays(today, nextDueDate, primaryIncome.frequencyDetail);
                const amountToSave = incomeCount > 0 ? item.amount / incomeCount : item.amount;

                return {
                    name: item.name,
                    amountToSave,
                    totalAmount: item.amount,
                    nextDueDate: nextDueDate.toLocaleDateString('es-ES'),
                };
            });

        // 2. Calculate savings for credit cards based on billing cycle
        const cards = creditCards.map(c => {
            const year = today.getFullYear();
            const month = today.getMonth();
            const day = today.getDate();

            let statementStartDate, statementEndDate;
            if (day > c.closingDate) {
                // We are past this month's closing date. The current cycle ends next month.
                statementStartDate = new Date(year, month, c.closingDate + 1);
                statementEndDate = new Date(year, month + 1, c.closingDate);
            } else {
                // We are before this month's closing date. The current cycle ends this month.
                statementStartDate = new Date(year, month - 1, c.closingDate + 1);
                statementEndDate = new Date(year, month, c.closingDate);
            }

            let nextPaymentDueDate;
            if (c.paymentDueDate > c.closingDate) {
                nextPaymentDueDate = new Date(statementEndDate.getFullYear(), statementEndDate.getMonth(), c.paymentDueDate);
            } else {
                nextPaymentDueDate = new Date(statementEndDate.getFullYear(), statementEndDate.getMonth() + 1, c.paymentDueDate);
            }

            let oneTimeExpensesTotal = 0;
            [...scheduledExpenses, ...casualExpenses].forEach(e => {
                if ('date' in e && e.date && e.paymentMethod === 'credit_card' && e.paymentMethodDetail === c.id) {
                    const expenseDate = new Date(e.date);
                    if (expenseDate >= statementStartDate && expenseDate <= statementEndDate) {
                        oneTimeExpensesTotal += e.amount;
                    }
                }
            });

            const recurringMonthlyTotal = recurringExpenses
                .filter(e => e.paymentMethod === 'credit_card' && e.paymentMethodDetail === c.id && e.status === 'active')
                .reduce((sum, e) => {
                    let monthlyAmount = 0;
                    switch (e.frequency) {
                        case Frequency.WEEKLY: monthlyAmount = e.amount * 4.33; break;
                        case Frequency.BIWEEKLY: monthlyAmount = e.amount * 2; break;
                        case Frequency.MONTHLY: monthlyAmount = e.amount; break;
                        case Frequency.BIMONTHLY: monthlyAmount = e.amount / 2; break;
                    }
                    return sum + monthlyAmount;
                }, 0);
            
            const estimatedPayment = oneTimeExpensesTotal + recurringMonthlyTotal;
            if (estimatedPayment <= 0) return null;

            const incomeCount = countPaydays(today, nextPaymentDueDate, primaryIncome.frequencyDetail);
            const amountToSave = incomeCount > 0 ? estimatedPayment / incomeCount : estimatedPayment;

            return {
                name: `Pago T.C. ${c.name}`,
                amountToSave,
                totalAmount: estimatedPayment,
                nextDueDate: nextPaymentDueDate.toLocaleDateString('es-ES'),
            };
        }).filter((g): g is NonNullable<typeof g> => g !== null);


        // 3. Calculate savings for scheduled expenses (non-credit card)
        const scheduled = scheduledExpenses
            .filter(e => new Date(e.date) >= today && e.paymentMethod !== 'credit_card')
            .map(item => {
                const dueDate = new Date(new Date(item.date).valueOf() + new Date().getTimezoneOffset() * 60 * 1000);
                dueDate.setHours(0,0,0,0);
                const incomeCount = countPaydays(today, dueDate, primaryIncome.frequencyDetail);
                const amountToSave = incomeCount > 0 ? item.amount / incomeCount : item.amount;
                return {
                    name: item.name,
                    amountToSave,
                    totalAmount: item.amount,
                    nextDueDate: dueDate.toLocaleDateString('es-ES'),
                };
            });

        return { recurrent: [...recurrent, ...cards], scheduled };
    }, [recurringIncomes, recurringExpenses, creditCards, scheduledExpenses, casualExpenses]);
    
    const totalWeeklySavings = useMemo(() => {
        const recurrentTotal = savingsGoals.recurrent.reduce((sum, goal) => sum + goal.amountToSave, 0);
        const scheduledTotal = savingsGoals.scheduled.reduce((sum, goal) => sum + goal.amountToSave, 0);
        return recurrentTotal + scheduledTotal;
    }, [savingsGoals]);

    const SavingsList: React.FC<{ 
        goals: typeof savingsGoals.recurrent, 
        title: string, 
        onSaveClick: (goal: Goal) => void,
        savedGoals: { [key: string]: string },
        currentWeekId: string
    }> = ({ goals, title, onSaveClick, savedGoals, currentWeekId }) => (
        <>
            {goals.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold mb-3 text-cyan-300">{title}</h4>
                    <ul className="space-y-4">
                        {goals.map((goal, index) => {
                            const isSavedForWeek = savedGoals[goal.name] === currentWeekId;
                            return (
                                <li key={index} className="p-4 bg-slate-700/50 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{goal.name}</span>
                                        <span className="text-lg font-bold text-green-400">${goal.amountToSave.toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Ahorrar por sueldo para cubrir ${goal.totalAmount.toFixed(2)} el {goal.nextDueDate}.
                                    </p>
                                    {isSavedForWeek ? (
                                        <div className="mt-3 w-full text-center py-1.5 rounded-md text-sm font-semibold bg-slate-600 text-slate-300 cursor-default">
                                            ✓ Ahorrado para la {getWeekRangeFromId(currentWeekId)}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onSaveClick({ name: goal.name, amountToSave: goal.amountToSave })}
                                            className="mt-3 w-full py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm bg-green-600/80 text-white hover:bg-green-700/80"
                                        >
                                            Ahorrar
                                        </button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}
        </>
    );

    const hasGoals = savingsGoals.recurrent.length > 0 || savingsGoals.scheduled.length > 0;
    const hasWeeklyIncome = recurringIncomes.some(i => i.frequency === Frequency.WEEKLY && i.status === 'active');

    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Metas de Ahorro Semanal</h3>
            {hasWeeklyIncome ? (
                hasGoals ? (
                    <>
                        <div className="mb-6 p-4 bg-slate-900/50 rounded-lg text-center border border-slate-700">
                            <h4 className="text-slate-400 text-sm font-medium">Ahorro Total Sugerido para la Semana</h4>
                            <p className="text-3xl font-bold text-green-400">${totalWeeklySavings.toFixed(2)}</p>
                        </div>
                        <div className="space-y-6">
                            <SavingsList goals={savingsGoals.recurrent} title="Pagos Recurrentes y Tarjetas" onSaveClick={handleOpenSaveModal} savedGoals={savedGoals} currentWeekId={currentWeekId} />
                            <SavingsList goals={savingsGoals.scheduled} title="Gastos Programados" onSaveClick={handleOpenSaveModal} savedGoals={savedGoals} currentWeekId={currentWeekId} />
                        </div>
                    </>
                ) : (
                    <p className="text-slate-400">No hay gastos recurrentes o programados para calcular metas. ¡Estás al día!</p>
                )
            ) : (
                <p className="text-slate-400">Agrega un ingreso recurrente semanal para calcular tus metas de ahorro.</p>
            )}
            {selectedGoal && (
                <SaveGoalModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setSaveModalOpen(false)}
                    goal={selectedGoal}
                    onSave={handleSaveGoal}
                />
            )}
        </div>
    );
};


const Dashboard: React.FC = () => {
  const { recurringExpenses, casualExpenses, recurringIncomes, casualIncomes, scheduledExpenses, debitCards } = useAppContext();

  const totalMonthlyIncome = useMemo(() => {
    const recurring = recurringIncomes.reduce((acc, curr) => {
      let monthlyAmount = 0;
      if(curr.status !== 'active') return acc;
      switch (curr.frequency) {
        case Frequency.WEEKLY: monthlyAmount = curr.amount * 4.33; break;
        case Frequency.BIWEEKLY: monthlyAmount = curr.amount * 2; break;
        case Frequency.MONTHLY: monthlyAmount = curr.amount; break;
        case Frequency.BIMONTHLY: monthlyAmount = curr.amount / 2; break;
      }
      return acc + monthlyAmount;
    }, 0);
    // Casual incomes are not included in monthly projections, they are one-time
    return recurring;
  }, [recurringIncomes]);

  const totalMonthlyExpenses = useMemo(() => {
    const recurring = recurringExpenses.reduce((acc, curr) => {
      let monthlyAmount = 0;
       if(curr.status !== 'active') return acc;
      switch (curr.frequency) {
        case Frequency.WEEKLY: monthlyAmount = curr.amount * 4.33; break;
        case Frequency.BIWEEKLY: monthlyAmount = curr.amount * 2; break;
        case Frequency.MONTHLY: monthlyAmount = curr.amount; break;
        case Frequency.BIMONTHLY: monthlyAmount = curr.amount / 2; break;
      }
      return acc + monthlyAmount;
    }, 0);
    // Casual and scheduled expenses are not recurring monthly expenses
    return recurring;
  }, [recurringExpenses]);

  const accumulatedSavings = useMemo(() => {
    return debitCards.reduce((total, card) => total + (card.balance || 0), 0);
  }, [debitCards]);

  const netBalance = totalMonthlyIncome - totalMonthlyExpenses;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium">Ingreso Mensual (Recurrente)</h3>
          <p className="text-3xl font-bold text-green-400">${totalMonthlyIncome.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium">Gasto Mensual (Recurrente)</h3>
          <p className="text-3xl font-bold text-red-400">${totalMonthlyExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium">Ahorro Acumulado</h3>
          <p className="text-3xl font-bold text-sky-400">${accumulatedSavings.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium">Balance Neto Mensual</h3>
          <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
            ${netBalance.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Calendar />
        </div>
        <div>
            <WeeklySavingsInfo />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;