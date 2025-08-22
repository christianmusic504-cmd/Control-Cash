
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { RecurringExpense, CasualExpense, ScheduledExpense, Frequency, PaymentMethod } from '../types';
import { FREQUENCY_OPTIONS, WEEK_DAYS, PAYMENT_METHOD_OPTIONS } from '../constants';
import { ManagerHeader, Section, DataTable, Modal } from './shared/ManagerComponents';

const RecurringExpenseForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: RecurringExpense | null;
}> = ({ isOpen, onClose, expenseToEdit }) => {
  const { addRecurringExpense, updateRecurringExpense, creditCards, debitCards } = useAppContext();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [frequencyDetail, setFrequencyDetail] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentMethodDetail, setPaymentMethodDetail] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setName(expenseToEdit.name);
      setAmount(String(expenseToEdit.amount));
      setFrequency(expenseToEdit.frequency);
      setFrequencyDetail(expenseToEdit.frequencyDetail);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setPaymentMethodDetail(expenseToEdit.paymentMethodDetail || '');
    } else {
      setName('');
      setAmount('');
      setFrequency(Frequency.MONTHLY);
      setFrequencyDetail(1);
      setPaymentMethod(PaymentMethod.CASH);
      setPaymentMethodDetail('');
    }
  }, [expenseToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = {
      name,
      amount: parseFloat(amount),
      frequency,
      frequencyDetail,
      paymentMethod,
      paymentMethodDetail: paymentMethod === 'cash' ? undefined : paymentMethodDetail,
      status: expenseToEdit?.status || 'active'
    };
    if (expenseToEdit) {
      updateRecurringExpense({ ...expenseData, id: expenseToEdit.id });
    } else {
      addRecurringExpense(expenseData as Omit<RecurringExpense, 'id'>);
    }
    onClose();
  };

  const renderFrequencyDetailInput = () => {
    if (frequency === Frequency.WEEKLY) {
      return (
        <select value={frequencyDetail} onChange={e => setFrequencyDetail(Number(e.target.value))} className="w-full bg-slate-700 p-2 rounded-md">
          {WEEK_DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
        </select>
      );
    }
    if (frequency === Frequency.BIWEEKLY) {
      return <p className="text-sm text-slate-400">Pagos los días 15 y 30.</p>;
    }
    return (
      <input type="number" value={frequencyDetail} onChange={e => setFrequencyDetail(Number(e.target.value))} min="1" max="31" className="w-full bg-slate-700 p-2 rounded-md" />
    );
  };

  const renderPaymentMethodDetail = () => {
    if (paymentMethod === PaymentMethod.CREDIT_CARD) {
        return <select value={paymentMethodDetail} onChange={e => setPaymentMethodDetail(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md">
            <option value="">Selecciona una tarjeta</option>
            {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
    }
    if (paymentMethod === PaymentMethod.DEBIT_CARD) {
        return <select value={paymentMethodDetail} onChange={e => setPaymentMethodDetail(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md">
            <option value="">Selecciona una tarjeta</option>
            {debitCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
    }
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expenseToEdit ? "Editar Gasto Recurrente" : "Agregar Gasto Recurrente"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <input type="number" placeholder="Cantidad" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <select value={frequency} onChange={e => setFrequency(e.target.value as Frequency)} className="w-full bg-slate-700 p-2 rounded-md">
          {FREQUENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {renderFrequencyDetailInput()}
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full bg-slate-700 p-2 rounded-md">
            {PAYMENT_METHOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {renderPaymentMethodDetail()}
        <button type="submit" className="w-full bg-cyan-500 text-white p-2 rounded-md font-semibold hover:bg-cyan-600">
          {expenseToEdit ? 'Guardar Cambios' : 'Agregar Gasto'}
        </button>
      </form>
    </Modal>
  );
};

const CasualExpenseForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: CasualExpense | null;
}> = ({ isOpen, onClose, expenseToEdit }) => {
  const { addCasualExpense, updateCasualExpense, creditCards, debitCards } = useAppContext();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentMethodDetail, setPaymentMethodDetail] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setName(expenseToEdit.name);
      setAmount(String(expenseToEdit.amount));
      setPaymentMethod(expenseToEdit.paymentMethod || PaymentMethod.CASH);
      setPaymentMethodDetail(expenseToEdit.paymentMethodDetail || '');
    } else {
      setName('');
      setAmount('');
      setPaymentMethod(PaymentMethod.CASH);
      setPaymentMethodDetail('');
    }
  }, [expenseToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = {
      name,
      amount: parseFloat(amount),
      paymentMethod,
      paymentMethodDetail: paymentMethod === 'cash' ? undefined : paymentMethodDetail
    };
    if (expenseToEdit) {
      updateCasualExpense({ ...expenseData, id: expenseToEdit.id });
    } else {
      addCasualExpense(expenseData as Omit<CasualExpense, 'id'>);
    }
    onClose();
  };
  
  const renderPaymentMethodDetail = () => {
    if (paymentMethod === PaymentMethod.CREDIT_CARD) {
        return <select value={paymentMethodDetail} onChange={e => setPaymentMethodDetail(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md">
            <option value="">Selecciona una tarjeta</option>
            {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
    }
    if (paymentMethod === PaymentMethod.DEBIT_CARD) {
        return <select value={paymentMethodDetail} onChange={e => setPaymentMethodDetail(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md">
            <option value="">Selecciona una tarjeta</option>
            {debitCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
    }
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expenseToEdit ? "Editar Gasto Casual" : "Agregar Gasto Casual"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <input type="number" placeholder="Cantidad" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full bg-slate-700 p-2 rounded-md">
            {PAYMENT_METHOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {renderPaymentMethodDetail()}
        <button type="submit" className="w-full bg-cyan-500 text-white p-2 rounded-md font-semibold hover:bg-cyan-600">
          {expenseToEdit ? 'Guardar Cambios' : 'Agregar Gasto'}
        </button>
      </form>
    </Modal>
  );
};

const ScheduledExpenseForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: ScheduledExpense | null;
}> = ({ isOpen, onClose, expenseToEdit }) => {
  const { addScheduledExpense, updateScheduledExpense, creditCards, debitCards } = useAppContext();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentMethodDetail, setPaymentMethodDetail] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setName(expenseToEdit.name);
      setAmount(String(expenseToEdit.amount));
      setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
      setPaymentMethod(expenseToEdit.paymentMethod || PaymentMethod.CASH);
      setPaymentMethodDetail(expenseToEdit.paymentMethodDetail || '');
    } else {
      setName('');
      setAmount('');
      setDate('');
      setPaymentMethod(PaymentMethod.CASH);
      setPaymentMethodDetail('');
    }
  }, [expenseToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = {
      name,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      paymentMethod,
      paymentMethodDetail: paymentMethod === 'cash' ? undefined : paymentMethodDetail
    };
    if (expenseToEdit) {
      updateScheduledExpense({ ...expenseData, id: expenseToEdit.id });
    } else {
      addScheduledExpense(expenseData as Omit<ScheduledExpense, 'id'>);
    }
    onClose();
  };

  const renderPaymentMethodDetail = () => {
    if (paymentMethod === PaymentMethod.CREDIT_CARD) {
        return <select value={paymentMethodDetail} onChange={e => setPaymentMethodDetail(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md">
            <option value="">Selecciona una tarjeta</option>
            {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
    }
    if (paymentMethod === PaymentMethod.DEBIT_CARD) {
        return <select value={paymentMethodDetail} onChange={e => setPaymentMethodDetail(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md">
            <option value="">Selecciona una tarjeta</option>
            {debitCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
    }
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expenseToEdit ? "Editar Gasto Programado" : "Agregar Gasto Programado"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <input type="number" placeholder="Cantidad" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full bg-slate-700 p-2 rounded-md">
            {PAYMENT_METHOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {renderPaymentMethodDetail()}
        <button type="submit" className="w-full bg-cyan-500 text-white p-2 rounded-md font-semibold hover:bg-cyan-600">
          {expenseToEdit ? 'Guardar Cambios' : 'Agregar Gasto'}
        </button>
      </form>
    </Modal>
  );
};


const ExpensesManager: React.FC = () => {
  const { recurringExpenses, deleteRecurringExpense, updateRecurringExpense, casualExpenses, deleteCasualExpense, scheduledExpenses, deleteScheduledExpense, creditCards, debitCards } = useAppContext();
  
  const [isRecurringModalOpen, setRecurringModalOpen] = useState(false);
  const [recurringToEdit, setRecurringToEdit] = useState<RecurringExpense | null>(null);
  
  const [isCasualModalOpen, setCasualModalOpen] = useState(false);
  const [casualToEdit, setCasualToEdit] = useState<CasualExpense | null>(null);

  const [isScheduledModalOpen, setScheduledModalOpen] = useState(false);
  const [scheduledToEdit, setScheduledToEdit] = useState<ScheduledExpense | null>(null);

  const handleEditRecurring = (index: number) => {
    setRecurringToEdit(recurringExpenses[index]);
    setRecurringModalOpen(true);
  };

  const handleEditCasual = (index: number) => {
    setCasualToEdit(casualExpenses[index]);
    setCasualModalOpen(true);
  };
  
  const handleEditScheduled = (index: number) => {
    setScheduledToEdit(scheduledExpenses[index]);
    setScheduledModalOpen(true);
  };
  
  const handleToggleSuspend = (index: number) => {
    const expense = recurringExpenses[index];
    updateRecurringExpense({ ...expense, status: expense.status === 'active' ? 'suspended' : 'active' });
  };
  
  const handleAddRecurring = () => {
    setRecurringToEdit(null);
    setRecurringModalOpen(true);
  };

  const handleAddCasual = () => {
    setCasualToEdit(null);
    setCasualModalOpen(true);
  };

  const handleAddScheduled = () => {
    setScheduledToEdit(null);
    setScheduledModalOpen(true);
  };

  const getPaymentMethodName = (expense: RecurringExpense | CasualExpense | ScheduledExpense) => {
    if (!('paymentMethod' in expense) || !expense.paymentMethod) {
      return 'Efectivo';
    }
    switch (expense.paymentMethod) {
      case PaymentMethod.CASH:
        return 'Efectivo';
      case PaymentMethod.CREDIT_CARD:
        const creditCard = creditCards.find(c => c.id === expense.paymentMethodDetail);
        return creditCard ? creditCard.name : 'Tarjeta de Crédito';
      case PaymentMethod.DEBIT_CARD:
        const debitCard = debitCards.find(d => d.id === expense.paymentMethodDetail);
        return debitCard ? debitCard.name : 'Tarjeta de Débito';
      default:
        return 'N/A';
    }
  };
  
  const recurringData = recurringExpenses.map(e => [
      e.name,
      `$${e.amount.toFixed(2)}`,
      e.frequency.charAt(0).toUpperCase() + e.frequency.slice(1),
      getPaymentMethodName(e),
      e.status.charAt(0).toUpperCase() + e.status.slice(1)
  ]);
  const casualData = casualExpenses.map(e => [e.name, `$${e.amount.toFixed(2)}`, getPaymentMethodName(e)]);
  const scheduledData = scheduledExpenses.map(e => [e.name, `$${e.amount.toFixed(2)}`, new Date(e.date).toLocaleDateString('es-ES'), getPaymentMethodName(e)]);
  
  const AddButton: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
    <button 
      onClick={onClick} 
      className="bg-cyan-500/80 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-cyan-600/80 transition-colors shadow-sm"
    >
      {children}
    </button>
  );

  return (
    <div>
      <ManagerHeader title="Administrar Gastos" />

      <Section 
        title="Gastos Recurrentes"
        actionButton={<AddButton onClick={handleAddRecurring}>+ Agregar</AddButton>}
      >
        <DataTable
          headers={['Nombre', 'Cantidad', 'Frecuencia', 'Método de Pago', 'Estado']}
          data={recurringData}
          onEdit={handleEditRecurring}
          onDelete={(index) => deleteRecurringExpense(recurringExpenses[index].id)}
          onSuspend={handleToggleSuspend}
          itemStatus={recurringExpenses.map(e => e.status)}
        />
      </Section>

      <Section 
        title="Gastos Casuales"
        actionButton={<AddButton onClick={handleAddCasual}>+ Agregar</AddButton>}
      >
        <DataTable
          headers={['Nombre', 'Cantidad', 'Método de Pago']}
          data={casualData}
          onEdit={handleEditCasual}
          onDelete={(index) => deleteCasualExpense(casualExpenses[index].id)}
        />
      </Section>
      
      <Section 
        title="Gastos Programados"
        actionButton={<AddButton onClick={handleAddScheduled}>+ Agregar</AddButton>}
        >
        <DataTable
          headers={['Nombre', 'Cantidad', 'Fecha', 'Método de Pago']}
          data={scheduledData}
          onEdit={handleEditScheduled}
          onDelete={(index) => deleteScheduledExpense(scheduledExpenses[index].id)}
        />
      </Section>

      <RecurringExpenseForm 
        isOpen={isRecurringModalOpen}
        onClose={() => setRecurringModalOpen(false)}
        expenseToEdit={recurringToEdit}
      />
      <CasualExpenseForm
        isOpen={isCasualModalOpen}
        onClose={() => setCasualModalOpen(false)}
        expenseToEdit={casualToEdit}
      />
      <ScheduledExpenseForm
        isOpen={isScheduledModalOpen}
        onClose={() => setScheduledModalOpen(false)}
        expenseToEdit={scheduledToEdit}
      />
    </div>
  );
};

export default ExpensesManager;