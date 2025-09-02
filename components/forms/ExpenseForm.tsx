import React, { useState, useEffect } from 'react';
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

    const [areInstallmentsEqual, setAreInstallmentsEqual] = useState(() => {
        if (itemToEdit && itemToEdit.type === ExpenseType.Installment) {
            if (!itemToEdit.payments || itemToEdit.payments.length === 0) return true;
            const firstAmount = itemToEdit.payments[0].amount;
            return itemToEdit.payments.every(p => p.amount === firstAmount);
        }
        return true;
    });

    const [paymentAmounts, setPaymentAmounts] = useState<string[]>(() => {
        if (itemToEdit && itemToEdit.type === ExpenseType.Installment) {
            return itemToEdit.payments.map(p => String(p.amount));
        }
        return Array(formData.numberOfPayments).fill('');
    });

    useEffect(() => {
        if (expenseType === ExpenseType.Installment && !areInstallmentsEqual) {
            const numPayments = Number(formData.numberOfPayments) || 0;
            if (paymentAmounts.length !== numPayments) {
                const newAmounts = Array(numPayments).fill('');
                paymentAmounts.slice(0, numPayments).forEach((val, i) => newAmounts[i] = val);
                setPaymentAmounts(newAmounts);
            }
        }
    }, [formData.numberOfPayments, areInstallmentsEqual, expenseType]);


    const handlePaymentAmountChange = (index: number, value: string) => {
        const newAmounts = [...paymentAmounts];
        newAmounts[index] = value;
        setPaymentAmounts(newAmounts);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let data: any;

        switch(expenseType) {
            case ExpenseType.Recurring:
                data = { id: itemToEdit?.id, name: formData.name, type: expenseType, amount: formData.amount, frequency: formData.frequency, paymentMethod: formData.paymentMethod, paymentSourceId: formData.paymentSourceId, dayOfWeek: formData.dayOfWeek, dayOfMonth: formData.dayOfMonth, dayOfMonth2: formData.dayOfMonth2, suspended: (itemToEdit as RecurringExpense)?.suspended || false };
                break;
            case ExpenseType.Casual:
                data = { id: itemToEdit?.id, name: formData.name, type: expenseType, amount: formData.amount, date: formData.date };
                break;
            case ExpenseType.Scheduled:
                data = { id: itemToEdit?.id, name: formData.name, type: expenseType, amount: formData.amount, date: formData.date };
                break;
            case ExpenseType.Installment:
                 let payments;
                 if (areInstallmentsEqual) {
                    const installmentAmount = formData.numberOfPayments > 0 ? formData.totalAmount / formData.numberOfPayments : 0;
                    payments = Array.from({ length: formData.numberOfPayments }, () => ({ amount: installmentAmount }));
                 } else {
                    payments = paymentAmounts.map(amountStr => ({ amount: parseFloat(amountStr) || 0 }));
                 }
                 data = {
                    id: itemToEdit?.id,
                    name: formData.name,
                    type: expenseType,
                    numberOfPayments: formData.numberOfPayments,
                    payments,
                    frequency: formData.frequency,
                    paymentMethod: formData.paymentMethod,
                    paymentSourceId: formData.paymentSourceId,
                    startDate: formData.startDate,
                    suspended: (itemToEdit as InstallmentExpense)?.suspended || false
                 };
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
                         <Field label="¿Los montos son iguales?">
                            <Select value={String(areInstallmentsEqual)} onChange={e => setAreInstallmentsEqual(e.target.value === 'true')}>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </Select>
                         </Field>
                        <Field label="Número de Pagos"><Input name="numberOfPayments" type="number" min="1" value={formData.numberOfPayments} onChange={handleChange} required /></Field>
                    </FormRow>

                    {areInstallmentsEqual ? (
                         <FormRow>
                            <Field label="Cantidad Total"><Input name="totalAmount" type="number" value={formData.totalAmount} onChange={handleChange} required /></Field>
                         </FormRow>
                    ) : (
                        <div className="space-y-4 max-h-48 overflow-y-auto pr-2 border-t border-b border-slate-800 py-4 my-4">
                           <p className="text-sm text-slate-400 font-semibold mb-2">Montos de cada pago:</p>
                           {paymentAmounts.map((amount, index) => (
                               <FormRow key={index}>
                                   <Field label={`Pago ${index + 1}`}>
                                       <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => handlePaymentAmountChange(index, e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                   </Field>
                               </FormRow>
                           ))}
                        </div>
                    )}

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