
import React, { useMemo } from 'react';
import { DistributionRow, BloodGroup } from '../types';
import { BLOOD_GROUPS } from '../constants';
// Fixed: Removed non-existent and unused 'TrendingRight' icon import from lucide-react
import { Building2, Package, Hospital } from 'lucide-react';

interface Props {
  data: DistributionRow[];
  darkMode: boolean;
}

const FacilityView: React.FC<Props> = ({ data, darkMode }) => {
  const facilityData = useMemo(() => {
    const grouped: Record<string, { total: number, products: number, groups: Record<BloodGroup, number> }> = {};
    
    data.forEach(row => {
      const facility = row.facility || 'Inconnu';
      if (!grouped[facility]) {
        grouped[facility] = { 
          total: 0, 
          products: 0, 
          groups: BLOOD_GROUPS.reduce((acc, g) => ({...acc, [g]: 0}), {} as Record<BloodGroup, number>) 
        };
      }
      grouped[facility].total += row.total;
      grouped[facility].products += 1;
      BLOOD_GROUPS.forEach(g => {
        grouped[facility].groups[g] += (row.counts[g] || 0);
      });
    });
    
    return Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {facilityData.map(([name, stats], idx) => (
          <div key={idx} className={`p-6 rounded-3xl border transition-all hover:shadow-xl group ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-red-500/50' : 'bg-white border-slate-100 shadow-sm hover:border-red-500/30'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} group-hover:bg-red-500 group-hover:text-white transition-colors`}>
                <Hospital size={24} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Reçu</span>
                <span className="text-2xl font-black text-red-500">{stats.total} <small className="text-[10px] text-slate-400 font-bold uppercase">unités</small></span>
              </div>
            </div>

            <h3 className="text-lg font-black uppercase tracking-tight mb-4 truncate" title={name}>{name}</h3>
            
            <div className="grid grid-cols-4 gap-2 mb-6">
              {BLOOD_GROUPS.map(g => (
                <div key={g} className={`p-2 rounded-xl text-center border ${stats.groups[g] > 0 ? (darkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600') : (darkMode ? 'bg-slate-900 border-slate-700 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-300')}`}>
                  <div className="text-[9px] font-black uppercase mb-1">{g}</div>
                  <div className="text-xs font-bold">{stats.groups[g]}</div>
                </div>
              ))}
            </div>

            <div className={`flex items-center justify-between p-3 rounded-2xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <Package size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase">{stats.products} types de produits</span>
              </div>
              <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${Math.min(100, (stats.total / 100) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {facilityData.length === 0 && (
        <div className="py-20 text-center">
          <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Aucune structure sanitaire rattachée détectée</p>
        </div>
      )}
    </div>
  );
};

export default FacilityView;
