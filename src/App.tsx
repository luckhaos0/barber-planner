import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { BarberDashboard } from './components/BarberDashboard';
import { ConfigTab } from './components/ConfigTab';
import { DailyEntriesTab } from './components/DailyEntriesTab';
import { BarberPanelTab } from './components/BarberPanelTab';
import { BonusTab } from './components/BonusTab';
import { MonthlyDashboardTab } from './components/MonthlyDashboardTab';
import { GoalsManagementTab } from './components/GoalsManagementTab';
import { BarberGoalsTab } from './components/BarberGoalsTab';
import { LogOut, User as UserIcon, Bell, Settings, Calendar, LayoutDashboard, Award, UserCheck, Target, TrendingUp } from 'lucide-react';

type TabType = 'dashboard' | 'config' | 'entries' | 'barber_panel' | 'bonus' | 'monthly_summary' | 'goals';

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 font-mono">CARREGANDO_SISTEMA...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'admin' ? <AdminDashboard /> : <BarberDashboard />;
      case 'config':
        return <ConfigTab />;
      case 'entries':
        return <DailyEntriesTab />;
      case 'barber_panel':
        return <BarberPanelTab />;
      case 'bonus':
        return <BonusTab />;
      case 'monthly_summary':
        return <MonthlyDashboardTab />;
      case 'goals':
        return user.role === 'admin' ? <GoalsManagementTab /> : <BarberGoalsTab />;
      default:
        return <AdminDashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard, roles: ['admin', 'barber'] },
    { id: 'goals', label: 'Metas', icon: Target, roles: ['admin', 'barber'] },
    { id: 'entries', label: 'Entradas Diárias', icon: Calendar, roles: ['admin', 'barber'] },
    { id: 'barber_panel', label: 'Painel Barbeiro', icon: UserCheck, roles: ['admin', 'barber'] },
    { id: 'bonus', label: 'Bonificação', icon: Award, roles: ['admin', 'barber'] },
    { id: 'monthly_summary', label: 'Dashboard Mês', icon: TrendingUp, roles: ['admin'] },
    { id: 'config', label: 'Config', icon: Settings, roles: ['admin'] },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-brand-gold/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.3)]">
                <span className="font-bold text-black text-lg">N</span>
              </div>
              <span className="font-bold tracking-widest text-xl hidden sm:block uppercase">NORRAL</span>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === item.id 
                      ? 'bg-brand-gold/10 text-brand-gold' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full border-2 border-[#000000]"></span>
              </button>
              
              <div className="h-8 w-px bg-white/10 mx-2"></div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">
                    {user.role === 'admin' ? `Olá, ${user.name}` : user.name}
                  </p>
                  {user.role !== 'admin' && (
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">
                      Barbeiro
                    </p>
                  )}
                </div>
                <button 
                  onClick={logout}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 px-4 pb-4 overflow-x-auto no-scrollbar">
          {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === item.id 
                  ? 'bg-brand-gold/10 text-brand-gold' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTab()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
