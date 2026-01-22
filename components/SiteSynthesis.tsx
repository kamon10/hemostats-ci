
import React, { useMemo } from 'react';
import { BLOOD_GROUPS } from '../constants';
import { 
  FileSpreadsheet, 
  Hash, 
  Activity, 
  TrendingUp, 
  Award, 
  BarChart2,
  Info
} from 'lucide-react';

interface Props {
  data: any[];
  darkMode: boolean;
  month: string;
  year: string;
}

const SiteSynthesis: React.FC<Props> = ({ data, darkMode, month, year }) => {
  const sortedData = useMemo(() => [...data].sort((a, b) => b.total - a.total), [data]);
  
  const stats = useMemo(() => {
    const total = sortedData.reduce((sum, item) => sum + item.total, 0);
    const leader = sortedData[0] || { site: '-', total: 0 };
    const average = sortedData.length > 0 ? Math.round(total / sortedData.length) : 0;
    
    return { total, leader, average };
  }, [sortedData]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Section de Statistiques Simples (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total National */}
        <div className={`p-8 rounded-[32px] border relative overflow-hidden transition-all hover:scale-[1.02] ${darkMode ? 'bg-slate-800 border-slate-700 shadow-2xl shadow-black/20' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Activity size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-red-600" />
              Volume National Global
            </p>
            <div className="text-4xl font-black tracking-tighter text-red-600 mb-2 tabular-nums">
              {stats.total.toLocaleString('fr-FR')}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unités distribuées en {month}</p>
          </div>
        </div>

        {/* Site Leader */}
        <div className={`p-8 rounded-[32px] border relative overflow-hidden transition-all hover:scale-[1.02] ${darkMode ? 'bg-slate-800 border-slate-700 shadow-2xl shadow-black/20' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Award size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Award size={14} className="text-amber-500" />
              Site Principal (Top 1)
            </p>
            <div className="text-2xl font-black tracking-tight text-slate-800 dark:text-white mb-2 uppercase truncate" title={stats.leader.site}>
              {stats.leader.site.replace('CRTS ', '').replace('SITE ', '')}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Performance : {stats.leader.total.toLocaleString('fr-FR')} unités</p>
          </div>
        </div>

        {/* Moyenne par Centre */}
        <div className={`p-8 rounded-[32px] border relative overflow-hidden transition-all hover:scale-[1.02] ${darkMode ? 'bg-slate-800 border-slate-700 shadow-2xl shadow-black/20' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <BarChart2 size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <BarChart2 size={14} className="text-blue-500" />
              Moyenne par Centre
            </p>
            <div className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white mb-2 tabular-nums">
              {stats.average.toLocaleString('fr-FR')}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Basé sur {data.length} sites actifs</p>
          </div>
        </div>
      </div>

      {/* Tableau Récapitulatif National */}
      <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
              <FileSpreadsheet size={16} className="text-red-600" />
              Récapitulatif National par Site ({month} {year})
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Données consolidées de distribution des PSL</p>
          </div>
          <div className="no-print">
             <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                <Info size={14} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest">Lecture directe des unités</span>
             </div>
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
              {sortedData.map((row, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-5 text-center sticky left-0 z-10 bg-inherit border-r border-slate-100 dark:border-slate-700">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${idx < 3 ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs font-black uppercase tracking-tighter sticky left-16 z-10 bg-inherit border-r border-slate-100 dark:border-slate-700 group-hover:text-red-600 transition-colors truncate">
                    {row.site}
                  </td>
                  {BLOOD_GROUPS.map(g => (
                    <td key={g} className="px-2 py-5 text-center">
                      <span className={`text-xs tabular-nums ${row[g] > 0 ? 'font-black text-slate-700 dark:text-slate-200' : 'text-slate-200 dark:text-slate-700'}`}>
                        {row[g] || 0}
                      </span>
                    </td>
                  ))}
                  <td className="px-6 py-5 text-sm font-black text-right tabular-nums bg-red-600/5 text-red-600 border-l border-red-100/10">
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
                    {stats.total.toLocaleString('fr-FR')}
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
