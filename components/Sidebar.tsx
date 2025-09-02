import React from 'react';
import { View } from '../types';
import { LandmarkIcon, TrendingDownIcon, TrendingUpIcon, WalletIcon } from './icons';

export const Sidebar: React.FC<{ currentView: View; setView: (view: View) => void }> = ({ currentView, setView }) => {
  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <LandmarkIcon /> },
    { view: 'expenses', label: 'Gastos', icon: <TrendingDownIcon /> },
    { view: 'income', label: 'Ingresos', icon: <TrendingUpIcon /> },
    { view: 'cards', label: 'Tarjetas', icon: <WalletIcon /> },
  ];

  return (
    <nav className="w-64 bg-slate-950/70 backdrop-blur-lg border-r border-slate-800 p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-12">
        <div className="bg-green-500 p-2 rounded-lg">
          <WalletIcon />
        </div>
        <h1 className="text-2xl font-bold text-white">Control Cash</h1>
      </div>
      <ul className="space-y-3">
        {navItems.map(({ view, label, icon }) => (
          <li key={view}>
            <button
              onClick={() => setView(view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === view
                  ? 'bg-green-500/20 text-green-400 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
