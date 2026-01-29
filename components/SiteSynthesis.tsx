
import React, { useMemo } from 'react';
import { BLOOD_GROUPS } from '../constants';
import { 
  FileSpreadsheet, 
  Hash, 
  Activity, 
  TrendingUp, 
  Award, 
  BarChart2,
  Info,
  RotateCcw,
  Target,
  BarChart3,
  Zap,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

interface Props {
  data: any[];
  darkMode: boolean;
  month: string;
  year: string;
}

const SiteSynthesis: React.FC<Props> = ({ data, darkMode, month, year }) => {
  const siteAggregation = useMemo(() => {
    const map = new Map<string, any>();
    
    data.forEach(row => {
      const site = row.site || 'SITE INCONNU';
      if (!map.has(site)) {
        map.set(site, {
          site,
          total: 0,
          Bd_rendu: 0,
          ...BLOOD_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {})
        });
      }
      const entry = map.get(site);
      entry.total += row.total;
      entry.Bd_rendu += (row.Bd_rendu || 0);
      BLOOD_GROUPS.forEach(g => {
        entry[g] += (row.counts[g] || 0);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [data]);

  const stats = useMemo(() => {
    const total = siteAggregation.reduce((sum, item) => sum + item.total, 0);
    const totalRendu = siteAggregation.reduce((sum, item) => sum + item.Bd_rendu, 0);
    const renduPct = total > 0 ? (totalRendu / total * 100).toFixed(2) : "0.00";
    const leader = siteAggregation[0] || { site: '-', total: 0 };
    const average = siteAggregation.length > 0 ? Math.round(total / siteAggregation.length) : 0;
    
    return { total, totalRendu, renduPct, leader, average };
  }, [siteAggregation]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Section PULSES Captivants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pulse 1: Volume National (RED HEARTBEAT) */}
        <div className={`group relative p-8 rounded-[45px] border-2 transition-all duration-500 pulse-red ${darkMode ? 'bg-slate-800/80 border-red-500/20' : 'bg-white border-red-500/10 shadow-2xl shadow-red-500/10'}`}>
          <div className="absolute -top-4 -right-4 bg-red-600 text-white p-3 rounded-2xl shadow-lg animate-bounce">
            <Zap size={20} fill="currentColor" />
          </div>
          <p className="text-[11px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
            <Activity size={14} /> Flux National Live
          </p>
          <div className="space-y-1">
            <h4 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums">
              {stats.total.toLocaleString()}
            </h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unités PSL Distribuées</p>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-red-500/10 pt-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase">Période</span>
              <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-300">{month} {year}</span>
            </div>
            <ArrowUpRight className="text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={24} />
          </div>
        </div>

        {/* Pulse 2: Rendus (PURPLE GLOW) */}
        <div className={`group relative p-8 rounded-[45px] border-2 transition-all duration-500 pulse-purple ${darkMode ? 'bg-slate-800/80 border-purple-500/20' : 'bg-white border-purple-500/10 shadow-2xl shadow-purple-500/10'}`}>
          <p className="text-[11px] font-black text-purple-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
            <RotateCcw size={14} /> Efficiency Rate
          </p>
          <div className="space-y-1">
            <h4 className="text-6xl font-black tracking-tighter text-purple-600 tabular-nums">
              {stats.renduPct}<span className="text-2xl">%</span>
            </h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Taux de Retour au Stock</p>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-purple-500/10 pt-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase">Volume Rendu</span>
              <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-300">{stats.totalRendu.toLocaleString()} poches</span>
            </div>
            <div className="p-2 bg-purple-600/10 rounded-full">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
          </div>
        </div>

        {/* Pulse 3: Top Site (INDIGO SHOCK) */}
        <div className={`group relative p-8 rounded-[45px] border-2 transition-all duration-500 pulse-indigo ${darkMode ? 'bg-slate-800/80 border-indigo-500/20' : 'bg-white border-indigo-500/10 shadow-2xl shadow-indigo-500/10'}`}>
          <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
            <Award size={14} /> Performance Elite
          </p>
          <div className="space-y-1">
            <h4 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase truncate">
              {stats.leader.site.replace('CRTS ', '')}
            </h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Centre Leader en Distribution</p>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-indigo-500/10 pt-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase">Contribution</span>
              <span className="text-sm font-black uppercase text-indigo-600">{( (stats.leader.total / stats.total) * 100).toFixed(1)}% du Volume</span>
            </div>
            <ShieldCheck className="text-indigo-600" size={24} />
          </div>
        </div>

      </div>

      {/* Tableau Consolidé - Design Premium */}
      <div className={`p-10 rounded-[50px] border shadow-2xl ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-12 bg-red-600 rounded-full"></div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                <FileSpreadsheet size={24} className="text-red-600" />
                Consolidé par Centre de Transfusion
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Données auditées en temps réel • {month} {year}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl">
            <BarChart2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">{siteAggregation.length} Sites Actifs</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[35px] border border-slate-100 dark:border-slate-700 shadow-inner">
          <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-700/80 text-slate-300' : 'bg-slate-50/80 text-slate-600'}`}>
                <th className="w-20 px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">#</th>
                <th className="w-64 px-6 py-6 text-[10px] font-black uppercase tracking-widest">Centre Transfusionnel</th>
                {BLOOD_GROUPS.map(g => (
                  <th key={g} className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-center">{g}</th>
                ))}
                <th className="w-32 px-4 py-6 text-[10px] font-black uppercase tracking-widest text-center text-purple-600">RENDU</th>
                <th className="w-40 px-8 py-6 text-[11px] font-black uppercase tracking-widest text-right bg-red-600 text-white">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {siteAggregation.map((row, idx) => (
                <tr key={idx} className="group hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-all duration-300">
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black ${idx < 3 ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-sm font-black uppercase tracking-tighter text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">
                      {row.site}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Côte d'Ivoire</p>
                  </td>
                  {BLOOD_GROUPS.map(g => (
                    <td key={g} className="px-4 py-6 text-center">
                      <span className={`text-xs tabular-nums ${row[g] > 0 ? 'font-black text-slate-800 dark:text-slate-100' : 'text-slate-200 dark:text-slate-700'}`}>
                        {row[g] || 0}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-6 text-center">
                    <span className={`text-xs tabular-nums font-black text-purple-600 bg-purple-600/5 px-3 py-1.5 rounded-lg border border-purple-500/10`}>
                      {row.Bd_rendu || 0}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-base font-black text-right tabular-nums bg-red-600/5 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                    {row.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0">
               <tr className="bg-slate-900 text-white font-black">
                  <td colSpan={2} className="px-8 py-8 text-xs uppercase tracking-[0.3em]">Total National Consolidé</td>
                  {BLOOD_GROUPS.map(g => (
                    <td key={g} className="px-4 py-8 text-base text-center tabular-nums">
                      {siteAggregation.reduce((sum, row) => sum + (row[g] || 0), 0).toLocaleString()}
                    </td>
                  ))}
                  <td className="px-4 py-8 text-base text-center tabular-nums text-purple-400">
                    {stats.totalRendu.toLocaleString()}
                  </td>
                  <td className="px-8 py-8 text-2xl text-right tabular-nums bg-red-600">
                    {stats.total.toLocaleString()}
                  </td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SiteSynthesis;
