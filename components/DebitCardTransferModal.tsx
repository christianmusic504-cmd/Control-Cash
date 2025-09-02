import React from 'react';
import { DebitCard } from '../types';
import { XIcon } from './icons';

interface DebitCardTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    cardToDelete: DebitCard;
    otherDebitCards: DebitCard[];
    onTransfer: (toCardId: string) => void;
}

export const DebitCardTransferModal: React.FC<DebitCardTransferModalProps> = ({
    isOpen,
    onClose,
    cardToDelete,
    otherDebitCards,
    onTransfer,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><XIcon/></button>
                <h2 className="text-2xl font-bold text-white mb-2">Transferir Saldo</h2>
                <p className="text-slate-400 mb-6">
                    La tarjeta de débito "{cardToDelete.name}" tiene un saldo de {cardToDelete.balance.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}.
                    Para eliminarla, primero debes transferir este saldo a otra tarjeta de débito.
                </p>
                <p className="text-slate-300 font-semibold mb-4">Selecciona una tarjeta de destino:</p>
                <div className="space-y-3">
                    {otherDebitCards.map(card => (
                        <button 
                            key={card.id} 
                            onClick={() => onTransfer(card.id)} 
                            className="w-full text-left p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                        >
                            <p className="font-semibold text-white">{card.name}</p>
                            <p className="text-sm text-slate-400">Saldo actual: {card.balance.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</p>
                        </button>
                    ))}
                </div>
                 <div className="flex justify-end mt-8">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 transition">Cancelar</button>
                </div>
            </div>
        </div>
    );
};
