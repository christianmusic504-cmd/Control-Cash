import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { RecurringIncome, CasualIncome, Frequency } from '../types';
import { FREQUENCY_OPTIONS, WEEK_DAYS } from '../constants';
import { ManagerHeader, Section, DataTable, Modal } from './shared/ManagerComponents';

const RecurringIncomeForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  incomeToEdit?: RecurringIncome | null;
}> = ({ isOpen, onClose, incomeToEdit }) => {
  const { addRecurringIncome, updateRecurringIncome } = useAppContext();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [frequencyDetail, setFrequencyDetail] = useState(1);

  useEffect(() => {
    if (incomeToEdit) {
      setName(incomeToEdit.name);
      setAmount(String(incomeToEdit.amount));
      setFrequency(incomeToEdit.frequency);
      setFrequencyDetail(incomeToEdit.frequencyDetail);
    } else {
      setName('');
      setAmount('');
      setFrequency(Frequency.MONTHLY);
      setFrequencyDetail(1);
    }
  }, [incomeToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incomeData = {
      name,
      amount: parseFloat(amount),
      frequency,
      frequencyDetail,
      status: incomeToEdit?.status || 'active'
    };
    if (incomeToEdit) {
      updateRecurringIncome({ ...incomeData, id: incomeToEdit.id });
    } else {
      addRecurringIncome(incomeData as Omit<RecurringIncome, 'id'>);
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
      <input type="number" placeholder="Día del mes" value={frequencyDetail} onChange={e => setFrequencyDetail(Number(e.target.value))} min="1" max="31" className="w-full bg-slate-700 p-2 rounded-md" />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={incomeToEdit ? "Editar Ingreso Recurrente" : "Agregar Ingreso Recurrente"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre (ej. Salario)" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <input type="number" placeholder="Cantidad" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <select value={frequency} onChange={e => setFrequency(e.target.value as Frequency)} className="w-full bg-slate-700 p-2 rounded-md">
          {FREQUENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {renderFrequencyDetailInput()}
        <button type="submit" className="w-full bg-cyan-500 text-white p-2 rounded-md font-semibold hover:bg-cyan-600">
          {incomeToEdit ? 'Guardar Cambios' : 'Agregar Ingreso'}
        </button>
      </form>
    </Modal>
  );
};

const CasualIncomeForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  incomeToEdit?: CasualIncome | null;
}> = ({ isOpen, onClose, incomeToEdit }) => {
  const { addCasualIncome, updateCasualIncome } = useAppContext();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (incomeToEdit) {
      setName(incomeToEdit.name);
      setAmount(String(incomeToEdit.amount));
    } else {
      setName('');
      setAmount('');
    }
  }, [incomeToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incomeData = {
      name,
      amount: parseFloat(amount),
    };
    if (incomeToEdit) {
      updateCasualIncome({ ...incomeData, id: incomeToEdit.id });
    } else {
      addCasualIncome(incomeData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={incomeToEdit ? "Editar Ingreso Casual" : "Agregar Ingreso Casual"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <input type="number" placeholder="Cantidad" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <button type="submit" className="w-full bg-cyan-500 text-white p-2 rounded-md font-semibold hover:bg-cyan-600">
          {incomeToEdit ? 'Guardar Cambios' : 'Agregar Ingreso'}
        </button>
      </form>
    </Modal>
  );
};

const IncomeManager: React.FC = () => {
  const { recurringIncomes, deleteRecurringIncome, updateRecurringIncome, casualIncomes, deleteCasualIncome } = useAppContext();
  
  const [isRecurringModalOpen, setRecurringModalOpen] = useState(false);
  const [recurringToEdit, setRecurringToEdit] = useState<RecurringIncome | null>(null);

  const [isCasualModalOpen, setCasualModalOpen] = useState(false);
  const [casualToEdit, setCasualToEdit] = useState<CasualIncome | null>(null);
  
  const handleEditRecurring = (index: number) => {
    setRecurringToEdit(recurringIncomes[index]);
    setRecurringModalOpen(true);
  };

  const handleEditCasual = (index: number) => {
    setCasualToEdit(casualIncomes[index]);
    setCasualModalOpen(true);
  };

  const handleToggleSuspend = (index: number) => {
    const income = recurringIncomes[index];
    updateRecurringIncome({ ...income, status: income.status === 'active' ? 'suspended' : 'active' });
  };
  
  const handleAddRecurring = () => {
    setRecurringToEdit(null);
    setRecurringModalOpen(true);
  };
  
  const handleAddCasual = () => {
    setCasualToEdit(null);
    setCasualModalOpen(true);
  };

  const recurringData = recurringIncomes.map(i => [
      i.name,
      `$${i.amount.toFixed(2)}`,
      i.frequency.charAt(0).toUpperCase() + i.frequency.slice(1),
      i.status.charAt(0).toUpperCase() + i.status.slice(1)
  ]);
  const casualData = casualIncomes.map(i => [i.name, `$${i.amount.toFixed(2)}`]);
  
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
      <ManagerHeader title="Administrar Ingresos" />

      <Section 
        title="Ingresos Recurrentes"
        actionButton={<AddButton onClick={handleAddRecurring}>+ Agregar</AddButton>}
      >
        <DataTable
          headers={['Nombre', 'Cantidad', 'Frecuencia', 'Estado']}
          data={recurringData}
          onEdit={handleEditRecurring}
          onDelete={(index) => deleteRecurringIncome(recurringIncomes[index].id)}
          onSuspend={handleToggleSuspend}
          itemStatus={recurringIncomes.map(i => i.status)}
        />
      </Section>
      
      <Section 
        title="Ingresos Casuales"
        actionButton={<AddButton onClick={handleAddCasual}>+ Agregar</AddButton>}
      >
        <DataTable
          headers={['Nombre', 'Cantidad']}
          data={casualData}
          onEdit={handleEditCasual}
          onDelete={(index) => deleteCasualIncome(casualIncomes[index].id)}
        />
      </Section>
      
      <RecurringIncomeForm
        isOpen={isRecurringModalOpen}
        onClose={() => setRecurringModalOpen(false)}
        incomeToEdit={recurringToEdit}
      />
      <CasualIncomeForm
        isOpen={isCasualModalOpen}
        onClose={() => setCasualModalOpen(false)}
        incomeToEdit={casualToEdit}
      />
    </div>
  );
};

export default IncomeManager;