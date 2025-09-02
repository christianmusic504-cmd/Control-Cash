import React from 'react';
import { DebitCard, Expense } from '../types';
import { XIcon } from './icons';

interface PayWithSavingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense: Expense;
    paymentAmount: number;
    debitCards: DebitCard[];
    onPay: (selectedCardId: string) => void;
}

export const PayWithSavingsModal: React.FC<PayWithSavingsModalProps> = ({
    isOpen,
    onClose,
    expense,
    paymentAmount,
    debitCards,
    onPay,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                    <XIcon />
                </button>
                <h2 className="text-2xl font-bold text-white mb-2">Pagar con Ahorro</h2>
                <p className="text-slate-400 mb-6">
                    Vas a pagar {paymentAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} para "{expense.name}".
                    Selecciona la tarjeta de débito de donde saldrán los fondos.
                </p>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {debitCards.map(card => {
                        const hasEnoughFunds = card.balance >= paymentAmount;
                        return (
                            <button
                                key={card.id}
                                onClick={() => onPay(card.id)}
                                disabled={!hasEnoughFunds}
                                className="w-full text-left p-4 bg-slate-800 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-white">{card.name}</p>
                                    {!hasEnoughFunds && <span className="text-xs text-red-400">Fondos insuficientes</span>}
                                </div>
                                <p className="text-sm text-slate-400">
                                    Saldo actual: {card.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                </p>
                            </button>
                        )
                    })}
                </div>
                <div className="flex justify-end mt-8">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 transition">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
