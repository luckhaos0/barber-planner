import React, { useState, useEffect } from 'react';
import { User, Goal } from '../types';
import { Target, Save, User as UserIcon, DollarSign, Scissors, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';

export function GoalsManagementTab() {
  const [barbers, setBarbers] = useState<User[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form states
  const [dailyRevenue, setDailyRevenue] = useState('');
  const [dailyQuantity, setDailyQuantity] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [bonusValue, setBonusValue] = useState('');

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (selectedBarberId) {
      fetchGoals(selectedBarberId);
    }
  }, [selectedBarberId]);

  const fetchBarbers = async () => {
    try {
      const response = await fetch('/api/barbers');
      const data = await response.json();
      setBarbers(data);
      if (data.length > 0 && !selectedBarberId) {
        setSelectedBarberId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching barbers:', error);
    }
  };

  const fetchGoals = async (userId: string) => {
    try {
      const response = await fetch(`/api/goals/${userId}`);
      const data = await response.json();
      setGoals(data);
      
      // Reset form with existing goals
      const dRev = data.find((g: Goal) => g.type === 'daily' && g.metric === 'revenue');
      const dQty = data.find((g: Goal) => g.type === 'daily' && g.metric === 'quantity');
      const mRev = data.find((g: Goal) => g.type === 'monthly' && g.metric === 'revenue');
      
      setDailyRevenue(dRev?.target_value.toString() || '');
      setDailyQuantity(dQty?.target_value.toString() || '');
      setMonthlyRevenue(mRev?.target_value.toString() || '');
      setBonusValue(mRev?.bonus_value?.toString() || '');
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarberId) return;

    setIsSaving(true);
    setMessage({ text: '', type: '' });

    const goalsToSave = [
      {
        user_id: parseInt(selectedBarberId),
        type: 'daily',
        metric: 'revenue',
        target_value: parseFloat(dailyRevenue),
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      },
      {
        user_id: parseInt(selectedBarberId),
        type: 'daily',
        metric: 'quantity',
        target_value: parseInt(dailyQuantity),
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      },
      {
        user_id: parseInt(selectedBarberId),
        type: 'monthly',
        metric: 'revenue',
        target_value: parseFloat(monthlyRevenue),
        bonus_value: parseFloat(bonusValue),
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      }
    ];

    try {
      for (const goal of goalsToSave) {
        await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goal),
        });
      }
      setMessage({ text: 'Metas atualizadas com sucesso!', type: 'success' });
      fetchGoals(selectedBarberId);
    } catch (error) {
      setMessage({ text: 'Erro ao salvar metas.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="text-brand-gold" size={24} />
            Gestão de Metas
          </h2>
          <p className="text-zinc-500 text-sm">Defina os objetivos individuais de cada barbeiro</p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-2xl border border-white/5">
          <UserIcon size={18} className="text-zinc-500 ml-2" />
          <select
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            className="bg-transparent text-white text-sm focus:outline-none pr-8 py-1 cursor-pointer"
          >
            {barbers.map(barber => (
              <option key={barber.id} value={barber.id} className="bg-zinc-900">{barber.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Daily Goals */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-4 bg-brand-gold rounded-full"></div>
                  Metas Diárias
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                      Faturamento Diário (R$)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="number"
                        value={dailyRevenue}
                        onChange={(e) => setDailyRevenue(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
                        placeholder="Ex: 300"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                      Qtd. Serviços Diários
                    </label>
                    <div className="relative">
                      <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="number"
                        value={dailyQuantity}
                        onChange={(e) => setDailyQuantity(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
                        placeholder="Ex: 10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Goals */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                  Metas Mensais
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                      Faturamento Mensal (R$)
                    </label>
                    <div className="relative">
                      <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="number"
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
                        placeholder="Ex: 8000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                      Bônus p/ Meta Batida (R$)
                    </label>
                    <div className="relative">
                      <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="number"
                        value={bonusValue}
                        onChange={(e) => setBonusValue(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
                        placeholder="Ex: 500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {message.text && (
              <div className={`py-3 px-4 rounded-xl text-center text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-brand-gold hover:bg-brand-gold-light disabled:opacity-50 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(197,160,89,0.2)]"
            >
              <Save size={18} />
              {isSaving ? 'Salvando...' : 'Salvar Configurações de Metas'}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Resumo Atual</h3>
            
            <div className="space-y-4">
              {goals.length === 0 ? (
                <p className="text-zinc-500 text-sm italic">Nenhuma meta definida para este barbeiro.</p>
              ) : (
                goals.map((goal, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                        {goal.type === 'daily' ? 'Diário' : goal.type === 'monthly' ? 'Mensal' : 'Semanal'} - {goal.metric === 'revenue' ? 'Faturamento' : 'Serviços'}
                      </p>
                      <p className="text-lg font-bold text-white">
                        {goal.metric === 'revenue' ? formatCurrency(goal.target_value) : `${goal.target_value} serv.`}
                      </p>
                    </div>
                    {goal.bonus_value > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Bônus</p>
                        <p className="text-sm font-bold text-brand-gold">{formatCurrency(goal.bonus_value)}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-brand-gold/5 border border-brand-gold/10 rounded-3xl p-6">
            <h4 className="text-brand-gold text-sm font-bold mb-2">Dica do Admin</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Metas realistas aumentam a motivação. O bônus é liberado automaticamente no painel do barbeiro assim que o faturamento mensal atinge o valor estipulado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
