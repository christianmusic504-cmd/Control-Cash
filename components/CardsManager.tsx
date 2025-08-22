import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CreditCard, DebitCard } from '../types';
import { ManagerHeader, Section, DataTable, Modal } from './shared/ManagerComponents';

const CreditCardForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cardToEdit?: CreditCard | null;
}> = ({ isOpen, onClose, cardToEdit }) => {
  const { addCreditCard, updateCreditCard } = useAppContext();
  const [name, setName] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [closingDate, setClosingDate] = useState(1);
  const [paymentDueDate, setPaymentDueDate] = useState(1);

  useEffect(() => {
    if (cardToEdit) {
      setName(cardToEdit.name);
      setCreditLimit(String(cardToEdit.creditLimit));
      setClosingDate(cardToEdit.closingDate);
      setPaymentDueDate(cardToEdit.paymentDueDate);
    } else {
      setName('');
      setCreditLimit('');
      setClosingDate(1);
      setPaymentDueDate(1);
    }
  }, [cardToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cardData = {
      name,
      creditLimit: parseFloat(creditLimit),
      closingDate,
      paymentDueDate
    };
    if (cardToEdit) {
      updateCreditCard({ ...cardData, id: cardToEdit.id });
    } else {
      addCreditCard(cardData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={cardToEdit ? "Editar Tarjeta de Crédito" : "Agregar Tarjeta de Crédito"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre de la Tarjeta" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <input type="number" placeholder="Límite de Crédito" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <div>
          <label className="text-sm text-slate-400">Fecha de Corte (Día del Mes)</label>
          <input type="number" value={closingDate} onChange={e => setClosingDate(Number(e.target.value))} min="1" max="31" required className="w-full bg-slate-700 p-2 rounded-md" />
        </div>
        <div>
          <label className="text-sm text-slate-400">Fecha Límite de Pago (Día del Mes)</label>
          <input type="number" value={paymentDueDate} onChange={e => setPaymentDueDate(Number(e.target.value))} min="1" max="31" required className="w-full bg-slate-700 p-2 rounded-md" />
        </div>
        <button type="submit" className="w-full bg-cyan-500 text-white p-2 rounded-md font-semibold hover:bg-cyan-600">
          {cardToEdit ? 'Guardar Cambios' : 'Agregar Tarjeta'}
        </button>
      </form>
    </Modal>
  );
};

const DebitCardForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cardToEdit?: DebitCard | null;
}> = ({ isOpen, onClose, cardToEdit }) => {
  const { addDebitCard, updateDebitCard } = useAppContext();
  const [name, setName] = useState('');

  useEffect(() => {
    if (cardToEdit) {
      setName(cardToEdit.name);
    } else {
      setName('');
    }
  }, [cardToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardToEdit) {
      const cardData = { name, balance: cardToEdit.balance || 0 };
      updateDebitCard({ ...cardData, id: cardToEdit.id });
    } else {
      const cardData = { name, balance: 0 };
      addDebitCard(cardData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={cardToEdit ? "Editar Tarjeta de Débito" : "Agregar Tarjeta de Débito"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre de la Tarjeta" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md" />
        <button type="submit" className="w-full bg-cyan-500 text-white p-2 rounded-md font-semibold hover:bg-cyan-600">
          {cardToEdit ? 'Guardar Cambios' : 'Agregar Tarjeta'}
        </button>
      </form>
    </Modal>
  );
};

const CardsManager: React.FC = () => {
  const { creditCards, deleteCreditCard, debitCards, deleteDebitCard } = useAppContext();
  
  const [isCreditCardModalOpen, setCreditCardModalOpen] = useState(false);
  const [creditCardToEdit, setCreditCardToEdit] = useState<CreditCard | null>(null);
  
  const [isDebitCardModalOpen, setDebitCardModalOpen] = useState(false);
  const [debitCardToEdit, setDebitCardToEdit] = useState<DebitCard | null>(null);

  const handleEditCreditCard = (index: number) => {
    setCreditCardToEdit(creditCards[index]);
    setCreditCardModalOpen(true);
  };
  
  const handleEditDebitCard = (index: number) => {
    setDebitCardToEdit(debitCards[index]);
    setDebitCardModalOpen(true);
  };

  const handleAddCreditCard = () => {
    setCreditCardToEdit(null);
    setCreditCardModalOpen(true);
  };

  const handleAddDebitCard = () => {
    setDebitCardToEdit(null);
    setDebitCardModalOpen(true);
  };
  
  const creditCardData = creditCards.map(c => [
    c.name,
    `$${c.creditLimit.toFixed(2)}`,
    `Día ${c.closingDate}`,
    `Día ${c.paymentDueDate}`
  ]);
  const debitCardData = debitCards.map(c => [c.name, `$${(c.balance || 0).toFixed(2)}`]);
  
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
      <ManagerHeader title="Administrar Tarjetas" />

      <Section 
        title="Tarjetas de Crédito"
        actionButton={<AddButton onClick={handleAddCreditCard}>+ Agregar</AddButton>}
      >
        <DataTable
          headers={['Nombre', 'Límite', 'Fecha de Corte', 'Fecha de Pago']}
          data={creditCardData}
          onEdit={handleEditCreditCard}
          onDelete={(index) => deleteCreditCard(creditCards[index].id)}
        />
      </Section>

      <Section 
        title="Tarjetas de Débito"
        actionButton={<AddButton onClick={handleAddDebitCard}>+ Agregar</AddButton>}
      >
        <DataTable
          headers={['Nombre', 'Saldo']}
          data={debitCardData}
          onEdit={handleEditDebitCard}
          onDelete={(index) => deleteDebitCard(debitCards[index].id)}
        />
      </Section>
      
      <CreditCardForm
        isOpen={isCreditCardModalOpen}
        onClose={() => setCreditCardModalOpen(false)}
        cardToEdit={creditCardToEdit}
      />
      
      <DebitCardForm
        isOpen={isDebitCardModalOpen}
        onClose={() => setDebitCardModalOpen(false)}
        cardToEdit={debitCardToEdit}
      />
    </div>
  );
};

export default CardsManager;