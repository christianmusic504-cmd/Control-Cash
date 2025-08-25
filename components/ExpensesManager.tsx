
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { RecurringExpense, CasualExpense, ScheduledExpense, Frequency, PaymentMethod, InstallmentExpense } from '../types';
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
      setDate(new Date().toISOString().split('T')[0]); // Default to today
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

const InstallmentExpenseForm: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    expenseToEdit?: InstallmentExpense | null;
}> = ({ isOpen, onClose, expenseToEdit }) => {
    const { addInstallmentExpense, updateInstallmentExpense, creditCards, debitCards } = useAppContext();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [isVariable, setIsVariable] = useState(false);
    const [paymentAmounts, setPaymentAmounts] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [paymentMethodDetail, setPaymentMethodDetail] = useState('');
    const [startDate, setStartDate] = useState('');
    const [totalPayments, setTotalPayments] = useState('');
    const [frequencyType, setFrequencyType] = useState<'weekly' | 'monthly' | 'twice_a_month'>('monthly');
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [dayOfMonth1, setDayOfMonth1] = useState(1);
    const [dayOfMonth2, setDayOfMonth2] = useState(15);

    useEffect(() => {
        const numPayments = parseInt(totalPayments, 10) || 0;
        if (isVariable) {
            if (paymentAmounts.length !== numPayments) {
                setPaymentAmounts(currentAmounts => {
                    const newAmounts = new Array(numPayments).fill('');
                    for (let i = 0; i < Math.min(currentAmounts.length, numPayments); i++) {
                        newAmounts[i] = currentAmounts[i];
                    }
                    return newAmounts;
                });
            }
        }
    }, [totalPayments, isVariable]);


    useEffect(() => {
        if (expenseToEdit) {
            setName(expenseToEdit.name);
            setIsVariable(expenseToEdit.isVariable || false);
            if (expenseToEdit.isVariable && expenseToEdit.paymentAmounts) {
                setPaymentAmounts(expenseToEdit.paymentAmounts.map(String));
            } else {
                 setAmount(String(expenseToEdit.amount));
            }
            setPaymentMethod(expenseToEdit.paymentMethod);
            setPaymentMethodDetail(expenseToEdit.paymentMethodDetail || '');
            setStartDate(new Date(expenseToEdit.startDate).toISOString().split('T')[0]);
            setTotalPayments(String(expenseToEdit.totalPayments));
            setFrequencyType(expenseToEdit.frequencyType);
            setDayOfWeek(expenseToEdit.dayOfWeek || 1);
            setDayOfMonth1(expenseToEdit.dayOfMonth1 || 1);
            setDayOfMonth2(expenseToEdit.dayOfMonth2 || 15);
        } else {
            setName('');
            setAmount('');
            setIsVariable(false);
            setPaymentAmounts([]);
            setPaymentMethod(PaymentMethod.CASH);
            setPaymentMethodDetail('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setTotalPayments('12');
            setFrequencyType('monthly');
            setDayOfWeek(1);
            setDayOfMonth1(1);
            setDayOfMonth2(15);
        }
    }, [expenseToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let expenseData: Omit<InstallmentExpense, 'id'>;

        if (isVariable) {
            const parsedAmounts = paymentAmounts.map(pa => parseFloat(pa) || 0);
            expenseData = {
                name,
                isVariable: true,
                paymentAmounts: parsedAmounts,
                amount: parsedAmounts.reduce((a, b) => a + b, 0),
                paymentMethod,
                paymentMethodDetail: paymentMethod === 'cash' ? undefined : paymentMethodDetail,
                startDate: new Date(startDate).toISOString(),
                totalPayments: parseInt(totalPayments, 10),
                frequencyType,
                dayOfWeek: frequencyType === 'weekly' ? dayOfWeek : undefined,
                dayOfMonth1: frequencyType === 'monthly' || frequencyType === 'twice_a_month' ? dayOfMonth1 : undefined,
                dayOfMonth2: frequencyType === 'twice_a_month' ? dayOfMonth2 : undefined,
                status: expenseToEdit?.status || 'active',
            };
        } else {
             expenseData = {
                name,
                isVariable: false,
                amount: parseFloat(amount),
                paymentMethod,
                paymentMethodDetail: paymentMethod === 'cash' ? undefined : paymentMethodDetail,
                startDate: new Date(startDate).toISOString(),
                totalPayments: parseInt(totalPayments, 10),
                frequencyType,
                dayOfWeek: frequencyType === 'weekly' ? dayOfWeek : undefined,
                dayOfMonth1: frequencyType === 'monthly' || frequencyType === 'twice_a_month' ? dayOfMonth1 : undefined,
                dayOfMonth2: frequencyType === 'twice_a_month' ? dayOfMonth2 : undefined,
                status: expenseToEdit?.status || 'active',
            };
        }

        if (expenseToEdit) {
            updateInstallmentExpense({ ...expenseData, id: expenseToEdit.id } as InstallmentExpense);
        } else {
            addInstallmentExpense(expenseData);
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

    const renderFrequencyDetails = () => {
        switch (frequencyType) {
            case 'weekly':
                return <div><label className="text-sm text-slate-400">Día de la semana</label><select value={dayOfWeek} onChange={e => setDayOfWeek(Number(e.target.value))} className="w-full bg-slate-700 p-2 rounded-md">{WEEK_DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}</select></div>;
            case 'monthly':
                 return <div><label className="text-sm text-slate-400">Día del mes</label><input type="number" value={dayOfMonth1} onChange={e => setDayOfMonth1(Number(e.target.value))} min="1" max="31" className="w-full bg-slate-700 p-2 rounded-md" /></div>;
            case 'twice_a_month':
                return <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-slate-400">Primer día del mes</label><input type="number" value={dayOfMonth1} onChange={e => setDayOfMonth1(Number(e.target.value))} min="1" max="31" className="w-full bg-slate-700 p-2 rounded-md" /></div>
                    <div><label className="text-sm text-slate-400">Segundo día del mes</label><input type="number" value={dayOfMonth2} onChange={e => setDayOfMonth2(Number(e.target.value))} min="1" max="31" className="w-full bg-slate-700 p-2 rounded-md" /></div>
                </div>;
            default:
                return null;
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={expenseToEdit ? "Editar Gasto a Plazos" : "Agregar Gasto a Plazos"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
                
                <div className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
                    <span className="text-sm font-medium text-slate-300">¿Todos los pagos son del mismo monto?</span>
                    <label htmlFor="isVariableToggle" className="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" checked={!isVariable} onChange={() => setIsVariable(v => !v)} id="isVariableToggle" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>

                {!isVariable ? (
                    <input type="number" placeholder="Monto de cada pago" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
                ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 rounded-md bg-slate-700/50 p-3">
                        <h4 className="text-sm text-slate-300">Montos de los pagos:</h4>
                        {paymentAmounts.map((pa, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <label className="text-sm text-slate-400 w-16 shrink-0">Pago {index + 1}:</label>
                                <input type="number" placeholder="Monto" value={pa}
                                    onChange={e => {
                                        const newAmounts = [...paymentAmounts];
                                        newAmounts[index] = e.target.value;
                                        setPaymentAmounts(newAmounts);
                                    }}
                                    required className="w-full bg-slate-600 p-1 rounded-md text-sm" />
                            </div>
                        ))}
                         {paymentAmounts.length === 0 && <p className="text-sm text-slate-400 text-center">Define el número total de pagos.</p>}
                    </div>
                )}


                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-slate-400">Fecha del primer pago</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" /></div>
                    <div><label className="text-sm text-slate-400">Número total de pagos</label><input type="number" placeholder="Ej. 24" value={totalPayments} onChange={e => setTotalPayments(e.target.value)} required min="1" className="w-full bg-slate-700 p-2 rounded-md" /></div>
                </div>
                <div>
                    <label className="text-sm text-slate-400">Frecuencia de pago</label>
                    <select value={frequencyType} onChange={e => setFrequencyType(e.target.value as any)} className="w-full bg-slate-700 p-2 rounded-md">
                        <option value="monthly">Mensual</option>
                        <option value="twice_a_month">Dos veces al mes</option>
                        <option value="weekly">Semanal</option>
                    </select>
                </div>
                {renderFrequencyDetails()}
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
  const { recurringExpenses, deleteRecurringExpense, updateRecurringExpense, casualExpenses, deleteCasualExpense, scheduledExpenses, deleteScheduledExpense, creditCards, debitCards, installmentExpenses, deleteInstallmentExpense, updateInstallmentExpense } = useAppContext();
  
  const [isRecurringModalOpen, setRecurringModalOpen] = useState(false);
  const [recurringToEdit, setRecurringToEdit] = useState<RecurringExpense | null>(null);
  
  const [isCasualModalOpen, setCasualModalOpen] = useState(false);
  const [casualToEdit, setCasualToEdit] = useState<CasualExpense | null>(null);

  const [isScheduledModalOpen, setScheduledModalOpen] = useState(false);
  const [scheduledToEdit, setScheduledToEdit] = useState<ScheduledExpense | null>(null);

  const [isInstallmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [installmentToEdit, setInstallmentToEdit] = useState<InstallmentExpense | null>(null);

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

  const handleEditInstallment = (index: number) => {
    setInstallmentToEdit(installmentExpenses[index]);
    setInstallmentModalOpen(true);
  };
  
  const handleToggleSuspendRecurring = (index: number) => {
    const expense = recurringExpenses[index];
    updateRecurringExpense({ ...expense, status: expense.status === 'active' ? 'suspended' : 'active' });
  };
  
  const handleToggleSuspendInstallment = (index: number) => {
    const expense = installmentExpenses[index];
    updateInstallmentExpense({ ...expense, status: expense.status === 'active' ? 'suspended' : 'active' });
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

  const handleAddInstallment = () => {
      setInstallmentToEdit(null);
      setInstallmentModalOpen(true);
  }

  const getPaymentMethodName = (expense: RecurringExpense | CasualExpense | ScheduledExpense | InstallmentExpense) => {
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

  const installmentData = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return installmentExpenses.map(e => {
        const paymentDates = getInstallmentPaymentDates(e);
        const paymentsMade = paymentDates.filter(d => d.getTime() < today.getTime()).length;
        
        let displayAmount = e.amount;
        if (e.isVariable && e.paymentAmounts && paymentsMade < e.totalPayments) {
            displayAmount = e.paymentAmounts[paymentsMade] || 0;
        }

        return [
            e.name,
            `$${displayAmount.toFixed(2)}`,
            `${paymentsMade} de ${e.totalPayments}`,
            getPaymentMethodName(e),
            e.status.charAt(0).toUpperCase() + e.status.slice(1)
        ];
    });
  }, [installmentExpenses, creditCards, debitCards]);

  const recurringData = recurringExpenses.map(e => [
      e.name,
      `$${e.amount.toFixed(2)}`,
      e.frequency.charAt(0).toUpperCase() + e.frequency.slice(1),
      getPaymentMethodName(e),
      e.status.charAt(0).toUpperCase() + e.status.slice(1)
  ]);
  const casualData = casualExpenses.map(e => [e.name, `$${e.amount.toFixed(2)}`, new Date(e.date).toLocaleDateString('es-ES'), getPaymentMethodName(e)]);
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
          onSuspend={handleToggleSuspendRecurring}
          itemStatus={recurringExpenses.map(e => e.status)}
        />
      </Section>
      
      <Section 
        title="Gastos a Plazos"
        actionButton={<AddButton onClick={handleAddInstallment}>+ Agregar</AddButton>}
      >
        <DataTable
          headers={['Nombre', 'Monto Cuota', 'Progreso', 'Método de Pago', 'Estado']}
          data={installmentData}
          onEdit={handleEditInstallment}
          onDelete={(index) => deleteInstallmentExpense(installmentExpenses[index].id)}
          onSuspend={handleToggleSuspendInstallment}
          itemStatus={installmentExpenses.map(e => e.status)}
        />
      </Section>

      <Section 
        title="Gastos Casuales"
        actionButton={<AddButton onClick={handleAddCasual}>+ Agregar</AddButton>}
      >
        <DataTable
          headers={['Nombre', 'Cantidad', 'Fecha', 'Método de Pago']}
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
      <InstallmentExpenseForm
        isOpen={isInstallmentModalOpen}
        onClose={() => setInstallmentModalOpen(false)}
        expenseToEdit={installmentToEdit}
      />
    </div>
  );
};

const getInstallmentPaymentDates = (expense: InstallmentExpense): Date[] => {
    const dates: Date[] = [];
    if (!expense.startDate || !expense.totalPayments) return dates;
    
    const startDate = new Date(expense.startDate);
    startDate.setUTCHours(0, 0, 0, 0);

    let cursorDate = new Date(startDate);

    while (dates.length < expense.totalPayments) {
        let candidateDate: Date | null = null;
        
        switch (expense.frequencyType) {
            case 'weekly': {
                const dayOfWeek = expense.dayOfWeek!;
                const currentDay = cursorDate.getUTCDay();
                const diff = (dayOfWeek - currentDay + 7) % 7;
                let nextDate = new Date(cursorDate);
                nextDate.setUTCDate(cursorDate.getUTCDate() + diff);
                
                if (dates.length > 0 && nextDate <= dates[dates.length-1]) {
                    nextDate.setUTCDate(nextDate.getUTCDate() + 7);
                }
                candidateDate = nextDate;
                break;
            }
            case 'monthly': {
                const dayOfMonth = expense.dayOfMonth1!;
                let nextDate = new Date(Date.UTC(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth(), dayOfMonth));
                if (dates.length === 0 && nextDate < cursorDate) {
                   nextDate = new Date(Date.UTC(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth() + 1, dayOfMonth));
                } else if (dates.length > 0 && nextDate <= dates[dates.length-1]) {
                   nextDate = new Date(Date.UTC(dates[dates.length-1].getUTCFullYear(), dates[dates.length-1].getUTCMonth() + 1, dayOfMonth));
                }
                candidateDate = nextDate;
                break;
            }
            case 'twice_a_month': {
                const day1 = expense.dayOfMonth1!;
                const day2 = expense.dayOfMonth2!;
                const year = cursorDate.getUTCFullYear();
                const month = cursorDate.getUTCMonth();
                
                let date1 = new Date(Date.UTC(year, month, day1));
                let date2 = new Date(Date.UTC(year, month, day2));

                if(dates.length > 0) {
                    const lastDate = dates[dates.length - 1];
                    if (lastDate.getUTCDate() === day1) { // Last was day1, next is day2
                        if(date2 > lastDate) candidateDate = date2;
                        else candidateDate = new Date(Date.UTC(year, month + 1, day1));
                    } else { // Last was day2, next is day1 of next month
                        candidateDate = new Date(Date.UTC(year, month + 1, day1));
                    }
                } else {
                     if (date1 >= cursorDate) candidateDate = date1;
                     else if (date2 >= cursorDate) candidateDate = date2;
                     else candidateDate = new Date(Date.UTC(year, month + 1, day1));
                }
                break;
            }
        }
        
        if (candidateDate) {
            dates.push(candidateDate);
            cursorDate = new Date(candidateDate);
        } else {
            break; 
        }
    }
    return dates.slice(0, expense.totalPayments);
};

export default ExpensesManager;