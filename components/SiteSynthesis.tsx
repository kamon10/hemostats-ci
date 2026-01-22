
import React, { useMemo } from 'react';
import { BLOOD_GROUPS } from '../constants';
import { BloodGroup } from '../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { FileSpreadsheet, Hash, Activity, PieChart as PieIcon, Info } from 'lucide-react';

interface Props {
  data: any[];
  darkMode: boolean;
  month: string;
  year: string;
}

const SiteSynthesis: React.FC<Props> = ({ data, darkMode, month, year }) => {
  // Couleurs distinctes pour les différents sites CNTSCI
  const siteColors = [
    '#E11D48', // Rose/Red (Treichville)
    '#2563EB', // Blue (Bouake)
    '#059669', // Green (Korhogo)
    '#D97706', // Amber (San Pedro)
    '#7C3AED', // Violet (Daloa)
    '#0891B2', // Cyan (Yamoussoukro)
    '#4F46E5', // Indigo
    '#BE123C', // Rose 700
    '#1D4ED8', // Blue 700
    '#047857', // Green 700
  ];

  const pieData = useMemo(() => {
    return data
      .map(row => ({
        name: row.site.replace('CRTS ', '').replace('SITE ', ''),
        fullName: row.site,
        value: row.total
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const totalNational = useMemo(() => pieData.reduce((sum, item) => sum + item.value, 0), [pieData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const info = payload[0].payload;
      const pct = totalNational > 0 ? ((info.value / totalNational) * 100).toFixed(1) : 0;
      return (
        <div className={`p-5 rounded-[24px] border shadow-2xl backdrop-blur-xl ${darkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-100'}`}>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">{info.fullName}</p>
          <div className="flex items-center gap-5">
             <div>
               <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{info.value.toLocaleString('fr-FR')}</p>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Unités Distribuées</p>
             </div>
             <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>
             <div>
               <p className="text-2xl font-black text-red-600 tabular-nums">{pct}%</p>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Part Nationale</p>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Graphique en Camembert (Donut) */}
      <div className={`p-8 lg:p-12 rounded-[40px] border relative overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700 shadow-2xl shadow-black/20' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
              <PieIcon size={18} className="text-red-600" />
              Répartition par SITE CNTSCI ({month} {year})
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Analyse comparative des parts de marché nationales</p>
          </div>
          
          <div className={`px-5 py-3 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total National</span>
              <span className="text-xl font-black text-red-600 tabular-nums">{totalNational.toLocaleString('fr-FR')}</span>
            </div>
            <Activity size={20} className="text-red-600/30" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[450px]">
          {/* Zone du Pie Chart */}
          <div className="h-[400px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={160}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={siteColors[index % siteColors.length]} 
                      className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Centre du Donut */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">CNTSCI</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">PSL</p>
            </div>
          </div>

          {/* Légende personnalisée et détaillée */}
          <div className="space-y-4">
             {pieData.map((item, idx) => {
               const pct = totalNational > 0 ? ((item.value / totalNational) * 100).toFixed(1) : 0;
               return (
                 <div 
                   key={idx} 
                   className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:translate-x-2 ${darkMode ? 'bg-slate-900/40 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: siteColors[idx % siteColors.length] }}></div>
                     <div>
                       <p className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">{item.fullName}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.value.toLocaleString('fr-FR')} unités</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <span className="text-sm font-black text-red-600 tabular-nums">{pct}%</span>
                   </div>
                 </div>
               );
             })}
          </div>
        </div>
      </div>

      {/* Tableau Récapitulatif avec indicateurs de performance */}
      <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
              <FileSpreadsheet size={16} className="text-red-600" />
              Données Consolidées par SITE
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Analyse tabulaire précise des distributions nationales</p>
          </div>
          <div className="no-print">
             <button className={`p-2 rounded-xl border flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <Info size={14} /> Guide de lecture
             </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner">
          <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50/80 text-slate-600'}`}>
                <th className="w-16 px-4 py-5 text-[9px] font-black uppercase tracking-widest text-center sticky left-0 z-20 bg-inherit border-r border-slate-200/20"><Hash size={12} className="mx-auto" /></th>
                <th className="w-48 px-6 py-5 text-[10px] font-black uppercase tracking-widest sticky left-16 z-20 bg-inherit border-r border-slate-200/20">SITE CNTSCI</th>
                {BLOOD_GROUPS.map(g => (
                  <th key={g} className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-center">{g}</th>
                ))}
                <th className="w-32 px-6 py-5 text-[10px] font-black uppercase tracking-widest text-right bg-red-600/5 text-red-600">TOTAL UNITS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.sort((a, b) => b.total - a.total).map((row, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-5 text-center sticky left-0 z-10 bg-inherit border-r border-slate-100 dark:border-slate-700">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${idx < 3 ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs font-black uppercase tracking-tighter sticky left-16 z-10 bg-inherit border-r border-slate-100 dark:border-slate-700 group-hover:text-red-600 transition-colors">
                    {row.site}
                  </td>
                  {BLOOD_GROUPS.map(g => {
                    return (
                      <td key={g} className="relative px-2 py-5 text-center overflow-hidden">
                        <span className={`relative z-10 text-xs tabular-nums ${row[g] > 0 ? 'font-black text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>
                          {row[g] || 0}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-6 py-5 text-sm font-black text-right tabular-nums bg-red-600/5 text-red-600 border-l border-red-100/20">
                    {row.total.toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
            {data.length > 0 && (
              <tfoot className="sticky bottom-0 z-30">
                <tr className={`${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-900 text-white'} font-black shadow-[0_-10px_30px_rgba(0,0,0,0.2)]`}>
                  <td colSpan={2} className="px-6 py-6 text-[11px] uppercase tracking-[0.2em] text-center">TOTAL NATIONAL CONSOLIDÉ</td>
                  {BLOOD_GROUPS.map(g => (
                    <td key={g} className="px-2 py-6 text-sm text-center tabular-nums">
                      {data.reduce((sum, row) => sum + (row[g] || 0), 0).toLocaleString('fr-FR')}
                    </td>
                  ))}
                  <td className="px-6 py-6 text-lg text-right tabular-nums bg-red-600">
                    {data.reduce((sum, row) => sum + row.total, 0).toLocaleString('fr-FR')}
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
