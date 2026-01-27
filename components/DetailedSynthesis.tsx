
import React, { useState, useMemo } from 'react';
import { BLOOD_GROUPS } from '../constants';
import { BloodGroup } from '../types';
import { Grid, Search, Filter, Printer, FileText, RotateCcw, TrendingUp, AlertCircle, Info } from 'lucide-react';
import Logo from './Logo';

interface DetailedRow {
  site: string;
  productType: string;
  total: number;
  Bd_rendu: number;
  [key: string]: any;
}

interface Props {
  data: DetailedRow[];
  darkMode: boolean;
  month: string;
  year: string;
  focusRendu?: boolean;
}

const DetailedSynthesis: React.FC<Props> = ({ data, darkMode, month, year, focusRendu = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(row => 
      row.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.productType.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.site.localeCompare(b.site) || b.total - a.total);
  }, [data, searchTerm]);

  // Grouping by site for visual separation
  const groupedData = useMemo(() => {
    const groups: Record<string, DetailedRow[]> = {};
    filteredData.forEach(row => {
      if (!groups[row.site]) groups[row.site] = [];
      groups[row.site].push(row);
    });
    return groups;
  }, [filteredData]);

  const summaryStats = useMemo(() => {
    const totalDist = data.reduce((sum, r) => sum + r.total, 0);
    const totalRendu = data.reduce((sum, r) => sum + r.Bd_rendu, 0);
    const ratio = totalDist > 0 ? (totalRendu / totalDist * 100).toFixed(2) : "0.00";
    
    // Top Site Rendu
    const siteAggregation: Record<string, number> = {};
    data.forEach(r => {
      siteAggregation[r.site] = (siteAggregation[r.site] || 0) + r.Bd_rendu;
    });
    const topSite = Object.entries(siteAggregation).sort((a, b) => b[1] - a[1])[0] || ["-", 0];

    return { totalDist, totalRendu, ratio, topSite };
  }, [data]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 8pt !important;
          }
          aside, header, .no-print, .sidebar, nav, button {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            padding: 0 !important;
          }
          .print-header {
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #ef4444;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          th, td {
            border: 0.5px solid #e2e8f0 !important;
            padding: 4px 8px !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #475569 !important;
          }
          .bg-red-600 {
            background-color: #ef4444 !important;
            color: white !important;
          }
          .bg-red-600\/5 {
            background-color: rgba(239, 68, 68, 0.1) !important;
          }
          tfoot tr {
            background-color: #1e293b !important;
            color: white !important;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      {/* Rendu Focus Header Dashboard */}
      {focusRendu && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          <div className={`p-6 rounded-[32px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600">
                <RotateCcw size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">TOTAL RENDU POCHES National</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-purple-600 tabular-nums">{summaryStats.totalRendu.toLocaleString()}</p>
                  <p className="text-sm font-bold text-purple-400">({summaryStats.ratio}%)</p>
                </div>
              </div>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
               <div className="h-full bg-purple-600" style={{ width: `${summaryStats.ratio}%` }}></div>
            </div>
          </div>

          <div className={`p-6 rounded-[32px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Taux de Rendu Moyen</p>
                <p className="text-2xl font-black text-amber-600 tabular-nums">{summaryStats.ratio}%</p>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase">Basé sur {summaryStats.totalDist.toLocaleString()} distributions</p>
          </div>

          <div className={`p-6 rounded-[32px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Top Site (Retours)</p>
                <p className="text-xl font-black text-blue-600 truncate max-w-[180px]">{summaryStats.topSite[0]}</p>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase">{summaryStats.topSite[1]} unités retournées</p>
          </div>
        </div>
      )}

      <div className={`print-container p-8 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        {/* En-tête visible uniquement à l'impression */}
        <div className="print-header hidden">
          <div className="flex items-center gap-5">
            <Logo size="lg" />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">HÉMOSTATS CI</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-red-600 pl-3">Document de Synthèse Officiel - CNTSCI</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Plateforme Nationale de Suivi de la Distribution des PSL</p>
            </div>
          </div>
          <div className="text-right flex-1">
            <p className="text-[10px] font-black uppercase mb-1">Période : {month} {year}</p>
            <p className="text-[9px] font-bold uppercase text-slate-600">Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 no-print">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
              {focusRendu ? <RotateCcw size={16} className="text-purple-600" /> : <Grid size={16} className="text-red-600" />}
              {focusRendu ? "Synthèse : TOTAL RENDU POCHES, TYPE PRODUIT, SITE" : "Synthèse : GS, TYPE PRODUIT, SITE & RENDU"}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Période : {month} {year}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher Site ou Produit..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-semibold w-48 lg:w-64"
              />
            </div>
            <button 
              onClick={handlePrint}
              title="Exporter en PDF / Imprimer"
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-red-500/50' : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-red-600 hover:border-red-500/30 shadow-sm'}`}
            >
              <Printer size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest pr-1">PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest sticky left-0 z-20 bg-inherit min-w-[180px]">Site (SI_NOM COMPLET)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest min-w-[220px]">Produit (NA_LIBELLE)</th>
                {BLOOD_GROUPS.map(g => (
                  <th key={g} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">{g}</th>
                ))}
                <th className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center ${focusRendu ? 'bg-purple-600 text-white' : 'text-purple-600'}`}>Rendu</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right sticky right-0 z-20 bg-inherit border-l border-slate-200 dark:border-slate-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {Object.entries(groupedData).map(([site, rows]: [string, DetailedRow[]]) => (
                <React.Fragment key={site}>
                  {/* Site Header Row */}
                  <tr className={`${darkMode ? 'bg-slate-800/80' : 'bg-slate-50/50'}`}>
                    <td colSpan={BLOOD_GROUPS.length + 4} className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] border-b ${focusRendu ? 'text-purple-600 border-purple-500/10' : 'text-red-600 border-red-500/10'}`}>
                      Site : {site}
                    </td>
                  </tr>
                  {rows.map((row, idx) => (
                    <tr key={`${site}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-xs font-black uppercase tracking-tighter sticky left-0 z-10 bg-inherit border-r border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {site}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300">
                        {row.productType}
                      </td>
                      {BLOOD_GROUPS.map(g => (
                        <td key={g} className={`px-4 py-4 text-xs text-center tabular-nums transition-colors ${row[g] > 0 ? (focusRendu ? 'text-purple-500' : 'text-red-500') : 'text-slate-300 dark:text-slate-600'}`}>
                          {row[g] || 0}
                        </td>
                      ))}
                      <td className={`px-4 py-4 text-xs text-center tabular-nums font-black ${focusRendu ? 'bg-purple-600/5 text-purple-700' : 'text-purple-600'}`}>
                        {row.Bd_rendu || 0}
                      </td>
                      <td className={`px-6 py-4 text-sm font-black text-right tabular-nums bg-red-600/5 text-red-600 sticky right-0 z-10 border-l border-slate-200 dark:border-slate-700`}>
                        {row.total}
                      </td>
                    </tr>
                  ))}
                  {/* Site Sub-total */}
                  <tr className="border-t-2 border-slate-100 dark:border-slate-700">
                    <td colSpan={2} className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-right text-slate-400">Total {site} :</td>
                    {BLOOD_GROUPS.map(g => (
                      <td key={g} className="px-4 py-3 text-[10px] font-black text-center text-slate-500">
                        {rows.reduce((sum, r) => sum + (r[g] || 0), 0)}
                      </td>
                    ))}
                    <td className={`px-4 py-3 text-[10px] font-black text-center ${focusRendu ? 'bg-purple-600/10 text-purple-700' : 'text-purple-400'}`}>
                      {rows.reduce((sum, r) => sum + (r.Bd_rendu || 0), 0)}
                    </td>
                    <td className="px-6 py-3 text-xs font-black text-right text-slate-500 bg-slate-100/50 dark:bg-slate-700/50 sticky right-0 z-10">
                      {rows.reduce((sum, r) => sum + r.total, 0)}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
              
              {data.length === 0 && (
                <tr>
                  <td colSpan={BLOOD_GROUPS.length + 4} className="px-6 py-20 text-center text-xs italic text-slate-400 uppercase tracking-widest">
                    Aucune donnée disponible pour les filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
            {data.length > 0 && (
              <tfoot className="sticky bottom-0 z-30">
                <tr className={`${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white'} font-black shadow-[0_-4px_10px_rgba(0,0,0,0.1)]`}>
                  <td colSpan={2} className="px-6 py-5 text-[10px] uppercase tracking-widest">TOTAL NATIONAL CONSOLIDÉ</td>
                  {BLOOD_GROUPS.map(g => (
                    <td key={g} className="px-4 py-5 text-sm text-center tabular-nums">
                      {data.reduce((sum, row) => sum + (row[g] || 0), 0)}
                    </td>
                  ))}
                  <td className={`px-4 py-5 text-sm text-center tabular-nums ${focusRendu ? 'bg-purple-600 text-white' : 'text-purple-400'}`}>
                    {data.reduce((sum, row) => sum + (row.Bd_rendu || 0), 0)}
                  </td>
                  <td className="px-6 py-5 text-lg text-right tabular-nums bg-red-600 sticky right-0 z-30">
                    {data.reduce((sum, row) => sum + row.total, 0)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        
        {/* Footer visible uniquement à l'impression */}
        <div className="hidden print:block mt-12 pt-8 border-t border-slate-200">
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase underline decoration-red-600 underline-offset-4">Visa de la Direction Technique</p>
              <div className="w-48 h-20 border border-slate-200 rounded-lg"></div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-slate-400 uppercase italic leading-loose">Hémostats CI - Page 1 sur 1<br/>Document certifié par le CNTSCI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedSynthesis;
