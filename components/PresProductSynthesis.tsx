
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BloodGroup } from '../types';
import { BLOOD_GROUPS, AVAILABLE_SITES } from '../constants';
import { Grid, FileSpreadsheet, Layers, Filter } from 'lucide-react';

interface Props {
  data: any[];
  darkMode: boolean;
  month: string;
  year: string;
}

const PresProductSynthesis: React.FC<Props> = ({ data, darkMode, month, year }) => {
  const synthesis = useMemo(() => {
    const aggregation: Record<string, any> = {};
    
    // On groupe par Region (PRES) et par Type de Produit
    data.forEach(row => {
      const pres = row.site ? (AVAILABLE_SITES.find(s => s.name === row.site)?.region || row.site) : 'PRES INCONNUE';
      const type = row.productType;
      const key = `${pres}|${type}`;
      
      if (!aggregation[key]) {
        aggregation[key] = {
          pres,
          productType: type,
          total: 0,
          Bd_rendu: 0,
          ...BLOOD_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {})
        };
      }
      
      BLOOD_GROUPS.forEach(g => aggregation[key][g] += (row.counts?.[g] || row[g] || 0));
      aggregation[key].total += (row.total || 0);
      aggregation[key].Bd_rendu += (row.Bd_rendu || 0);
    });

    return Object.values(aggregation).sort((a: any, b: any) => a.pres.localeCompare(b.pres));
  }, [data]);

  // Données pour le graphique
  const chartData = useMemo(() => {
    const presMap: Record<string, any> = {};
    synthesis.forEach((item: any) => {
      if (!presMap[item.pres]) presMap[item.pres] = { name: item.pres };
      presMap[item.pres][item.productType] = item.total;
    });
    return Object.values(presMap);
  }, [synthesis]);

  const productTypes = Array.from(new Set(synthesis.map((s: any) => s.productType)));
  const colors = ['#ef4444', '#eab308', '#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Layers size={24} className="text-red-600" />
              Synthèse PRES / TYPE DE PRODUIT
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] border-l-4 border-red-600 pl-4 mt-2">
              Analyse croisée régionale par type de PSL
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              Période: {month} {year}
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full mb-12">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis 
                dataKey="name" 
                stroke={darkMode ? '#94a3b8' : '#64748b'} 
                fontSize={10} 
                fontWeight="bold"
                angle={-45}
                textAnchor="end"
              />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#0f172a' : '#fff', 
                  borderColor: darkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                }}
              />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
              {productTypes.map((type, index) => (
                <Bar key={type} dataKey={type} stackId="a" fill={colors[index % colors.length]} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">RÉGION (PRES)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">TYPE DE PRODUIT</th>
                {/* Fixed syntax error: replaced </th> with ))} */}
                {BLOOD_GROUPS.map(g => (
                  <th key={g} className="px-2 py-4 text-[10px] font-black uppercase tracking-widest text-center">{g}</th>
                ))}
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center text-purple-600">RENDU</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right bg-red-600/5 text-red-600">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {synthesis.map((row: any, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4 text-xs font-black uppercase tracking-tighter text-slate-800 dark:text-slate-200">
                    {row.pres}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {row.productType}
                    </span>
                  </td>
                  {BLOOD_GROUPS.map(g => (
                    <td key={g} className="px-2 py-4 text-center tabular-nums text-xs font-bold text-slate-600 dark:text-slate-400">
                      {row[g] || 0}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center text-xs font-bold text-purple-600">
                    {row.Bd_rendu}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-right text-red-600 bg-red-600/5">
                    {row.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PresProductSynthesis;
