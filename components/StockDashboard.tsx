
import React, { useMemo, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { BloodGroup, DistributionData } from '../types';
import { BLOOD_GROUPS, AVAILABLE_SITES } from '../constants';
import { Map as MapIcon, Clock, TrendingUp, Target } from 'lucide-react';
import Logo from './Logo';
import L from 'leaflet';

interface Props {
  data: DistributionData;
  allSitesData: Record<string, DistributionData>;
  darkMode: boolean;
  onSiteSelect: (name: string) => void;
}

const StockDashboard: React.FC<Props> = ({ data, allSitesData, darkMode, onSiteSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const stock = data.stock;

  // Conversion approximative des coordonnées custom vers LatLng pour Leaflet
  // En Côte d'Ivoire : Lat ~ 5 à 10, Lng ~ -8 à -3
  const getLatLng = (x: number, y: number) => {
    const lat = 10.5 - (y / 900) * 6;
    const lng = -8.5 + (x / 800) * 6;
    return [lat, lng] as [number, number];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [7.5, -5.5],
        zoom: 7,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    }

    // Nettoyage des markers existants
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) mapRef.current?.removeLayer(layer);
    });

    // Ajout des pôles
    AVAILABLE_SITES.forEach(site => {
      const siteData = allSitesData[site.id]?.stock;
      if (!siteData) return;

      const pos = getLatLng(site.coords.x, site.coords.y);
      
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="flex flex-col items-center group cursor-pointer">
            <div class="bg-red-600 text-white font-black text-[10px] w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-white transform transition-transform group-hover:scale-125">
              ${siteData.cgr}
            </div>
            <div class="bg-white/90 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter mt-1 shadow-sm border border-slate-200">
              ${site.region}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker(pos, { icon }).addTo(mapRef.current!);
      marker.on('click', () => onSiteSelect(site.name));
    });

    return () => {
      // Pas de destruction ici pour garder l'instance lors des re-renders légers
    };
  }, [allSitesData, onSiteSelect]);

  const pieData = useMemo(() => {
    if (!stock) return [];
    return BLOOD_GROUPS.map(g => ({
      name: g,
      value: stock.byGroup[g].units,
      days: stock.byGroup[g].days,
      percentage: Math.round((stock.byGroup[g].units / stock.cgr) * 100)
    }));
  }, [stock]);

  const COLORS = ['#ea580c', '#f97316', '#8b5cf6', '#10b981', '#3b82f6', '#ef4444', '#eab308', '#0ea5e9'];

  if (!stock) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* CARTE INTERACTIVE STYLE FOLIUM */}
        <div className={`xl:col-span-8 p-6 lg:p-10 rounded-[48px] border relative overflow-hidden flex flex-col items-center justify-center min-h-[850px] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          
          <div className="absolute top-10 left-10 z-[1000] space-y-2 pointer-events-none">
            <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xl rotate-3">
                <MapIcon size={24} />
              </div>
              CARTOGRAPHIE LIVE DES STOCKS
            </h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.3em] border-l-4 border-red-600 pl-4">
              Visualisation Géospatiale Interactive
            </p>
          </div>

          {/* Leaflet Map Container */}
          <div className="relative w-full h-[700px] mt-20 rounded-[32px] overflow-hidden border-4 border-slate-100 dark:border-slate-700 shadow-2xl">
             <div ref={mapContainerRef} className="w-full h-full z-10" />
             
             {/* Overlay Info Panel */}
             <div className="absolute bottom-6 left-6 flex flex-col gap-4 z-[1000] pointer-events-none">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 pointer-events-auto">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg">CGR</div>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Stock en temps réel</span>
                   </div>
                   <div className="text-[9px] font-bold text-slate-400 italic">
                     * Cliquez sur un pôle pour voir les détails
                   </div>
                </div>

                <div className="bg-slate-900 dark:bg-red-700 p-8 rounded-[40px] text-white shadow-2xl flex flex-col gap-1 border border-white/10 pointer-events-auto">
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60">CUMUL NATIONAL DISPONIBLE</p>
                   <div className="flex items-baseline gap-3">
                     <p className="text-5xl font-black tabular-nums tracking-tighter">{(stock.cgr).toLocaleString()}</p>
                     <span className="text-sm font-bold opacity-60 uppercase">Unités CGR</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* INDICATEURS KPI DE DROITE */}
        <div className="xl:col-span-4 space-y-6">
          <div className={`p-10 rounded-[48px] border overflow-hidden relative ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl'}`}>
            <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-12 text-slate-400 flex items-center gap-2">
               <TrendingUp size={20} className="text-red-600" />
               Disponibilité Totale
            </h4>
            
            <div className="space-y-12">
              <div className="flex items-center justify-between group">
                <span className="text-3xl font-black uppercase tracking-tighter group-hover:text-red-600 transition-colors">CGR</span>
                <div className="text-4xl font-black text-red-600 tabular-nums">{stock.cgr}</div>
              </div>
              <div className="flex items-center justify-between group">
                <span className="text-3xl font-black uppercase tracking-tighter group-hover:text-yellow-600 transition-colors">PLASMA</span>
                <div className="text-4xl font-black text-yellow-500 tabular-nums">{stock.plasma}</div>
              </div>
              <div className="flex items-center justify-between group">
                <span className="text-3xl font-black uppercase tracking-tighter group-hover:text-blue-500 transition-colors">PLQ</span>
                <div className="text-4xl font-black text-blue-500 tabular-nums">{stock.plaquettes}</div>
              </div>
            </div>
          </div>

          <div className={`p-10 rounded-[48px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl'}`}>
            <h4 className="text-sm font-black uppercase tracking-widest text-center mb-10">Sécurité Stock CGR</h4>
            <div className="h-72 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-3xl font-black text-red-600 leading-none">{stock.cgr}</p>
                 <p className="text-[10px] font-black uppercase text-slate-400 mt-2">TOTAL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
