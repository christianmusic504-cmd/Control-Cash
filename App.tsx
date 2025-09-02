import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Card, Expense, Income, View, PaymentMethod, SavingsGoal, ExpenseType, RecurringExpense, InstallmentExpense, DebitCard, RecurringIncome, CreditCard, CasualExpense, ScheduledExpense, CasualIncome, IncomeType } from './types';
import { Sidebar } from './components/Sidebar';
import { CrudView } from './components/CrudView';
import { Dashboard } from './components/Dashboard';
import { Modal } from './components/Modal';
import { CardForm } from './components/forms/CardForm';
import { ExpenseForm } from './components/forms/ExpenseForm';
import { IncomeForm } from './components/forms/IncomeForm';
import { DebitCardTransferModal } from './components/DebitCardTransferModal';

type Item = Card | Expense | Income;
export type ItemType = 'card' | 'expense' | 'income';


// --- Main App Component ---
export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [cards, setCards] = useLocalStorage<Card[]>('cards', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [incomes, setIncomes] = useLocalStorage<Income[]>('incomes', []);
  const [savingsGoals, setSavingsGoals] = useLocalStorage<SavingsGoal[]>('savingsGoals', []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ItemType | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [transferModal, setTransferModal] = useState<{isOpen: boolean, cardToDelete: DebitCard | null}>({isOpen: false, cardToDelete: null});

  const openModal = (type: ItemType, item: Item | null = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
  };

  const handleSave = (itemData: any) => {
    const id = itemData.id || crypto.randomUUID();

    switch (modalType) {
        case 'card': {
            let cleanCard: Card;
            if (itemData.type === 'credit') {
                cleanCard = {
                    type: 'credit',
                    id,
                    name: String(itemData.name),
                    creditLimit: Number(itemData.creditLimit) || 0,
                    cutoffDay: Number(itemData.cutoffDay) || 1,
                    paymentDay: Number(itemData.paymentDay) || 1,
                };
            } else { // debit
                cleanCard = {
                    type: 'debit',
                    id,
                    name: String(itemData.name),
                    balance: Number(itemData.balance) || 0,
                };
            }
            setCards(prev => {
                const index = prev.findIndex(c => c.id === id);
                if (index > -1) {
                    const newCards = [...prev];
                    newCards[index] = cleanCard;
                    return newCards;
                }
                return [...prev, cleanCard];
            });
            break;
        }

        case 'expense': {
            let cleanExpense: Expense;
            
            switch (itemData.type as ExpenseType) {
                case ExpenseType.Recurring:
                    cleanExpense = {
                        id,
                        name: String(itemData.name),
                        amount: Number(itemData.amount) || 0,
                        type: ExpenseType.Recurring,
                        frequency: itemData.frequency,
                        paymentMethod: itemData.paymentMethod,
                        paymentSourceId: itemData.paymentSourceId || undefined,
                        dayOfWeek: Number(itemData.dayOfWeek),
                        dayOfMonth: Number(itemData.dayOfMonth),
                        dayOfMonth2: Number(itemData.dayOfMonth2),
                        suspended: itemData.suspended || false,
                    };
                    break;
                case ExpenseType.Installment:
                     const totalAmount = Number(itemData.totalAmount) || 0;
                     const numberOfPayments = Number(itemData.numberOfPayments) || 1;
                     const installmentAmount = numberOfPayments > 0 ? totalAmount / numberOfPayments : 0;
                     const existingExpense = expenses.find(e => e.id === id) as InstallmentExpense | undefined;
                     cleanExpense = {
                        id,
                        name: String(itemData.name),
                        amount: installmentAmount,
                        type: ExpenseType.Installment,
                        totalAmount: totalAmount,
                        numberOfPayments: numberOfPayments,
                        payments: existingExpense?.payments || Array.from({ length: numberOfPayments }, () => ({ amount: installmentAmount, paid: false })),
                        frequency: itemData.frequency,
                        paymentMethod: itemData.paymentMethod,
                        paymentSourceId: itemData.paymentSourceId || undefined,
                        startDate: String(itemData.startDate),
                        suspended: itemData.suspended || false,
                     };
                    break;
                case ExpenseType.Casual:
                    cleanExpense = { 
                        id, 
                        name: String(itemData.name), 
                        amount: Number(itemData.amount) || 0, 
                        type: ExpenseType.Casual, 
                        date: String(itemData.date) 
                    };
                    break;
                case ExpenseType.Scheduled:
                    cleanExpense = { 
                        id, 
                        name: String(itemData.name), 
                        amount: Number(itemData.amount) || 0, 
                        type: ExpenseType.Scheduled, 
                        date: String(itemData.date) 
                    };
                    break;
                default:
                    console.error("Unknown expense type:", itemData.type);
                    closeModal();
                    return;
            }
            setExpenses(prev => {
                const index = prev.findIndex(e => e.id === id);
                if (index > -1) {
                    const newExpenses = [...prev];
                    newExpenses[index] = cleanExpense;
                    return newExpenses;
                }
                return [...prev, cleanExpense];
            });
            break;
        }

        case 'income': {
            let cleanIncome: Income;
            if (itemData.type === IncomeType.Recurring) {
                cleanIncome = {
                    id,
                    name: String(itemData.name),
                    amount: Number(itemData.amount) || 0,
                    type: IncomeType.Recurring,
                    frequency: itemData.frequency,
                    dayOfWeek: Number(itemData.dayOfWeek),
                    dayOfMonth: Number(itemData.dayOfMonth),
                    suspended: itemData.suspended || false,
                };
            } else { // Casual
                cleanIncome = {
                    id,
                    name: String(itemData.name),
                    amount: Number(itemData.amount) || 0,
                    type: IncomeType.Casual,
                    date: String(itemData.date),
                };
            }
             setIncomes(prev => {
                const index = prev.findIndex(i => i.id === id);
                if (index > -1) {
                    const newIncomes = [...prev];
                    newIncomes[index] = cleanIncome;
                    return newIncomes;
                }
                return [...prev, cleanIncome];
            });
            break;
        }
    }
    closeModal();
  };
  
  const disassociateExpensesFromCard = (cardId: string) => {
    setExpenses(prevExpenses =>
        prevExpenses.map(exp => {
            if (('paymentSourceId' in exp) && exp.paymentSourceId === cardId) {
                const updatedExp = { ...exp, paymentMethod: PaymentMethod.Cash, paymentSourceId: undefined };
                return updatedExp;
            }
            return exp;
        })
    );
  };

  const handleBalanceTransferAndDelete = (toCardId: string) => {
    const fromCard = transferModal.cardToDelete;
    if (!fromCard) return;

    disassociateExpensesFromCard(fromCard.id);
    
    setCards(prev => {
        const remainingCards = prev.filter(c => c.id !== fromCard.id);
        const finalCards = remainingCards.map(c => {
            if (c.id === toCardId && c.type === 'debit') {
                return { ...c, balance: c.balance + fromCard.balance };
            }
            return c;
        });
        return finalCards;
    });

    setTransferModal({ isOpen: false, cardToDelete: null });
  };

  const handleDelete = (type: ItemType, id: string) => {
    if (type === 'card') {
        const cardToDelete = cards.find(c => c.id === id);
        if (!cardToDelete) return;

        const linkedExpenses = expenses.filter(
            exp => 'paymentSourceId' in exp && exp.paymentSourceId === id
        );

        let confirmMessage = `¿Estás seguro de que quieres eliminar la tarjeta '${cardToDelete.name}'?`;
        if (linkedExpenses.length > 0) {
            confirmMessage += ` Esto cambiará el método de pago a 'Efectivo' para ${linkedExpenses.length} gasto(s) asociado(s).`;
        }

        if (window.confirm(confirmMessage)) {
            if (cardToDelete.type === 'debit' && cardToDelete.balance > 0) {
                const otherDebitCards = cards.filter(c => c.type === 'debit' && c.id !== id);
                if (otherDebitCards.length > 0) {
                    setTransferModal({ isOpen: true, cardToDelete: cardToDelete });
                    return; 
                } else {
                    alert("No puedes eliminar esta tarjeta porque es la única tarjeta de débito con saldo. Para eliminarla, primero transfiere el saldo o crea otra tarjeta de débito.");
                    return;
                }
            }
            
            disassociateExpensesFromCard(id);
            setCards(prev => prev.filter(c => c.id !== id));
        }

    } else if (type === 'expense') {
        const expenseToDelete = expenses.find(e => e.id === id);
        if (!expenseToDelete) return;

        const hasGoals = savingsGoals.some(goal => goal.expenseId === id);
        let confirmMessage = `¿Estás seguro de que quieres eliminar el gasto '${expenseToDelete.name}'?`;
        if (hasGoals) {
            confirmMessage += ' Esto también eliminará todas sus metas de ahorro asociadas.';
        }

        if (window.confirm(confirmMessage)) {
            setSavingsGoals(prev => prev.filter(goal => goal.expenseId !== id));
            setExpenses(prev => prev.filter(e => e.id !== id));
        }
    } else if (type === 'income') {
        const incomeToDelete = incomes.find(i => i.id === id);
        if (!incomeToDelete) return;

        if (window.confirm(`¿Estás seguro de que quieres eliminar el ingreso '${incomeToDelete.name}'?`)) {
            setIncomes(prev => prev.filter(i => i.id !== id));
        }
    }
  };


  const handleToggleSuspend = (type: 'expense' | 'income', id: string) => {
    if (type === 'expense') {
      setExpenses(prev =>
        prev.map(item => {
          if (item.id === id && (item.type === ExpenseType.Recurring || item.type === ExpenseType.Installment)) {
            return { ...item, suspended: !item.suspended };
          }
          return item;
        })
      );
    } else if (type === 'income') {
      setIncomes(prev =>
        prev.map(item => {
          if (item.id === id && item.type === IncomeType.Recurring) {
            return { ...item, suspended: !item.suspended };
          }
          return item;
        })
      );
    }
  };

  const renderView = () => {
    switch (view) {
      case 'expenses':
        return <CrudView title="Gastos" items={expenses} itemType="expense" openModal={openModal} onDelete={handleDelete} onToggleSuspend={handleToggleSuspend} />;
      case 'income':
        return <CrudView title="Ingresos" items={incomes} itemType="income" openModal={openModal} onDelete={handleDelete} onToggleSuspend={handleToggleSuspend} />;
      case 'cards':
        return <CrudView title="Tarjetas" items={cards} itemType="card" openModal={openModal} onDelete={handleDelete} />;
      case 'dashboard':
      default:
        return <Dashboard savingsGoals={savingsGoals} cards={cards} incomes={incomes} expenses={expenses} setSavingsGoals={setSavingsGoals} setCards={setCards}/>;
    }
  };
  
  const renderModalContent = () => {
      if (!modalType) return null;
      switch(modalType) {
          case 'card': return <CardForm itemToEdit={editingItem as Card | null} onSave={handleSave} onCancel={closeModal} />;
          case 'expense': return <ExpenseForm itemToEdit={editingItem as Expense | null} onSave={handleSave} onCancel={closeModal} cards={cards} />;
          case 'income': return <IncomeForm itemToEdit={editingItem as Income | null} onSave={handleSave} onCancel={closeModal} />;
          default: return null;
      }
  }

  return (
    <div className="flex h-screen bg-slate-900 font-sans">
      <Sidebar currentView={view} setView={setView} />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {renderView()}
      </main>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={`${editingItem ? 'Editar' : 'Nuevo'} ${modalType}`}>
        {renderModalContent()}
      </Modal>
      {transferModal.isOpen && transferModal.cardToDelete && (
        <DebitCardTransferModal
            isOpen={transferModal.isOpen}
            onClose={() => setTransferModal({ isOpen: false, cardToDelete: null })}
            cardToDelete={transferModal.cardToDelete}
            otherDebitCards={cards.filter(c => c.type === 'debit' && c.id !== transferModal.cardToDelete?.id) as DebitCard[]}
            onTransfer={handleBalanceTransferAndDelete}
        />
      )}
    </div>
  );
}