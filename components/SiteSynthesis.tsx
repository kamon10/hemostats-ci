
import React from 'react';
import { BLOOD_GROUPS } from '../constants';
import { BloodGroup } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';
import { MapPin, FileSpreadsheet } from 'lucide-react';

interface SiteAggregation {
  site: string;
  total: number;
}

interface Props {
  data: any[];
  darkMode: boolean;
  month: string;
  year: string;
}

const SiteSynthesis: React.FC<Props> = ({ data, darkMode, month, year }) => {
  const chartData = data.map(d => ({
    name: d.site.replace('CRTS ', ''),
    total: d.total
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
          <MapPin size={16} className="text-red-600" />
          Répartition Nationale des Distributions par DEPÔT CNTSCI ({month} {year})
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc' }}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#0f172a' : '#fff', 
                  borderColor: darkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '16px'
                }}
              />
              <Bar dataKey="total" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-red-600" />
            Tableau Récapitulatif par DEPÔT CNTSCI
          </h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest sticky left-0 z-10 bg-inherit">DEPÔT CNTSCI</th>
                {BLOOD_GROUPS.map(g => (
                  <th key={g} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">{g}</th>
                ))}
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.sort((a, b) => b.total - a.total).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-black uppercase tracking-tighter sticky left-0 z-10 bg-inherit border-r border-slate-100 dark:border-slate-700">
                    {row.site}
                  </td>
                  {BLOOD_GROUPS.map(g => (
                    <td key={g} className={`px-4 py-4 text-xs text-center tabular-nums ${row[g] > 0 ? 'font-bold text-red-500' : 'text-slate-300 dark:text-slate-600'}`}>
                      {row[g] || 0}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm font-black text-right tabular-nums bg-red-600/5 text-red-600">
                    {row.total}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={BLOOD_GROUPS.length + 2} className="px-6 py-12 text-center text-xs italic text-slate-400 uppercase tracking-widest">
                    Aucune donnée agrégée disponible pour cette période
                  </td>
                </tr>
              )}
            </tbody>
            {data.length > 0 && (
              <tfoot>
                <tr className={`${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'} font-black`}>
                  <td className="px-6 py-4 text-[10px] uppercase tracking-widest">TOTAL NATIONAL</td>
                  {BLOOD_GROUPS.map(g => (
                    <td key={g} className="px-4 py-4 text-xs text-center tabular-nums">
                      {data.reduce((sum, row) => sum + (row[g] || 0), 0)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm text-right tabular-nums">
                    {data.reduce((sum, row) => sum + row.total, 0)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default SiteSynthesis;
