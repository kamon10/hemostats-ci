
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
  Legend,
  Cell
} from 'recharts';
import { MapPin, FileSpreadsheet, Hash, Activity } from 'lucide-react';

interface Props {
  data: any[];
  darkMode: boolean;
  month: string;
  year: string;
}

const SiteSynthesis: React.FC<Props> = ({ data, darkMode, month, year }) => {
  // Couleurs distinctes pour les groupes sanguins
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

  // Transformation des données pour le Bubble Matrix
  // On "aplatit" les données pour avoir un point par (Site, Groupe Sanguin)
  const bubbleData = useMemo(() => {
    const flattened: any[] = [];
    data.forEach(siteRow => {
      const shortName = siteRow.site.replace('CRTS ', '').replace('SITE ', '');
      BLOOD_GROUPS.forEach(group => {
        const value = siteRow[group] || 0;
        if (value > 0) {
          flattened.push({
            site: shortName,
            fullSite: siteRow.site,
            group: group,
            value: value,
            // Pour le positionnement sur les axes catégoriels
            xIndex: group,
            yIndex: shortName
          });
        }
      });
    });
    return flattened;
  }, [data]);

  // Tri des sites par total pour un affichage ordonné
  const sortedSites = useMemo(() => {
    return [...data]
      .sort((a, b) => b.total - a.total)
      .map(d => d.site.replace('CRTS ', '').replace('SITE ', ''));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const info = payload[0].payload;
      return (
        <div className={`p-4 rounded-2xl border shadow-xl ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{info.fullSite}</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: bloodColors[info.group as BloodGroup] }}>
              {info.group}
            </div>
            <div>
              <p className="text-xl font-black tabular-nums">{info.value}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Unités distribuées</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Graphique à Bulles (Bubble Matrix) */}
      <div className={`p-8 rounded-[40px] border relative overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
              <Activity size={16} className="text-red-600 animate-pulse" />
              Bubble Matrix : Intensité de Distribution par Site ({month} {year})
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">La taille de la bulle reflète le volume d'unités pour chaque groupe sanguin</p>
          </div>
        </div>

        <div className="h-[550px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} vertical={false} />
              
              <XAxis 
                type="category" 
                dataKey="group" 
                name="Groupe" 
                interval={0}
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                fontSize={12}
                fontWeight="900"
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              
              <YAxis 
                type="category" 
                dataKey="site" 
                name="Site" 
                ticks={sortedSites}
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                fontSize={10}
                fontWeight="700"
                axisLine={false}
                tickLine={false}
                width={80}
              />

              <ZAxis 
                type="number" 
                dataKey="value" 
                range={[50, 2500]} 
                name="Volume" 
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#ef4444' }} />
              
              <Scatter data={bubbleData} animationBegin={0} animationDuration={1500} animationEasing="ease-out">
                {bubbleData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={bloodColors[entry.group as BloodGroup]} 
                    fillOpacity={0.8}
                    stroke={bloodColors[entry.group as BloodGroup]}
                    strokeWidth={2}
                    className="hover:filter hover:brightness-125 transition-all duration-300 cursor-pointer drop-shadow-md"
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Légende personnalisée en bas */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {BLOOD_GROUPS.map(g => (
            <div key={g} className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bloodColors[g] }}></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{g}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau Récapitulatif (Conservé car essentiel pour la précision des chiffres) */}
      <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
              <FileSpreadsheet size={16} className="text-red-600" />
              Tableau Récapitulatif par SITE CNTSCI
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Données consolidées par site de prélèvement</p>
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
