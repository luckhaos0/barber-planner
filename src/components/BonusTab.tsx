import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { User, Goal, DashboardMonthlyData } from '../types';
import { Award, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function BonusTab() {
  const [dashboardData, setDashboardData] = useState<DashboardMonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const res = await fetch('/api/dashboard-monthly');
    const data = await res.json();
    setDashboardData(data);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award size={24} className="text-brand-gold" />
          Bonificações do Mês
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.map((barber, i) => {
            const isGoalMet = barber.total_revenue >= barber.monthly_revenue_goal;
            const progress = barber.monthly_revenue_goal > 0 ? (barber.total_revenue / barber.monthly_revenue_goal) * 100 : 0;

            return (
              <motion.div
                key={barber.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/20 border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
              >
                {isGoalMet && (
                  <div className="absolute top-0 right-0 p-4 text-brand-gold">
                    <CheckCircle2 size={24} />
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-1">{barber.barber_name}</h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Status da Meta</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-xs text-zinc-500">Progresso</p>
                    <p className={`text-sm font-bold ${isGoalMet ? 'text-brand-gold' : 'text-zinc-300'}`}>
                      {Math.round(progress)}%
                    </p>
                  </div>
                  
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      className={`h-full ${isGoalMet ? 'bg-brand-gold' : 'bg-zinc-700'}`}
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Bônus Previsto</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(barber.bonus_value)}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isGoalMet ? 'bg-brand-gold/20 text-brand-gold' : 'bg-red-500/10 text-red-400'}`}>
                        {isGoalMet ? 'Liberado' : 'Pendente'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
