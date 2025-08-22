import React, { useState, useCallback, useMemo } from 'react';
import type { View } from './types';
import { AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard';
import ExpensesManager from './components/ExpensesManager';
import IncomeManager from './components/IncomeManager';
import CardsManager from './components/CardsManager';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = useCallback(() => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpensesManager />;
      case 'income':
        return <IncomeManager />;
      case 'cards':
        return <CardsManager />;
      default:
        return <Dashboard />;
    }
  }, [currentView]);

  const NavButton = useMemo(() => {
    return <T,>({ view, children }: { view: View, children: React.ReactNode }) => {
      const isActive = currentView === view;
      return (
        <button
          onClick={() => setCurrentView(view)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            isActive
              ? 'bg-cyan-500 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {children}
        </button>
      );
    };
  }, [currentView]);

  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <header className="bg-slate-800/50 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-slate-700">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-cyan-400">Control Cash</h1>
            <nav className="flex items-center space-x-2 bg-slate-800 p-1 rounded-lg">
              <NavButton view="dashboard">Panel</NavButton>
              <NavButton view="expenses">Gastos</NavButton>
              <NavButton view="income">Ingresos</NavButton>
              <NavButton view="cards">Tarjetas</NavButton>
            </nav>
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-8">
          {renderView()}
        </main>
      </div>
    </AppProvider>
  );
};

export default App;