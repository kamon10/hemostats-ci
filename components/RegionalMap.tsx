
import React, { useState, useMemo } from 'react';
import { AVAILABLE_SITES } from '../constants';
import { MapPin, Info, TrendingUp, Target, Globe, RotateCcw } from 'lucide-react';

// Added interface to fix type 'unknown' errors when data is inferred loosely
interface SiteMapData {
  site: string;
  total: number;
  Bd_rendu?: number;
  [key: string]: any;
}

interface Props {
  data: SiteMapData[];
  darkMode: boolean;
  onSiteSelect: (name: string) => void;
}

const RegionalMap: React.FC<Props> = ({ data, darkMode, onSiteSelect }) => {
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);

  // Normalisation des données pour la coloration thermique et calcul des rendus
  // Fixed: explicit typing of 'd' to ensure the compiler recognizes 'site', 'total', and 'Bd_rendu'
  const siteStats = useMemo(() => {
    const map = new Map<string, { total: number, rendu: number }>();
    data.forEach((d: SiteMapData) => map.set(d.site, { total: d.total, rendu: d.Bd_rendu || 0 }));
    return map;
  }, [data]);

  const maxTotal = useMemo(() => {
    // Fix: Explicitly type the map parameter 'v' to resolve the 'unknown' type error on property 'total'
    const totals = Array.from(siteStats.values()).map((v: { total: number }) => v.total);
    return Math.max(...(totals as number[]), 100);
  }, [siteStats]);

  const getIntensity = (siteName: string) => {
    const stats = siteStats.get(siteName);
    return stats ? Math.min(1, stats.total / maxTotal) : 0;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Colonne Carte */}
      <div className={`xl:col-span-2 p-8 rounded-[40px] border relative overflow-hidden flex flex-col items-center justify-center min-h-[600px] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="absolute top-8 left-8">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
            <Globe size={16} className="text-red-600" />
            Répartition Géographique
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cliquez sur un site pour plus de détails</p>
        </div>

        {/* SVG de la Côte d'Ivoire (Simplifié) */}
        <svg viewBox="0 0 100 100" className="w-full max-w-[500px] drop-shadow-2xl">
          <path 
            d="M20,10 L80,10 L95,40 L90,70 L80,95 L20,95 L10,70 L5,40 Z" 
            fill={darkMode ? '#0f172a' : '#f8fafc'} 
            stroke={darkMode ? '#334155' : '#e2e8f0'} 
            strokeWidth="0.5"
          />
          
          {AVAILABLE_SITES.map(site => {
            const intensity = getIntensity(site.name);
            const stats = siteStats.get(site.name);
            const isHovered = hoveredSite === site.name;

            return (
              <g 
                key={site.id} 
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredSite(site.name)}
                onMouseLeave={() => setHoveredSite(null)}
                onClick={() => onSiteSelect(site.name)}
              >
                {intensity > 0.6 && (
                  <circle cx={site.coords.x} cy={site.coords.y} r="3" fill="#ef4444" className="animate-ping opacity-20" />
                )}
                
                <circle 
                  cx={site.coords.x} 
                  cy={site.coords.y} 
                  r={isHovered ? 2.5 : 1.8} 
                  fill={stats && stats.total > 0 ? '#ef4444' : (darkMode ? '#334155' : '#cbd5e1')} 
                  className="transition-all duration-300"
                />
                
                <text 
                  x={site.coords.x} 
                  y={site.coords.y - 4} 
                  textAnchor="middle" 
                  className={`text-[2.5px] font-black uppercase tracking-tighter pointer-events-none transition-all ${isHovered ? 'fill-red-600' : (darkMode ? 'fill-slate-500' : 'fill-slate-400')}`}
                >
                  {site.region}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-8 right-8 flex items-center gap-4 bg-slate-900/5 dark:bg-slate-50/5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col gap-1">
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Intensité Distribution</span>
             <div className="flex items-center gap-1">
               <div className="w-16 h-2 bg-gradient-to-r from-slate-200 to-red-600 rounded-full"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Colonne Détails Latérale */}
      <div className="space-y-6">
        <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Info size={16} className="text-blue-500" />
            Zoom Régional
          </h4>
          
          {hoveredSite ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Centre Transfusionnel</p>
                <h2 className="text-2xl font-black uppercase tracking-tighter">{hoveredSite}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume Mensuel</p>
                  <p className="text-xl font-black text-red-500">{siteStats.get(hoveredSite)?.total || 0}</p>
                </div>
                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Rendus (Bd_rendu)</p>
                  <p className="text-xl font-black text-purple-600">{siteStats.get(hoveredSite)?.rendu || 0}</p>
                </div>
              </div>

              <button 
                onClick={() => onSiteSelect(hoveredSite)}
                className="w-full bg-red-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-red-700 transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                Voir détails complets <TrendingUp size={16} />
              </button>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-4 text-slate-400">
                  <MapPin size={32} />
               </div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                 Survolez une région sur la carte pour isoler ses statistiques de distribution.
               </p>
            </div>
          )}
        </div>

        <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
             <Target size={16} className="text-indigo-600" />
             Top Régions (Mois)
          </h4>
          <div className="space-y-4">
            {data.sort((a, b) => b.total - a.total).slice(0, 3).map((site, i) => (
              <div key={site.site} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-black text-slate-400">0{i+1}</div>
                  <div className="text-[10px] font-black uppercase tracking-tight truncate max-w-[120px]">{site.site}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(site.total / maxTotal) * 100}%` }}></div>
                  </div>
                  <div className="text-[10px] font-black text-red-500">{site.total}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalMap;
