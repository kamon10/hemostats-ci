
import React, { useMemo } from 'react';
import { BLOOD_GROUPS } from '../constants';
import { BloodGroup } from '../types';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { FileSpreadsheet, Hash, Activity, Sparkles } from 'lucide-react';

interface Props {
  data: any[];
  darkMode: boolean;
  month: string;
  year: string;
}

const SiteSynthesis: React.FC<Props> = ({ data, darkMode, month, year }) => {
  const bloodColors: Record<BloodGroup, string> = {
    'A+': '#ef4444',
    'A-': '#f87171',
    'B+': '#3b82f6',
    'B-': '#60a5fa',
    'AB+': '#10b981',
    'AB-': '#34d399',
    'O+': '#f59e0b',
    'O-': '#fbbf24'
  };

  // Création des données éparpillées avec Jittering
  const scatteredData = useMemo(() => {
    const points: any[] = [];
    const sortedData = [...data].sort((a, b) => b.total - a.total);
    
    sortedData.forEach((siteRow, sIdx) => {
      const siteShortName = siteRow.site.replace('CRTS ', '').replace('SITE ', '');
      
      BLOOD_GROUPS.forEach((group, gIdx) => {
        const value = siteRow[group] || 0;
        if (value > 0) {
          // Ajout de "jitter" (bruit aléatoire contrôlé) pour l'effet éparpillé
          // X est basé sur l'index du groupe (0-7) + jitter
          // Y est basé sur l'index du site + jitter
          points.push({
            x: gIdx * 10 + (Math.random() * 6 - 3), // Centre sur 0, 10, 20... avec écart de +/- 3
            y: (sortedData.length - sIdx) * 10 + (Math.random() * 6 - 3),
            value: value,
            group: group,
            site: siteShortName,
            fullSite: siteRow.site,
            size: value
          });
        }
      });
    });
    return points;
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const info = payload[0].payload;
      return (
        <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${darkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: bloodColors[info.group as BloodGroup] }}></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{info.fullSite}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-3xl font-black text-slate-800 dark:text-white">{info.group}</div>
             <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
             <div>
               <p className="text-xl font-black text-red-600 tabular-nums">{info.value}</p>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Unités distribuées</p>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Nuage de Bulles Éparpillées */}
      <div className={`p-8 rounded-[40px] border relative overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700 shadow-2xl shadow-black/20' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Sparkles size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 relative z-10">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
              <Activity size={16} className="text-red-600 animate-pulse" />
              Nuage de Distribution National ({month} {year})
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Visualisation organique des volumes par groupe et par centre</p>
          </div>
        </div>

        <div className="h-[600px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <defs>
                {BLOOD_GROUPS.map(g => (
                  <radialGradient key={`grad-${g}`} id={`grad-${g}`} cx="30%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="white" stopOpacity={0.4} />
                    <stop offset="100%" stopColor={bloodColors[g]} stopOpacity={0.8} />
                  </radialGradient>
                ))}
              </defs>
              
              <CartesianGrid 
                strokeDasharray="10 10" 
                stroke={darkMode ? '#334155' : '#f1f5f9'} 
                vertical={false} 
                horizontal={false}
              />
              
              <XAxis 
                type="number" 
                dataKey="x" 
                hide 
                domain={[-5, 75]}
              />
              
              <YAxis 
                type="number" 
                dataKey="y" 
                hide 
                domain={[0, (data.length + 1) * 10]}
              />

              <ZAxis 
                type="number" 
                dataKey="size" 
                range={[100, 4000]} 
              />
              
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1', strokeWidth: 1 }} 
              />
              
              <Scatter 
                data={scatteredData} 
                animationBegin={0} 
                animationDuration={2000} 
                animationEasing="ease-out"
              >
                {scatteredData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#grad-${entry.group})`}
                    className="hover:scale-110 transition-transform duration-500 cursor-pointer drop-shadow-xl"
                    style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          {/* Labels des Groupes Sanguins en bas */}
          <div className="absolute bottom-0 left-0 w-full flex justify-between px-[6%] pointer-events-none">
            {BLOOD_GROUPS.map(g => (
              <div key={g} className="flex flex-col items-center">
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mb-2"></div>
                <span className="text-[11px] font-black text-slate-400 dark:text-slate-500">{g}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Légende flottante */}
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {BLOOD_GROUPS.map(g => (
            <div key={g} className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-red-500/30">
              <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: bloodColors[g] }}></div>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{g}</span>
            </div>
          ))}
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
                    const percentage = row.total > 0 ? (row[g] / row.total) * 100 : 0;
                    return (
                      <td key={g} className="relative px-2 py-5 text-center overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 h-0.5 transition-all duration-1000 ease-out opacity-30" 
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: bloodColors[g] 
                          }}
                        />
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
