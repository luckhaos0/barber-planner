import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Goal, PerformanceData } from '../types';
import { Target, TrendingUp, Award, Calendar, CheckCircle2, Clock, DollarSign, Scissors } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function BarberGoalsTab() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setPerformance([...perfData].reverse());
      } else {
        setPerformance([]);
      }
    } catch (error) {
      console.error('Error fetching barber data:', error);
      setGoals([]);
      setPerformance([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-zinc-500 font-mono">CARREGANDO_METAS...</div>;

  const monthlyGoal = goals.find(g => g.type === 'monthly' && g.metric === 'revenue');
  const dailyRevenueGoal = goals.find(g => g.type === 'daily' && g.metric === 'revenue');
  const dailyQtyGoal = goals.find(g => g.type === 'daily' && g.metric === 'quantity');

  const currentMonthRevenue = performance.reduce((acc, curr) => acc + curr.revenue, 0);
  const progress = monthlyGoal ? (currentMonthRevenue / monthlyGoal.target_value) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target className="text-brand-gold" size={28} />
            Minhas Metas
          </h2>
          <p className="text-zinc-500">Acompanhe seu desempenho e conquiste seus bônus</p>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-white/5">
          <Calendar size={16} className="text-brand-gold" />
          <span className="text-sm font-medium text-white">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Monthly Progress Card */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Progresso do Mês</p>
              <h3 className="text-4xl font-bold text-white">
                {formatCurrency(currentMonthRevenue)}
                <span className="text-zinc-500 text-xl font-medium"> / {monthlyGoal ? formatCurrency(monthlyGoal.target_value) : '---'}</span>
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400 font-medium">{Math.round(progress)}% atingido</span>
                <span className="text-brand-gold font-bold">Faltam {formatCurrency(Math.max(0, (monthlyGoal?.target_value || 0) - currentMonthRevenue))}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  className="h-full bg-brand-gold shadow-[0_0_20px_rgba(197,160,89,0.5)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-6 rounded-3xl text-center space-y-2">
            <Award className="mx-auto text-brand-gold mb-2" size={32} />
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Bônus Estimado</p>
            <p className="text-3xl font-bold text-white">{monthlyGoal ? formatCurrency(monthlyGoal.bonus_value || 0) : 'R$ 0,00'}</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${progress >= 100 ? 'text-emerald-400' : 'text-zinc-600'}`}>
              {progress >= 100 ? 'Liberado para Receber' : 'Meta em Andamento'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Stats */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Clock size={16} className="text-brand-gold" />
            Metas Diárias
          </h3>
          
          <div className="space-y-4">
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-gold/10 rounded-2xl text-brand-gold">
                  <DollarSign size={20} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Faturamento</p>
                  <p className="text-lg font-bold text-white">{dailyRevenueGoal ? formatCurrency(dailyRevenueGoal.target_value) : '---'}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Mantenha uma média de {formatCurrency((dailyRevenueGoal?.target_value || 0) / 10)} por serviço para atingir esta meta.
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                  <Scissors size={20} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Serviços</p>
                  <p className="text-lg font-bold text-white">{dailyQtyGoal ? `${dailyQtyGoal.target_value} cortes` : '---'}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Faltam aproximadamente 2 serviços para bater sua meta de hoje.
              </p>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-gold" />
            Histórico de Performance
          </h3>
          
          <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performance}>
                <defs>
                  <linearGradient id="colorGoal" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#C5A059' }}
                  formatter={(value: any) => [formatCurrency(value), 'Faturamento']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C5A059" fillOpacity={1} fill="url(#colorGoal)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
