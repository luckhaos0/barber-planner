import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Goal, PerformanceData, Service } from '../types';
import { Scissors, TrendingUp, Target, Plus, History, CheckCircle2, DollarSign, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function BarberDashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [goalsRes, perfRes] = await Promise.all([
        fetch(`/api/goals/${user?.id}`),
        fetch(`/api/performance/${user?.id}`)
      ]);
      const goalsData = await goalsRes.json();
      const perfData = await perfRes.json();
      
      if (Array.isArray(goalsData)) {
        setGoals(goalsData);
      } else {
        setGoals([]);
      }
      
      if (Array.isArray(perfData)) {
        setPerformance(perfData);
      } else {
        setPerformance([]);
      }
    } catch (e) {
      console.error("Failed to fetch barber data", e);
      setGoals([]);
      setPerformance([]);
    }
  };

  const handleLogService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !price) return;

    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user?.id,
        service_name: serviceName,
        price: parseFloat(price)
      })
    });

    setServiceName('');
    setPrice('');
    setIsLogging(false);
    fetchData();
  };

  const todayStats = performance.find(p => p.date === new Date().toISOString().split('T')[0]) || { count: 0, revenue: 0 };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Bem-vindo de volta, {user?.name.split(' ')[0]}</h1>
          <p className="text-zinc-500">Pronto para mais um dia de cortes precisos?</p>
        </div>
        <button 
          onClick={() => setIsLogging(true)}
          className="bg-brand-gold hover:bg-brand-gold-light text-black font-bold px-6 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.2)]"
        >
          <Plus size={20} />
          Logar Serviço
        </button>
      </div>

      {/* Today's Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.filter(g => g.type === 'daily').map((goal, i) => {
          const current = goal.metric === 'quantity' ? todayStats.count : todayStats.revenue;
          const progress = Math.min((current / goal.target_value) * 100, 100);
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                {goal.metric === 'quantity' ? <Scissors size={80} /> : <DollarSign size={80} />}
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">
                      Diário: {goal.metric === 'revenue' ? 'Faturamento' : 'Serviços'}
                    </p>
                    <h3 className="text-2xl font-bold text-white">
                      {goal.metric === 'revenue' ? formatCurrency(current) : current} 
                      <span className="text-zinc-500 text-lg font-medium"> / {goal.metric === 'revenue' ? formatCurrency(goal.target_value) : goal.target_value}</span>
                    </h3>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${progress >= 100 ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/5 text-zinc-400'}`}>
                    {progress >= 100 ? <CheckCircle2 size={24} /> : <Target size={24} />}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                    <span className="text-zinc-500">Progresso</span>
                    <span className={progress >= 100 ? 'text-brand-gold' : 'text-zinc-300'}>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full transition-all duration-1000 ${progress >= 100 ? 'bg-brand-gold' : 'bg-brand-gold/50'}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History size={20} className="text-zinc-400" />
            Performance Recente
          </h2>
          <button className="text-xs font-semibold text-zinc-500 hover:text-white transition-all uppercase tracking-widest">
            Ver Tudo
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {performance.slice(0, 5).map((day, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-zinc-400">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-zinc-500">{day.count} serviços realizados</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-brand-gold">+{formatCurrency(day.revenue)}</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Total do Dia</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Service Modal */}
      <AnimatePresence>
        {isLogging && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogging(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Logar Novo Serviço</h2>
              <form onSubmit={handleLogService} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Tipo de Serviço</label>
                  <select 
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                  >
                    <option value="">Selecionar Serviço</option>
                    <option value="Corte Clássico">Corte Clássico</option>
                    <option value="Barba">Barba</option>
                    <option value="Toalha Quente">Toalha Quente</option>
                    <option value="Combo Premium">Combo Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsLogging(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-gold hover:bg-brand-gold-light text-black font-bold py-4 rounded-2xl transition-all"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
