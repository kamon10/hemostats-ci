
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend,
  Cell
} from 'recharts';
import { MonthlyTrend } from '../types';
import { TrendingUp, Target, CalendarDays, Activity, Database } from 'lucide-react';

interface Props {
  data: MonthlyTrend[];
  darkMode: boolean;
  siteName: string;
}

const AnnualCharts: React.FC<Props> = ({ data, darkMode, siteName }) => {
  const stats = useMemo(() => {
    const total = data.reduce((sum, m) => sum + m.total, 0);
    const avg = data.filter(m => m.total > 0).length > 0 
      ? Math.floor(total / data.filter(m => m.total > 0).length) 
      : 0;
    
    const peakMonth = [...data].sort((a, b) => b.total - a.total)[0];
    const breakdown = {
      cgr: data.reduce((sum, m) => sum + m.cgr, 0),
      plasma: data.reduce((sum, m) => sum + m.plasma, 0),
      plaquettes: data.reduce((sum, m) => sum + m.plaquettes, 0),
    };

    return { total, avg, peakMonth, breakdown };
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`relative overflow-hidden p-8 rounded-[40px] border shadow-2xl transition-all ${darkMode ? 'bg-slate-800 border-slate-700 shadow-black/40' : 'bg-white border-slate-100 shadow-slate-200'}`}>
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
            <Database size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">Total Distribution Annuelle</p>
            <div className="text-5xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white">
              {stats.total.toLocaleString('fr-FR')}
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-red-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest">Unités Distribuées</div>
              {siteName === 'TOUS LES SITES' && <div className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest">National</div>}
            </div>
          </div>
        </div>

        <div className={`p-8 rounded-[40px] border transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-600"><TrendingUp size={24} /></div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Moyenne Mensuelle</p>
              <div className="text-2xl font-black">{stats.avg.toLocaleString('fr-FR')}</div>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-600" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div className={`p-8 rounded-[40px] border transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-2xl bg-amber-600/10 text-amber-600"><CalendarDays size={24} /></div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pic d'Activité</p>
              <div className="text-2xl font-black uppercase">{stats.peakMonth?.month || '-'}</div>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume : {stats.peakMonth?.total} unités</p>
        </div>
      </section>

      {/* Breakdown Products Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {[
           { label: 'CGR (Rouge)', val: stats.breakdown.cgr, color: 'text-red-600', bg: 'bg-red-600/5', barColor: '#ef4444' },
           { label: 'Plasma (Jaune Pur)', val: stats.breakdown.plasma, color: 'text-yellow-600', bg: 'bg-yellow-600/5', barColor: '#eab308' },
           { label: 'Plaquettes (Jaune Clair)', val: stats.breakdown.plaquettes, color: 'text-yellow-400', bg: 'bg-yellow-400/5', barColor: '#fde047' }
         ].map((p, i) => (
           <div key={i} className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
             <div className="flex justify-between items-center mb-4">
               <span className={`text-[9px] font-black uppercase tracking-widest ${p.color}`}>{p.label}</span>
               <span className="text-lg font-black">{p.val}</span>
             </div>
             <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
               <div className="h-full" style={{ backgroundColor: p.barColor, width: `${stats.total > 0 ? (p.val / stats.total) * 100 : 0}%` }}></div>
             </div>
           </div>
         ))}
      </section>

      {/* Charts Section */}
      <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-1">Évolution Annuelle des Distributions</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Analyse temporelle des PSL - {siteName}</p>
          </div>
        </div>
        
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCgr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPlasma" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPlaquettes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fde047" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fde047" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} axisLine={false} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#0f172a' : '#fff', 
                  borderColor: darkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                  borderWidth: '0'
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }}/>
              <Area type="monotone" name="CGR" dataKey="cgr" stroke="#ef4444" fillOpacity={1} fill="url(#colorCgr)" strokeWidth={4} />
              <Area type="monotone" name="Plasma" dataKey="plasma" stroke="#eab308" fillOpacity={1} fill="url(#colorPlasma)" strokeWidth={4} />
              <Area type="monotone" name="Plaquettes" dataKey="plaquettes" stroke="#fde047" fillOpacity={1} fill="url(#colorPlaquettes)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <Activity size={16} className="text-red-600" />
            Performance de Flux Mensuel
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.total === stats.peakMonth?.total ? '#ef4444' : (darkMode ? '#334155' : '#cbd5e1')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-slate-500">Historique des 3 Derniers Mois</h3>
          <div className="space-y-4">
            {data.filter(m => m.total > 0).slice(-3).reverse().map((m, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-black uppercase text-xs">{m.month}</div>
                  <div>
                    <div className="text-sm font-black uppercase tracking-tight">{m.total.toLocaleString()} unités</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Total Distribution</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex gap-1 mb-1">
                     <div className="w-2 h-2 rounded-full bg-red-500" title="CGR"></div>
                     <div className="w-2 h-2 rounded-full bg-yellow-500" title="Plasma"></div>
                     <div className="w-2 h-2 rounded-full bg-yellow-300" title="Plaquettes"></div>
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase font-black">Code Couleurs PSL</div>
                </div>
              </div>
            ))}
            {data.every(m => m.total === 0) && (
              <div className="flex flex-col items-center justify-center py-10 opacity-40">
                <Database size={40} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Aucune donnée annuelle</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualCharts;
