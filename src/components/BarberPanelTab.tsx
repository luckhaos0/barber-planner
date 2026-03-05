import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { User, Goal, DailyEntry } from '../types';
import { User as UserIcon, Target, TrendingUp, AlertCircle, Lightbulb, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export function BarberPanelTab() {
  const [barbers, setBarbers] = useState<User[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | ''>('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [monthlyEntries, setMonthlyEntries] = useState<DailyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const res = await fetch('/api/barbers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBarbers(data);
      } else {
        setBarbers([]);
      }
    } catch (e) {
      console.error("Failed to fetch barbers", e);
      setBarbers([]);
    }
  };

  const handleSelectBarber = async (id: number) => {
    try {
      setSelectedBarberId(id);
      setIsLoading(true);
      const [goalsRes, entriesRes] = await Promise.all([
        fetch(`/api/goals/${id}`),
        fetch(`/api/daily-entries`)
      ]);
      
      const allGoals = await goalsRes.json();
      const allEntries = await entriesRes.json();
      
      if (Array.isArray(allGoals)) {
        setGoals(allGoals);
      } else {
        setGoals([]);
      }
      
      if (Array.isArray(allEntries)) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const filteredEntries = allEntries.filter((e: DailyEntry) => 
          e.user_id === id && e.date.startsWith(currentMonth)
        );
        setMonthlyEntries(filteredEntries);
      } else {
        setMonthlyEntries([]);
      }
    } catch (e) {
      console.error("Failed to fetch barber details", e);
      setGoals([]);
      setMonthlyEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const totalRevenue = monthlyEntries.reduce((sum, e) => sum + e.revenue, 0);
    const monthlyGoal = goals.find(g => g.type === 'monthly' && g.metric === 'revenue');
    
    if (!monthlyGoal) return null;

    const remaining = Math.max(0, monthlyGoal.target_value - totalRevenue);
    const progress = (totalRevenue / monthlyGoal.target_value) * 100;
    
    // Weekly logic
    const today = new Date();
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - dayOfMonth + 1;
    
    const weeklyTarget = monthlyGoal.weekly_target || (monthlyGoal.target_value / 4);
    
    // Suggestion logic
    const dailyNeeded = remaining / daysRemaining;
    let suggestion = "";
    if (dailyNeeded <= 0) {
      suggestion = "Meta batida! Aproveite para fidelizar clientes.";
    } else if (dailyNeeded < weeklyTarget / 6) {
      suggestion = "Você está no caminho certo! Mantenha o ritmo.";
    } else {
      suggestion = `Faltam ${formatCurrency(dailyNeeded)} por dia. Tente oferecer serviços adicionais (barba, sobrancelha).`;
    }

    return { totalRevenue, monthlyGoal, remaining, progress, dailyNeeded, suggestion, weeklyTarget };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserIcon size={24} className="text-brand-gold" />
              Painel do Barbeiro
            </h2>
            <p className="text-sm text-zinc-500">Acompanhamento individual de metas</p>
          </div>
          <select
            value={selectedBarberId}
            onChange={(e) => handleSelectBarber(Number(e.target.value))}
            className="bg-black/40 border border-white/5 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
          >
            <option value="">Selecione um barbeiro...</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {selectedBarberId && stats ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black/20 border border-white/5 p-6 rounded-2xl">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Faturamento Mensal</p>
                  <h3 className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</h3>
                  <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(stats.progress, 100)}%` }}
                      className="h-full bg-brand-gold"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Meta: {formatCurrency(stats.monthlyGoal.target_value)} ({Math.round(stats.progress)}%)</p>
                </div>

                <div className="bg-black/20 border border-white/5 p-6 rounded-2xl">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Faltam para a Meta</p>
                  <h3 className="text-3xl font-bold text-purple-400">{formatCurrency(stats.remaining)}</h3>
                  <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                    <Calendar size={12} /> {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
                  </p>
                </div>
              </div>

              <div className="bg-brand-gold/5 border border-brand-gold/10 p-6 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-brand-gold/20 rounded-xl text-brand-gold">
                  <Lightbulb size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">O que fazer hoje?</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">{stats.suggestion}</p>
                </div>
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="bg-black/20 border border-white/5 p-6 rounded-2xl">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-400" />
                Meta Semanal
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Alvo Semanal</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(stats.weeklyTarget)}</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Necessário p/ dia</p>
                  <p className="text-sm font-bold text-brand-gold">{formatCurrency(stats.dailyNeeded)}</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] text-zinc-500 italic leading-relaxed">
                    * Cálculo baseado nos dias restantes do mês atual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : selectedBarberId ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <AlertCircle size={48} className="mb-4 opacity-20" />
            <p>Nenhuma meta configurada para este barbeiro.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <UserIcon size={48} className="mb-4 opacity-20" />
            <p>Selecione um barbeiro para ver o painel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
