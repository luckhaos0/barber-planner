import React, { useState, useEffect } from 'react';
import { User, Goal } from '../types';
import { Users, Target, Plus, Trash2, Save, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export function ConfigTab() {
  const [barbers, setBarbers] = useState<User[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | ''>('');
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState('');
  const [bonusValue, setBonusValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Barber Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    const res = await fetch('/api/barbers');
    const data = await res.json();
    setBarbers(data);
    setIsLoading(false);
  };

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/barbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, email: newEmail, password: newPassword }),
    });
    if (res.ok) {
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      fetchBarbers();
    }
  };

  const handleDeleteBarber = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este barbeiro?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) fetchBarbers();
  };

  const handleSaveGoals = async () => {
    if (!selectedBarberId) return;
    
    const mGoal = parseFloat(monthlyGoal);
    let wGoal = parseFloat(weeklyGoal);
    
    // If weekly goal is empty, calculate as monthly / 4
    if (isNaN(wGoal) || !weeklyGoal) {
      wGoal = mGoal / 4;
    }

    const goalData = {
      user_id: selectedBarberId,
      type: 'monthly',
      metric: 'revenue',
      target_value: mGoal,
      weekly_target: wGoal,
      bonus_value: parseFloat(bonusValue) || 0,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10),
    };

    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });

    if (res.ok) {
      alert('Configurações salvas com sucesso!');
      setMonthlyGoal('');
      setWeeklyGoal('');
      setBonusValue('');
      setSelectedBarberId('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Barber Management */}
        <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users size={24} className="text-brand-gold" />
            Cadastro de Barbeiros
          </h2>
          
          <form onSubmit={handleAddBarber} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                required
              />
            </div>
            <input
              type="password"
              placeholder="Senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
              required
            />
            <button type="submit" className="w-full bg-brand-gold hover:bg-brand-gold-light text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              <Plus size={20} /> Adicionar Barbeiro
            </button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {barbers.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl">
                <div>
                  <p className="text-sm font-semibold text-white">{b.name}</p>
                  <p className="text-xs text-zinc-500">{b.email}</p>
                </div>
                <button onClick={() => handleDeleteBarber(b.id)} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Goals & Bonuses Configuration */}
        <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target size={24} className="text-purple-400" />
            Metas e Bonificações
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Selecionar Barbeiro</label>
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
              >
                <option value="">Selecione um barbeiro...</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Meta Mensal (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 4000"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Meta Semanal (R$)</label>
                <input
                  type="number"
                  placeholder="Vazio = Mensal / 4"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Valor do Bônus (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="number"
                  placeholder="Ex: 200"
                  value={bonusValue}
                  onChange={(e) => setBonusValue(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 italic">Valor pago ao atingir a meta mensal.</p>
            </div>

            <button
              onClick={handleSaveGoals}
              disabled={!selectedBarberId || !monthlyGoal}
              className="w-full bg-brand-gold hover:bg-brand-gold-light disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.2)]"
            >
              <Save size={20} /> Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
