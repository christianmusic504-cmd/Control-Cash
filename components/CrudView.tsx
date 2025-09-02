import React from 'react';
import { Card, Expense, Income } from '../types';
import { EditIcon, PauseIcon, PlayIcon, PlusIcon, TrashIcon } from './icons';
import { ItemType } from '../App';

type Item = Card | Expense | Income;

const ItemCard: React.FC<{
  item: Item;
  itemType: ItemType;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSuspend?: () => void;
}> = ({ item, itemType, onEdit, onDelete, onToggleSuspend }) => {
    const isSuspended = 'suspended' in item && item.suspended;

    const formatCurrency = (amount: number) => amount.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'});

    return (
        <div className={`bg-slate-950/70 p-5 rounded-xl border border-slate-800 flex flex-col justify-between transition ${isSuspended ? 'opacity-50' : ''}`}>
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full capitalize">
                        {'type' in item ? (item as any).type : itemType}
                    </span>
                </div>

                {'amount' in item && <p className="text-2xl font-semibold text-green-400 mb-3">{formatCurrency(item.amount)}</p>}
                {'balance' in item && <p className="text-2xl font-semibold text-blue-400 mb-3">{formatCurrency(item.balance)}</p>}
                {'creditLimit' in item && <p className="text-sm text-slate-400">Límite: {formatCurrency(item.creditLimit)}</p>}

                {'frequency' in item && <p className="text-sm text-slate-400">Frecuencia: {item.frequency}</p>}
                
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 transition">
                    <EditIcon /> Editar
                </button>
                <button onClick={onDelete} className="px-3 py-2 rounded-md bg-red-500/20 hover:bg-red-500/40 text-red-400 transition">
                    <TrashIcon />
                </button>
                {onToggleSuspend && (
                    <button onClick={onToggleSuspend} className="px-3 py-2 rounded-md bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 transition">
                        {isSuspended ? <PlayIcon /> : <PauseIcon />}
                    </button>
                )}
            </div>
        </div>
    );
}

export const CrudView: React.FC<{
  title: string;
  items: Item[];
  itemType: ItemType;
  openModal: (type: ItemType, item?: Item) => void;
  onDelete: (type: ItemType, id: string) => void;
  onToggleSuspend?: (type: 'expense' | 'income', id: string) => void;
}> = ({ title, items, itemType, openModal, onDelete, onToggleSuspend }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">{title}</h1>
        <button onClick={() => openModal(itemType)} className="flex items-center gap-2 bg-green-500 text-white font-semibold px-5 py-3 rounded-lg hover:bg-green-600 transition">
          <PlusIcon />
          <span>Añadir Nuevo</span>
        </button>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <ItemCard 
              key={item.id} 
              item={item} 
              itemType={itemType}
              onEdit={() => openModal(itemType, item)} 
              onDelete={() => onDelete(itemType, item.id)}
              onToggleSuspend={onToggleSuspend && 'suspended' in item ? () => onToggleSuspend(itemType as 'expense' | 'income', item.id) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-950/50 rounded-2xl border border-dashed border-slate-700">
            <p className="text-slate-400">No hay {title.toLowerCase()} registrados.</p>
            <p className="text-slate-500 mt-2">Haz clic en "Añadir Nuevo" para empezar.</p>
        </div>
      )}
    </div>
  );
};
