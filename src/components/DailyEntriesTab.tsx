import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { User, DailyEntry } from '../types';
import { Calendar, Save, History, DollarSign, Scissors } from 'lucide-react';
import { motion } from 'motion/react';

export function DailyEntriesTab() {
  const [barbers, setBarbers] = useState<User[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [revenue, setRevenue] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBarbers();
    fetchEntries();
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

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/daily-entries');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEntries(data);
      } else {
        setEntries([]);
      }
    } catch (e) {
      console.error("Failed to fetch entries", e);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarberId || !date || !revenue || !quantity) return;

    const res = await fetch('/api/daily-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: selectedBarberId,
        date,
        revenue: parseFloat(revenue),
        quantity: parseInt(quantity),
      }),
    });

    if (res.ok) {
      setRevenue('');
      setQuantity('');
      fetchEntries();
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-1 bg-zinc-900/30 border border-white/5 p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar size={24} className="text-brand-gold" />
            Lançamento Diário
          </h2>

          <form onSubmit={handleSaveEntry} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Barbeiro</label>
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                required
              >
                <option value="">Selecione...</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Faturamento (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    type="number"
                    step="0.01"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Qtd. Serviços</label>
                <div className="relative">
                  <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-brand-gold hover:bg-brand-gold-light text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.2)]">
              <Save size={20} /> Salvar Lançamento
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={20} className="text-zinc-400" />
              Histórico de Lançamentos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/20 text-zinc-500 text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 font-semibold">Data</th>
                  <th className="px-6 py-4 font-semibold">Barbeiro</th>
                  <th className="px-6 py-4 font-semibold">Faturamento</th>
                  <th className="px-6 py-4 font-semibold">Qtd.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {entry.barber_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-brand-gold">
                      {formatCurrency(entry.revenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {entry.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
