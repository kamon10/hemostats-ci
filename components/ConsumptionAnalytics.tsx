
import React, { useState, useMemo } from 'react';
import { DistributionRowExtended } from '../types';
import { BLOOD_GROUPS, PRES_STRUCTURE } from '../constants';
import { 
  TrendingUp, 
  BarChart3, 
  Filter, 
  Building2, 
  Activity,
  ChevronDown,
  PieChart,
  Hospital,
  Layers,
  CalendarDays,
  Target,
  ArrowRight,
  Database,
  SearchX
} from 'lucide-react';

interface Props {
  data: DistributionRowExtended[];
  darkMode: boolean;
}

type TimeScale = 'daily' | 'weekly' | 'monthly';

const ConsumptionAnalytics: React.FC<Props> = ({ data, darkMode }) => {
  const [selectedPres, setSelectedPres] = useState<string>('TOUS LES PRES');
  const [selectedSite, setSelectedSite] = useState<string>('TOUS LES SITES');
  const [selectedFacility, setSelectedFacility] = useState<string>('TOUTES LES STRUCTURES');
  const [timeScale, setTimeScale] = useState<TimeScale>('daily');

  // Extraction dynamique des PRES présents dans les données réelles
  const presList = useMemo(() => {
    const existingPres = Array.from(new Set(data.map(d => d.pres))).filter(p => p);
    const officialPres = Object.keys(PRES_STRUCTURE);
    const combined = Array.from(new Set(['TOUS LES PRES', ...officialPres, ...existingPres])).sort();
    return combined;
  }, [data]);
  
  const siteList = useMemo(() => {
    let filtered = data;
    if (selectedPres !== 'TOUS LES PRES') {
      filtered = data.filter(d => d.pres === selectedPres);
    }
    return ['TOUS LES SITES', ...Array.from(new Set(filtered.map(d => d.site))).sort()];
  }, [data, selectedPres]);

  const facilityList = useMemo(() => {
    let filtered = data;
    if (selectedPres !== 'TOUS LES PRES') filtered = filtered.filter(d => d.pres === selectedPres);
    if (selectedSite !== 'TOUS LES SITES') filtered = filtered.filter(d => d.site === selectedSite);
    return ['TOUTES LES STRUCTURES', ...Array.from(new Set(filtered.map(d => d.facility))).sort()];
  }, [data, selectedPres, selectedSite]);

  // Filtrage des données selon le périmètre sélectionné
  const filteredData = useMemo(() => {
    return data.filter(d => {
      const presMatch = selectedPres === 'TOUS LES PRES' || d.pres === selectedPres;
      const siteMatch = selectedSite === 'TOUS LES SITES' || d.site === selectedSite;
      const facilityMatch = selectedFacility === 'TOUTES LES STRUCTURES' || d.facility === selectedFacility;
      return presMatch && siteMatch && facilityMatch;
    });
  }, [data, selectedPres, selectedSite, selectedFacility]);

  // Statistiques de consommation agrégées
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const totalVolume = filteredData.reduce((acc, curr) => acc + curr.total, 0);
    const uniqueDays = new Set(filteredData.map(d => d.dateStr)).size;
    const uniqueMonths = new Set(filteredData.map(d => `${d.monthIdx}-${d.year}`)).size;
    const estimatedWeeks = Math.max(1, Math.ceil(uniqueDays / 7));

    const avgDaily = totalVolume / Math.max(1, uniqueDays);
    const avgWeekly = totalVolume / estimatedWeeks;
    const avgMonthly = totalVolume / Math.max(1, uniqueMonths);

    // Groupement par Type de Produit et Groupes Sanguins
    const productBreakdown: Record<string, any> = {};
    filteredData.forEach(row => {
      if (!productBreakdown[row.productType]) {
        productBreakdown[row.productType] = {
          name: row.productType,
          total: 0,
          groups: BLOOD_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {})
        };
      }
      productBreakdown[row.productType].total += row.total;
      BLOOD_GROUPS.forEach(g => {
        productBreakdown[row.productType].groups[g] += (row.counts[g] || 0);
      });
    });

    return {
      totalVolume,
      avgDaily,
      avgWeekly,
      avgMonthly,
      productBreakdown: Object.values(productBreakdown),
      uniqueDays,
      uniqueMonths,
      estimatedWeeks
    };
  }, [filteredData]);

  const safeDivisor = useMemo(() => {
    if (!stats) return 1;
    if (timeScale === 'daily') return Math.max(1, stats.uniqueDays);
    if (timeScale === 'weekly') return Math.max(1, stats.estimatedWeeks);
    return Math.max(1, stats.uniqueMonths);
  }, [stats, timeScale]);

  const currentAvgLabel = timeScale === 'daily' ? 'Journalière' : timeScale === 'weekly' ? 'Hebdomadaire' : 'Mensuelle';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* SECTION FILTRES HIÉRARCHIQUES CNTSCI */}
      <div className={`p-8 rounded-[45px] border grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-end gap-6 ${darkMode ? 'bg-slate-800 border-slate-700 shadow-xl' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
            <Target size={12} className="text-red-600" /> Pôle Régional (PRES)
          </label>
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <select 
              value={selectedPres} 
              onChange={(e) => { setSelectedPres(e.target.value); setSelectedSite('TOUS LES SITES'); setSelectedFacility('TOUTES LES STRUCTURES'); }}
              className="bg-transparent border-none outline-none w-full text-xs font-black uppercase cursor-pointer"
            >
              {presList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
            <Building2 size={12} className="text-blue-600" /> Site Rattaché
          </label>
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <select 
              value={selectedSite} 
              onChange={(e) => { setSelectedSite(e.target.value); setSelectedFacility('TOUTES LES STRUCTURES'); }}
              className="bg-transparent border-none outline-none w-full text-xs font-black uppercase cursor-pointer"
            >
              {siteList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
            <Hospital size={12} className="text-purple-600" /> Établissement (FS)
          </label>
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <select 
              value={selectedFacility} 
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs font-black uppercase cursor-pointer"
            >
              {facilityList.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
            <CalendarDays size={12} /> Échelle de Temps
          </label>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
            {(['daily', 'weekly', 'monthly'] as TimeScale[]).map(scale => (
              <button
                key={scale}
                onClick={() => setTimeScale(scale)}
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${timeScale === scale ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500'}`}
              >
                {scale === 'daily' ? 'JOUR' : scale === 'weekly' ? 'SEM.' : 'MOIS'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {stats ? (
        <>
          {/* CARTES DE SYNTHÈSE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-8 rounded-[40px] border relative overflow-hidden group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:scale-110 transition-transform"><Activity size={100} className="text-red-600" /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Conso. Moy. {currentAvgLabel}</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-5xl font-black tracking-tighter tabular-nums text-slate-900 dark:text-white">
                  {Math.round(timeScale === 'daily' ? stats.avgDaily : timeScale === 'weekly' ? stats.avgWeekly : stats.avgMonthly).toLocaleString()}
                </h4>
                <span className="text-xs font-bold text-slate-400 uppercase">Unités / Cycle</span>
              </div>
            </div>

            <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Volume Consommé Période</p>
              <div className="text-3xl font-black mb-4 tabular-nums text-blue-600">{stats.totalVolume.toLocaleString()} Poches</div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Focus Groupes Sanguins (Moy.)</p>
              <div className="grid grid-cols-2 gap-3">
                 {['O+', 'O-', 'A+', 'B+'].map(g => (
                   <div key={g} className="flex flex-col p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                     <span className="text-[10px] font-black text-red-600 mb-1">{g}</span>
                     <span className="text-lg font-black tabular-nums">
                       {Math.round(filteredData.reduce((acc, curr) => acc + (curr.counts[g] || 0), 0) / safeDivisor).toLocaleString()}
                     </span>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* TABLEAU MATRIX DES CONSOMMATIONS */}
          <div className={`p-10 rounded-[50px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl shadow-red-500/5'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-red-600 text-white rounded-3xl shadow-xl shadow-red-600/20"><Layers size={28} /></div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Prévisions {currentAvgLabel} par Groupe</h3>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    <span className="text-red-600">{selectedPres}</span> 
                    <ArrowRight size={10} /> 
                    <span className="text-blue-600">{selectedSite}</span>
                    <ArrowRight size={10} />
                    <span className="text-purple-600">{selectedFacility}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-[35px] border border-slate-100 dark:border-slate-700">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className={`${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Type de Produit</th>
                    {BLOOD_GROUPS.map(g => (
                      <th key={g} className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-center">{g}</th>
                    ))}
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right bg-red-600 text-white">TOTAL MOYEN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.productBreakdown.map((prod: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">
                          {prod.name}
                        </span>
                      </td>
                      {BLOOD_GROUPS.map(g => (
                        <td key={g} className="px-4 py-6 text-center tabular-nums text-xs font-bold text-slate-500">
                          {Math.round(prod.groups[g] / safeDivisor).toLocaleString()}
                        </td>
                      ))}
                      <td className="px-8 py-6 text-right font-black text-red-600 bg-red-600/5 tabular-nums">
                        {Math.round(prod.total / safeDivisor).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-200 dark:border-slate-700">
                  <tr className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'} font-black`}>
                    <td className="px-8 py-8 text-[11px] uppercase tracking-[0.2em]">CUMUL DÉCISIONNEL (MOY.)</td>
                    {BLOOD_GROUPS.map(g => {
                      const totalGroup = stats.productBreakdown.reduce((sum, p) => sum + (p.groups[g] || 0), 0);
                      return (
                        <td key={g} className="px-4 py-8 text-center tabular-nums text-sm">
                          {Math.round(totalGroup / safeDivisor).toLocaleString()}
                        </td>
                      );
                    })}
                    <td className="px-8 py-8 text-right text-xl bg-red-600 text-white tabular-nums">
                      {Math.round(stats.totalVolume / safeDivisor).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className={`p-24 text-center rounded-[50px] border border-dashed ${darkMode ? 'border-slate-700 bg-slate-800/20' : 'border-slate-200 bg-slate-50'}`}>
           <SearchX size={80} className="mx-auto text-slate-200 dark:text-slate-800 mb-8" />
           <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Périmètre sans données</h3>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] max-w-lg mx-auto leading-relaxed">
             Le pôle <span className="text-red-600">{selectedPres}</span> est actuellement vide. <br/>
             Si vous voyez "HORS PRES" dans les données, cela signifie que le nom du site dans votre fichier CSV ne correspond pas aux codes officiels (01-44) ou aux noms de villes. <br/>
             <span className="block mt-4 text-[9px]">Vérifiez par exemple que "MAN" ou "23" apparaît bien dans le champ "SI_NOM" de votre source.</span>
           </p>
        </div>
      )}
    </div>
  );
};

export default ConsumptionAnalytics;
