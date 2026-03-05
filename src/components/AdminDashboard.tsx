import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { User, Goal, PerformanceData } from '../types';
import { Users, Target, TrendingUp, Plus, Search, ChevronRight, DollarSign, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function AdminDashboard() {
  const { user } = useAuth();
  const [barbers, setBarbers] = useState<User[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<User | null>(null);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const res = await fetch('/api/barbers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBarbers(data);
        if (data.length > 0) {
          handleSelectBarber(data[0]);
        }
      } else {
        setBarbers([]);
      }
    } catch (e) {
      console.error("Failed to fetch barbers", e);
      setBarbers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBarber = async (barber: User) => {
    try {
      setSelectedBarber(barber);
      const [perfRes, goalsRes] = await Promise.all([
        fetch(`/api/performance/${barber.id}`),
        fetch(`/api/goals/${barber.id}`)
      ]);
      const perfData = await perfRes.json();
      const goalsData = await goalsRes.json();
      
      if (Array.isArray(perfData)) {
        setPerformance([...perfData].reverse());
      } else {
        setPerformance([]);
      }
      
      if (Array.isArray(goalsData)) {
        setGoals(goalsData);
      } else {
        setGoals([]);
      }
    } catch (e) {
      console.error("Failed to fetch barber details", e);
      setPerformance([]);
      setGoals([]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Olá, {user?.name}</h1>
        <p className="text-zinc-500">Aqui está o resumo da sua barbearia hoje.</p>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Barbeiros Ativos', value: barbers.length, icon: Users, color: 'text-blue-400' },
          { label: 'Faturamento Shop (Mês)', value: formatCurrency(12450), icon: DollarSign, color: 'text-brand-gold' },
          { label: 'Atingimento de Metas', value: '84%', icon: Target, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/30 border border-white/5 p-6 rounded-3xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className={`p-3 bg-white/5 rounded-2xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Barber List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-brand-gold" />
              Equipe
            </h2>
            <button className="p-2 bg-brand-gold/10 text-brand-gold rounded-xl hover:bg-brand-gold/20 transition-all">
              <Plus size={18} />
            </button>
          </div>
          
          <div className="space-y-2">
            {barbers.map((barber) => (
              <button
                key={barber.id}
                onClick={() => handleSelectBarber(barber)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                  selectedBarber?.id === barber.id 
                    ? 'bg-brand-gold/10 border-brand-gold/30' 
                    : 'bg-zinc-900/20 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                    {barber.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{barber.name}</p>
                    <p className="text-xs text-zinc-500">{barber.email}</p>
                  </div>
                </div>
                <ChevronRight size={16} className={selectedBarber?.id === barber.id ? 'text-brand-gold' : 'text-zinc-600'} />
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl min-h-[400px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-white">Análise de Performance</h2>
                <p className="text-sm text-zinc-500">Métricas de {selectedBarber?.name}</p>
              </div>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                {['Faturamento', 'Serviços'].map((tab) => (
                  <button key={tab} className="px-4 py-1.5 text-xs font-semibold rounded-lg text-zinc-400 hover:text-white transition-all">
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#C5A059' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C5A059" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goal Management */}
          <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target size={20} className="text-purple-400" />
                Metas Ativas
              </h3>
              <button className="text-xs font-semibold text-brand-gold hover:text-brand-gold-light transition-all uppercase tracking-widest">
                Atualizar Metas
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.length === 0 ? (
                <p className="text-zinc-500 text-sm italic">Nenhuma meta definida para este barbeiro.</p>
              ) : (
                goals.map((goal, i) => {
                  const isRevenue = goal.metric === 'revenue';
                  const current = isRevenue 
                    ? performance.reduce((acc, curr) => acc + curr.revenue, 0)
                    : performance.reduce((acc, curr) => acc + curr.count, 0);
                  
                  const progress = (current / goal.target_value) * 100;

                  return (
                    <div key={i} className="bg-black/20 border border-white/5 p-4 rounded-2xl">
                      <div className="flex justify-between items-end mb-3">
                        <p className="text-sm font-medium text-zinc-300 uppercase tracking-widest text-[10px]">
                          {goal.type === 'daily' ? 'Diário' : goal.type === 'monthly' ? 'Mensal' : 'Semanal'} - {goal.metric === 'revenue' ? 'Faturamento' : 'Serviços'}
                        </p>
                        <p className="text-xs text-zinc-500">
                          <span className="text-white font-bold">
                            {isRevenue ? formatCurrency(current) : current}
                          </span> / {isRevenue ? formatCurrency(goal.target_value) : goal.target_value}
                        </p>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          className={`h-full ${isRevenue ? 'bg-brand-gold' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
