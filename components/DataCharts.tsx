
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import { DistributionRow } from '../types';
import { BLOOD_GROUPS } from '../constants';
import { RotateCcw } from 'lucide-react';

interface Props {
  data: DistributionRow[];
  title: string;
  darkMode: boolean;
}

const DataCharts: React.FC<Props> = ({ data, title, darkMode }) => {
  // Prep data for blood group distribution chart
  const groupData = BLOOD_GROUPS.map(group => ({
    name: group,
    value: data.reduce((acc, row) => acc + (row.counts[group] || 0), 0)
  }));

  const totalDist = useMemo(() => data.reduce((acc, row) => acc + row.total, 0), [data]);
  const totalRendu = useMemo(() => data.reduce((acc, row) => acc + (row.Bd_rendu || 0), 0), [data]);

  // Agrégation cumulative par type de produit avec attribution de couleurs spécifiques
  const productData = useMemo(() => {
    const aggregation: Record<string, { total: number, color: string }> = {};

    data.forEach(row => {
      const type = row.productType.trim().toUpperCase();
      let color = '#ef4444'; // Rouge par défaut (CGR)
      
      if (type.includes('ADULTE')) {
        color = '#ef4444'; // Rouge (CGR Adulte)
      } else if (type.includes('PEDIATRIQUE')) {
        color = '#10b981'; // Vert (CGR Pédiatrique)
      } else if (type.includes('NOURRISON')) {
        color = '#f97316'; // Orange (CGR Nourrisson)
      } else if (type.includes('PLASMA')) {
        color = '#eab308'; // Jaune Pur (Plasma)
      } else if (type.includes('PLAQUETTES')) {
        color = '#3b82f6'; // Bleu (Plaquettes)
      } else if (type.includes('CGR')) {
        color = '#dc2626'; // Rouge Foncé pour les autres CGR
      }

      if (!aggregation[type]) {
        aggregation[type] = { total: 0, color };
      }
      aggregation[type].total += row.total;
    });

    return Object.entries(aggregation)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        fullName: name,
        color: stats.color
      }))
      .filter(d => d.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [data]);

  const bloodGroupColors = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Blood Group Breakdown */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Distribution Par Groupe Sanguin
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#0f172a' : '#fff', 
                    borderColor: darkMode ? '#334155' : '#e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {groupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? bloodGroupColors[index % bloodGroupColors.length] : (darkMode ? '#1e293b' : '#f1f5f9')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Category Breakdown with Cumulative Pie Chart and Custom Colors */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            Distribution Par Type (Cumul National)
          </h3>
          <div className="h-64 w-full">
            {productData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="total"
                    nameKey="name"
                    stroke="none"
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-product-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#0f172a' : '#fff', 
                      borderColor: darkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                    formatter={(value) => [value, "Unités"]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 italic text-sm">
                Aucune distribution enregistrée pour cette vue
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rendu Statistics (Bd_rendu summary for Global Dashboard) */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600">
              <RotateCcw size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Rendements des Distributions (Bd_rendu)</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ratio des retours consolidés par type</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL RENDU POCHES</p>
            <p className="text-xl font-black text-purple-600">{totalRendu.toLocaleString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {['CGR', 'PLASMA', 'PLAQUETTES'].map(type => {
              const typeTotal = data.filter(r => r.productType.toUpperCase().includes(type)).reduce((acc, r) => acc + r.total, 0);
              const typeRendu = data.filter(r => r.productType.toUpperCase().includes(type)).reduce((acc, r) => acc + r.Bd_rendu, 0);
              const pct = typeTotal > 0 ? Math.round((typeRendu / typeTotal) * 100) : 0;
              return (
                <div key={type} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200/50'}`}>
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{type}</span>
                      <span className="text-xs font-black text-purple-600">{pct}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600" style={{ width: `${pct}%` }}></div>
                   </div>
                   <div className="mt-2 flex justify-between text-[8px] font-bold uppercase text-slate-400">
                      <span>Rendu: {typeRendu}</span>
                      <span>Total: {typeTotal}</span>
                   </div>
                </div>
              );
           })}
        </div>
      </div>
    </div>
  );
};

export default DataCharts;
