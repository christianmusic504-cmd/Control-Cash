import React from 'react';

export const ManagerHeader: React.FC<{ title: string; buttonText?: string; onButtonClick?: () => void }> = ({ title, buttonText, onButtonClick }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-3xl font-bold text-slate-200">{title}</h2>
    {buttonText && onButtonClick && (
      <button onClick={onButtonClick} className="bg-cyan-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-cyan-600 transition-colors shadow-md">
        {buttonText}
      </button>
    )}
  </div>
);

export const Section: React.FC<{ title: string; children: React.ReactNode; actionButton?: React.ReactNode }> = ({ title, children, actionButton }) => (
  <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-8">
    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
      <h3 className="text-xl font-semibold text-cyan-400">{title}</h3>
      {actionButton && <div>{actionButton}</div>}
    </div>
    {children}
  </div>
);

export const DataTable: React.FC<{
  headers: string[];
  data: (string | number | React.ReactNode)[][];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onSuspend?: (index: number) => void;
  itemStatus?: ('active' | 'suspended')[];
}> = ({ headers, data, onEdit, onDelete, onSuspend, itemStatus }) => (
  <div className="overflow-x-auto">
    {data.length > 0 ? (
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-700">
            {headers.map(h => <th key={h} className="p-3 text-sm font-semibold text-slate-400">{h}</th>)}
            <th className="p-3 text-sm font-semibold text-slate-400">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-slate-700/50 hover:bg-slate-700/50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={`p-3 ${itemStatus && itemStatus[rowIndex] === 'suspended' ? 'text-slate-500' : ''}`}>
                  {cell}
                </td>
              ))}
              <td className="p-3">
                <div className="flex items-center space-x-2">
                  <button onClick={() => onEdit(rowIndex)} className="text-yellow-400 hover:text-yellow-300">Editar</button>
                  <button onClick={() => onDelete(rowIndex)} className="text-red-500 hover:text-red-400">Eliminar</button>
                  {onSuspend && (
                     <button onClick={() => onSuspend(rowIndex)} className="text-orange-400 hover:text-orange-300">
                      {itemStatus && itemStatus[rowIndex] === 'suspended' ? 'Activar' : 'Suspender'}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="text-slate-400 text-center py-4">No se encontraron elementos. Agrega uno para comenzar.</p>
    )}
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};