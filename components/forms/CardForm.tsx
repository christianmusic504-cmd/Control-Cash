import React, { useState } from 'react';
import { Card, CreditCard, DebitCard } from '../../types';
import { FormRow, Field, Input, Select } from './FormFields';

export const CardForm: React.FC<{itemToEdit: Card | null, onSave: (data: any) => void, onCancel: () => void}> = ({ itemToEdit, onSave, onCancel }) => {
    const [cardType, setCardType] = useState<'credit' | 'debit'>(itemToEdit?.type || 'credit');
    const [formData, setFormData] = useState({
        name: itemToEdit?.name || '',
        creditLimit: (itemToEdit as CreditCard)?.creditLimit || 0,
        cutoffDay: (itemToEdit as CreditCard)?.cutoffDay || 1,
        paymentDay: (itemToEdit as CreditCard)?.paymentDay || 1,
        balance: (itemToEdit as DebitCard)?.balance || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const commonData = { id: itemToEdit?.id, name: formData.name };
        const data = cardType === 'credit'
            ? { ...commonData, type: 'credit', creditLimit: formData.creditLimit, cutoffDay: formData.cutoffDay, paymentDay: formData.paymentDay }
            : { ...commonData, type: 'debit', balance: formData.balance };
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormRow>
                <Field label="Tipo de Tarjeta">
                    <Select value={cardType} onChange={e => setCardType(e.target.value as 'credit' | 'debit')} disabled={!!itemToEdit}>
                        <option value="credit">Crédito</option>
                        <option value="debit">Débito</option>
                    </Select>
                </Field>
            </FormRow>
            <FormRow>
                <Field label="Nombre (alias)">
                    <Input name="name" value={formData.name} onChange={handleChange} required />
                </Field>
            </FormRow>
            {cardType === 'credit' && (
                <>
                    <FormRow>
                        <Field label="Límite de Crédito">
                            <Input name="creditLimit" type="number" value={formData.creditLimit} onChange={handleChange} required />
                        </Field>
                    </FormRow>
                    <FormRow>
                        <Field label="Fecha de Corte (día)">
                            <Input name="cutoffDay" type="number" min="1" max="31" value={formData.cutoffDay} onChange={handleChange} required />
                        </Field>
                        <Field label="Fecha Máxima de Pago (día)">
                            <Input name="paymentDay" type="number" min="1" max="31" value={formData.paymentDay} onChange={handleChange} required />
                        </Field>
                    </FormRow>
                </>
            )}
            {cardType === 'debit' && (
                <FormRow>
                    <Field label="Saldo Inicial">
                        <Input name="balance" type="number" value={formData.balance} onChange={handleChange} required />
                    </Field>
                </FormRow>
            )}
            <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold transition">Guardar</button>
            </div>
        </form>
    );
};
