import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { DashboardMonthlyData } from '../types';
import { TrendingUp, Users, DollarSign, Scissors, ChevronRight, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function MonthlyDashboardTab() {
  const [dashboardData, setDashboardData] = useState<DashboardMonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard-monthly');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDashboardData(data);
      } else {
        setDashboardData([]);
      }
    } catch (e) {
      console.error("Failed to fetch dashboard", e);
      setDashboardData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = dashboardData.reduce((sum, b) => sum + b.total_revenue, 0);
  const totalQuantity = dashboardData.reduce((sum, b) => sum + b.total_quantity, 0);
  const totalGoals = dashboardData.reduce((sum, b) => sum + (b.monthly_revenue_goal || 0), 0);
  const goalProgress = totalGoals > 0 ? (totalRevenue / totalGoals) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Shop Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Faturamento Total', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-brand-gold' },
          { label: 'Total de Serviços', value: totalQuantity, icon: Scissors, color: 'text-blue-400' },
          { label: 'Atingimento de Metas', value: `${Math.round(goalProgress)}%`, icon: Target, color: 'text-purple-400' },
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
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 p-8 rounded-3xl min-h-[400px]">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            <TrendingUp size={24} className="text-brand-gold" />
            Faturamento por Barbeiro
          </h2>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="barber_name" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#C5A059' }}
                />
                <Bar dataKey="total_revenue" radius={[4, 4, 0, 0]}>
                  {dashboardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#C5A059' : '#8B7345'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking / List */}
        <div className="lg:col-span-1 bg-zinc-900/30 border border-white/5 p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users size={24} className="text-blue-400" />
            Ranking do Mês
          </h2>
          
          <div className="space-y-4">
            {dashboardData
              .sort((a, b) => b.total_revenue - a.total_revenue)
              .map((barber, i) => (
                <div key={barber.user_id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-brand-gold text-black' : 
                      i === 1 ? 'bg-zinc-400 text-black' : 
                      i === 2 ? 'bg-orange-400 text-black' : 
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{barber.barber_name}</p>
                      <p className="text-xs text-zinc-500">{barber.total_quantity} serviços</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatCurrency(barber.total_revenue)}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Faturamento</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
