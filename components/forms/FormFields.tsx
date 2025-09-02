import React from 'react';

export const FormRow: React.FC<{children: React.ReactNode}> = ({ children }) => <div className="flex flex-col sm:flex-row gap-4 mb-4">{children}</div>;

export const Field: React.FC<{label: string, children: React.ReactNode, className?: string}> = ({ label, children, className="" }) => (
    <div className={`flex flex-col w-full ${className}`}>
        <label className="mb-1 text-sm font-medium text-slate-400">{label}</label>
        {children}
    </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${props.className}`} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 ${props.className}`} />
);
