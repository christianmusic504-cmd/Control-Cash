import React, { useState } from 'react';
import { Card, Expense, ExpenseType, Frequency, PaymentMethod, RecurringExpense, CasualExpense, ScheduledExpense, InstallmentExpense } from '../../types';
import { EXPENSE_TYPE_OPTIONS, FREQUENCY_OPTIONS, DAYS_OF_WEEK, PAYMENT_METHOD_OPTIONS } from '../../constants';
import { FormRow, Field, Input, Select } from './FormFields';
import { format } from 'date-fns';

export const ExpenseForm: React.FC<{ itemToEdit: Expense | null, onSave: (data: any) => void, onCancel: () => void, cards: Card[] }> = ({ itemToEdit, onSave, onCancel, cards }) => {
    const [expenseType, setExpenseType] = useState<ExpenseType>(itemToEdit?.type || ExpenseType.Recurring);
    const [formData, setFormData] = useState({
        name: itemToEdit?.name || '',
        amount: itemToEdit?.amount || 0,
        // Recurring
        frequency: (itemToEdit as RecurringExpense)?.frequency || Frequency.Weekly,
        paymentMethod: (itemToEdit as RecurringExpense | InstallmentExpense)?.paymentMethod || PaymentMethod.Cash,
        paymentSourceId: (itemToEdit as RecurringExpense | InstallmentExpense)?.paymentSourceId || '',
        dayOfWeek: (itemToEdit as RecurringExpense)?.dayOfWeek || 1,
        dayOfMonth: (itemToEdit as RecurringExpense)?.dayOfMonth || 15,
        dayOfMonth2: (itemToEdit as RecurringExpense)?.dayOfMonth2 || 30,
        // Casual / Scheduled
        date: (itemToEdit as CasualExpense | ScheduledExpense)?.date || format(new Date(), 'yyyy-MM-dd'),
        // Installment
        totalAmount: (itemToEdit as InstallmentExpense)?.totalAmount || 0,
        numberOfPayments: (itemToEdit as InstallmentExpense)?.numberOfPayments || 1,
        startDate: (itemToEdit as InstallmentExpense)?.startDate || format(new Date(), 'yyyy-MM-dd'),
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const commonData = { id: itemToEdit?.id, name: formData.name, amount: formData.amount, type: expenseType };
        let data: any;

        switch(expenseType) {
            case ExpenseType.Recurring:
                data = { ...commonData, frequency: formData.frequency, paymentMethod: formData.paymentMethod, paymentSourceId: formData.paymentSourceId, dayOfWeek: formData.dayOfWeek, dayOfMonth: formData.dayOfMonth, dayOfMonth2: formData.dayOfMonth2, suspended: (itemToEdit as RecurringExpense)?.suspended || false };
                break;
            case ExpenseType.Casual:
                data = { ...commonData, date: formData.date };
                break;
            case ExpenseType.Scheduled:
                data = { ...commonData, date: formData.date };
                break;
            case ExpenseType.Installment:
                 const installmentAmount = formData.totalAmount / formData.numberOfPayments;
                 data = { ...commonData, amount: installmentAmount, totalAmount: formData.totalAmount, frequency: formData.frequency, numberOfPayments: formData.numberOfPayments, payments: Array.from({ length: formData.numberOfPayments }, () => ({ amount: installmentAmount, paid: false })), paymentMethod: formData.paymentMethod, paymentSourceId: formData.paymentSourceId, startDate: formData.startDate, suspended: (itemToEdit as InstallmentExpense)?.suspended || false };
                 break;
        }
        onSave(data);
    };

    const renderPaymentMethodFields = () => (
        <>
            <Field label="Método de Pago">
                <Select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                    {PAYMENT_METHOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </Select>
            </Field>
            {formData.paymentMethod !== PaymentMethod.Cash && (
                <Field label="Tarjeta Específica">
                    <Select name="paymentSourceId" value={formData.paymentSourceId} onChange={handleChange}>
                        <option value="">Seleccionar tarjeta...</option>
                        {cards.filter(c => formData.paymentMethod === PaymentMethod.CreditCard ? c.type === 'credit' : c.type === 'debit').map(card => (
                            <option key={card.id} value={card.id}>{card.name}</option>
                        ))}
                    </Select>
                </Field>
            )}
        </>
    );

    const renderRecurringFields = () => {
        switch (formData.frequency) {
            case Frequency.Weekly:
                return <Field label="Día de la Semana"><Select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>{DAYS_OF_WEEK.map((d, i) => <option key={i} value={i}>{d}</option>)}</Select></Field>;
            case Frequency.BiWeekly:
                return (
                    <>
                        <Field label="Primer Día del Mes"><Input name="dayOfMonth" type="number" min="1" max="31" value={formData.dayOfMonth} onChange={handleChange} /></Field>
                        <Field label="Segundo Día del Mes"><Input name="dayOfMonth2" type="number" min="1" max="31" value={formData.dayOfMonth2} onChange={handleChange} /></Field>
                    </>
                );
            case Frequency.Monthly:
            case Frequency.Bimonthly:
                return <Field label="Día del Mes"><Input name="dayOfMonth" type="number" min="1" max="31" value={formData.dayOfMonth} onChange={handleChange} /></Field>;
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormRow>
                <Field label="Tipo de Gasto">
                    <Select value={expenseType} onChange={e => setExpenseType(e.target.value as ExpenseType)} disabled={!!itemToEdit}>
                        {EXPENSE_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </Select>
                </Field>
            </FormRow>
            
            <FormRow>
                <Field label="Nombre"><Input name="name" value={formData.name} onChange={handleChange} required /></Field>
                {![ExpenseType.Installment].includes(expenseType) && (
                    <Field label="Cantidad"><Input name="amount" type="number" value={formData.amount} onChange={handleChange} required /></Field>
                )}
            </FormRow>

            {expenseType === ExpenseType.Recurring && (
                <>
                    <FormRow>
                        <Field label="Frecuencia">
                            <Select name="frequency" value={formData.frequency} onChange={handleChange}>
                                {FREQUENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </Select>
                        </Field>
                         {renderRecurringFields()}
                    </FormRow>
                    <FormRow>{renderPaymentMethodFields()}</FormRow>
                </>
            )}

            {expenseType === ExpenseType.Scheduled && (
                <FormRow>
                    <Field label="Fecha Prevista"><Input name="date" type="date" value={formData.date} onChange={handleChange} required /></Field>
                </FormRow>
            )}

            {expenseType === ExpenseType.Installment && (
                 <>
                    <FormRow>
                        <Field label="Cantidad Total"><Input name="totalAmount" type="number" value={formData.totalAmount} onChange={handleChange} required /></Field>
                        <Field label="Número de Pagos"><Input name="numberOfPayments" type="number" min="1" value={formData.numberOfPayments} onChange={handleChange} required /></Field>
                    </FormRow>
                     <FormRow>
                        <Field label="Frecuencia de Pago">
                            <Select name="frequency" value={formData.frequency} onChange={handleChange}>
                                {FREQUENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </Select>
                        </Field>
                        <Field label="Fecha de Inicio"><Input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required /></Field>
                    </FormRow>
                    <FormRow>{renderPaymentMethodFields()}</FormRow>
                </>
            )}
            
            <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold transition">Guardar</button>
            </div>
        </form>
    );
};