import React, { useState } from 'react';
import { Income, IncomeType, Frequency, RecurringIncome, CasualIncome } from '../../types';
import { INCOME_TYPE_OPTIONS, FREQUENCY_OPTIONS, DAYS_OF_WEEK } from '../../constants';
import { FormRow, Field, Input, Select } from './FormFields';
import { format } from 'date-fns';

export const IncomeForm: React.FC<{itemToEdit: Income | null, onSave: (data: any) => void, onCancel: () => void}> = ({ itemToEdit, onSave, onCancel }) => {
    const [incomeType, setIncomeType] = useState<IncomeType>(itemToEdit?.type || IncomeType.Recurring);
    const [formData, setFormData] = useState({
        name: itemToEdit?.name || '',
        amount: itemToEdit?.amount || 0,
        frequency: (itemToEdit as RecurringIncome)?.frequency || Frequency.Weekly,
        dayOfWeek: (itemToEdit as RecurringIncome)?.dayOfWeek || 1,
        dayOfMonth: (itemToEdit as RecurringIncome)?.dayOfMonth || 1,
        date: (itemToEdit as CasualIncome)?.date || format(new Date(), 'yyyy-MM-dd'),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const commonData = { id: itemToEdit?.id, name: formData.name, amount: formData.amount, type: incomeType };
        const data = incomeType === IncomeType.Recurring
            ? { ...commonData, frequency: formData.frequency, dayOfWeek: formData.dayOfWeek, dayOfMonth: formData.dayOfMonth, suspended: (itemToEdit as RecurringIncome)?.suspended || false }
            : { ...commonData, date: formData.date };
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormRow>
                <Field label="Tipo de Ingreso">
                    <Select value={incomeType} onChange={e => setIncomeType(e.target.value as IncomeType)} disabled={!!itemToEdit}>
                        {INCOME_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </Select>
                </Field>
            </FormRow>
            <FormRow>
                <Field label="Nombre"><Input name="name" value={formData.name} onChange={handleChange} required /></Field>
                <Field label="Cantidad"><Input name="amount" type="number" value={formData.amount} onChange={handleChange} required /></Field>
            </FormRow>
            {incomeType === IncomeType.Recurring && (
                <FormRow>
                    <Field label="Frecuencia">
                        <Select name="frequency" value={formData.frequency} onChange={handleChange}>
                            {FREQUENCY_OPTIONS.filter(f => [Frequency.Weekly, Frequency.BiWeekly, Frequency.Monthly].includes(f.value)).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Select>
                    </Field>
                    {formData.frequency === Frequency.Weekly ? (
                        <Field label="Día de la Semana">
                            <Select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
                                {DAYS_OF_WEEK.map((day, i) => <option key={i} value={i}>{day}</option>)}
                            </Select>
                        </Field>
                    ) : (
                        <Field label="Día del Mes">
                            <Input name="dayOfMonth" type="number" min="1" max="31" value={formData.dayOfMonth} onChange={handleChange} />
                        </Field>
                    )}
                </FormRow>
            )}
            {incomeType === IncomeType.Casual && (
                <FormRow>
                    <Field label="Fecha"><Input name="date" type="date" value={formData.date} onChange={handleChange} required /></Field>
                </FormRow>
            )}
            <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold transition">Guardar</button>
            </div>
        </form>
    )
};
