
import React from 'react';
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
  AreaChart,
  Area
} from 'recharts';
import { DistributionRow } from '../types';
import { BLOOD_GROUPS } from '../constants';

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

  // Prep data for product breakdown chart with smart coloring
  const productData = data.map(row => {
    let color = '#ef4444'; // default CGR red
    const type = row.productType.toUpperCase();
    
    if (type.includes('PLASMA')) {
      color = '#eab308'; // Pure Yellow
    } else if (type.includes('PLAQUETTES')) {
      color = '#fde047'; // Light Yellow (yellow-300 for visibility)
    }

    return {
      name: row.productType.split(' ')[0] + '...',
      total: row.total,
      fullName: row.productType,
      color: color
    };
  }).filter(d => d.total > 0);

  const colors = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'
  ];

  return (
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
                  <Cell key={`cell-${index}`} fill={entry.value > 0 ? colors[index % colors.length] : (darkMode ? '#1e293b' : '#f1f5f9')} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Category Breakdown with Custom Colors */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
          Distribution Par Type de Produit
        </h3>
        <div className="h-64 w-full">
          {productData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#0f172a' : '#fff', 
                    borderColor: darkMode ? '#334155' : '#e2e8f0',
                    borderRadius: '12px'
                  }}
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                   {productData.map((entry, index) => (
                      <Cell key={`cell-product-${index}`} fill={entry.color} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 italic text-sm">
              Aucune distribution enregistrée pour cette vue
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataCharts;
