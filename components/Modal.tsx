import React from 'react';
import { XIcon } from './icons';

export const Modal: React.FC<{isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode}> = ({isOpen, onClose, title, children}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full relative shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition"><XIcon/></button>
                <h2 className="text-2xl font-bold text-white mb-6 capitalize">{title}</h2>
                {children}
            </div>
        </div>
    );
};
