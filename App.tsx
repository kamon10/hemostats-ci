
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, 
  Moon, 
  Sun,
  MapPin,
  Calendar, 
  Clock,
  RefreshCw,
  LogOut,
  Table,
  Grid,
  Globe,
  Loader2,
  Hospital,
  Package,
  Database,
  SearchX,
  RotateCcw,
  Building2,
  TrendingUp,
  ChevronRight,
  Filter,
  BarChart3,
  Droplet,
  PieChart
} from 'lucide-react';
import { BLOOD_GROUPS, MONTHS, DAYS, YEARS } from './constants';
import DistributionTable from './components/DistributionTable';
import DataCharts from './components/DataCharts';
import GeminiInsights from './components/GeminiInsights';
import FacilityView from './components/FacilityView';
import AnnualCharts from './components/AnnualCharts';
import SiteSynthesis from './components/SiteSynthesis';
import ConsumptionAnalytics from './components/ConsumptionAnalytics';
import Login from './components/Login';
import Logo from './components/Logo';
import { DistributionRowExtended, MonthlyTrend } from './types';
import { fetchSheetData } from './services/sheetService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [user, setUser] = useState<{name: string, role: string} | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<string>(today.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[today.getMonth()]);
  const [selectedDay, setSelectedDay] = useState<string>(today.getDate().toString().padStart(2, '0'));

  const [selectedSiteName, setSelectedSiteName] = useState<string>('TOUS LES SITES');
  const [activeTab, setActiveTab] = useState<'synthesis' | 'daily' | 'monthly' | 'annual' | 'facilities' | 'consumption'>('synthesis');
  const [darkMode, setDarkMode] = useState(false);
  
  const [customData, setCustomData] = useState<DistributionRowExtended[] | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasInitialSyncDone, setHasInitialSyncDone] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const syncWithSheet = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchSheetData();
      setCustomData(data);
      setLastSync(new Date().toLocaleTimeString('fr-FR'));
      setHasInitialSyncDone(true);
    } catch (err) {
      console.error("Sync Error:", err);
      setCustomData([]);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !hasInitialSyncDone) {
      syncWithSheet();
    }
  }, [isAuthenticated, hasInitialSyncDone]);

  const dynamicSites = useMemo(() => {
    if (!customData) return [];
    const sites = Array.from(new Set(customData.map(d => d.site))).sort() as string[];
    return sites.map(name => ({ id: name.toLowerCase().replace(/\s/g, '-'), name }));
  }, [customData]);

  const siteFilteredData = useMemo(() => {
    if (!customData) return [];
    return selectedSiteName === 'TOUS LES SITES' 
      ? customData 
      : customData.filter(r => r.site === selectedSiteName);
  }, [customData, selectedSiteName]);

  const selDayNum = parseInt(selectedDay);
  const selMonthIdx = MONTHS.indexOf(selectedMonth);
  const selYearNum = parseInt(selectedYear);

  const currentDisplayData = useMemo(() => {
    switch (activeTab) {
      case 'daily':
        return siteFilteredData.filter(row => row.day === selDayNum && row.monthIdx === selMonthIdx && row.year === selYearNum);
      case 'synthesis':
      case 'monthly':
      case 'facilities':
      case 'consumption':
        return siteFilteredData.filter(row => row.monthIdx === selMonthIdx && row.year === selYearNum);
      case 'annual':
        return siteFilteredData.filter(row => row.year === selYearNum);
      default:
        return siteFilteredData;
    }
  }, [siteFilteredData, activeTab, selDayNum, selMonthIdx, selYearNum]);

  const annualTrendData = useMemo(() => {
    const yearData = siteFilteredData.filter(r => r.year === selYearNum);
    return MONTHS.map((m, idx) => {
      const monthRows = yearData.filter(r => r.monthIdx === idx);
      return {
        month: m.substring(0, 3),
        total: monthRows.reduce((acc, r) => acc + r.total, 0),
        cgr: monthRows.filter(r => r.productType.toUpperCase().includes('CGR')).reduce((acc, r) => acc + r.total, 0),
        plasma: monthRows.filter(r => r.productType.toUpperCase().includes('PLASMA')).reduce((acc, r) => acc + r.total, 0),
        plaquettes: monthRows.filter(r => r.productType.toUpperCase().includes('PLAQUETTE')).reduce((acc, r) => acc + r.total, 0)
      } as MonthlyTrend;
    });
  }, [siteFilteredData, selYearNum]);

  const stats = useMemo(() => {
    if (!currentDisplayData.length) return { total: 0, facilities: 0, products: 0, cgr: 0, rendu: 0 };
    const total = currentDisplayData.reduce((acc, row) => acc + row.total, 0);
    const facilities = new Set(currentDisplayData.map(r => r.facility)).size;
    const products = new Set(currentDisplayData.map(r => r.productType)).size;
    const cgr = currentDisplayData.filter(r => r.productType.toUpperCase().includes('CGR')).reduce((s, r) => s + r.total, 0);
    const rendu = currentDisplayData.reduce((acc, row) => acc + (row.Bd_rendu || 0), 0);
    return { total, facilities, products, cgr, rendu };
  }, [currentDisplayData]);

  const handleLogin = (username: string, role: string = 'Agent') => {
    setIsAuthenticated(true);
    const userData = { name: username, role };
    setUser(userData);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.clear();
    setCustomData(null);
    setHasInitialSyncDone(false);
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} darkMode={darkMode} />;

  if (!hasInitialSyncDone && isSyncing) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <Logo size="lg" className="mb-8 animate-float" />
        <Loader2 size={40} className="animate-spin text-red-600 mb-4" />
        <h2 className="text-xl font-black uppercase tracking-tighter">Flux CNTSCI...</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Récupération des données temps réel</p>
      </div>
    );
  }

  const menuItems = [
    { id: 'synthesis', icon: Grid, label: 'Synthèse IA' },
    { id: 'daily', icon: Clock, label: 'Journalier' },
    { id: 'monthly', icon: Calendar, label: 'Mensuel' },
    { id: 'consumption', icon: PieChart, label: 'Consommation' },
    { id: 'annual', icon: TrendingUp, label: 'Annuel' },
    { id: 'facilities', icon: Hospital, label: 'Structures' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <aside className={`fixed left-0 top-0 h-full w-64 p-6 flex flex-col border-r transition-all z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} hidden lg:flex`}>
        <div className="flex items-center gap-3 mb-10">
          <Logo size="sm" />
          <h1 className="text-lg font-black tracking-tight uppercase leading-none">HémoStats <span className="text-red-600">CI</span></h1>
        </div>

        <nav className="space-y-1 flex-1">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)} 
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-red-600 text-white shadow-xl shadow-red-600/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} /> 
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700">
           <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
             {darkMode ? <Sun size={18} /> : <Moon size={18} />}
             <span className="text-[10px] font-black uppercase tracking-widest">{darkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
           </button>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors">
             <LogOut size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest">Déconnexion</span>
           </button>
        </div>
      </aside>

      <main className="lg:ml-64 p-4 lg:p-8">
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
              {menuItems.find(i => i.id === activeTab)?.label}
              {activeTab === 'daily' && <span className="text-sm bg-blue-600 text-white px-2 py-0.5 rounded-md">Live</span>}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600/10 text-red-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border border-red-600/20"><MapPin size={12} /> {selectedSiteName}</div>
              <div className="flex items-center gap-2 bg-blue-600/10 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border border-blue-600/20"><Calendar size={12} /> {selectedDay} {selectedMonth} {selectedYear}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="flex items-center gap-2 px-3 py-1.5">
                <Filter size={14} className="text-slate-400" />
                <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-black uppercase cursor-pointer">
                  {DAYS.map(d => <option key={d} value={d.padStart(2, '0')}>{d.padStart(2, '0')}</option>)}
                </select>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-black uppercase cursor-pointer">
                  {MONTHS.map(m => <option key={m} value={m}>{m.substring(0, 3)}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-black uppercase cursor-pointer">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
             </div>

             <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>

             <div className="flex items-center gap-2 px-3 py-1.5">
                <Globe size={14} className="text-red-600" />
                <select value={selectedSiteName} onChange={(e) => setSelectedSiteName(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-black uppercase cursor-pointer min-w-[140px]">
                  <option value="TOUS LES SITES">TOUS LES SITES</option>
                  {dynamicSites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

             <button onClick={syncWithSheet} disabled={isSyncing} className={`p-2 rounded-xl transition-all ${isSyncing ? 'bg-slate-100' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-green-600'}`}>
               <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
             </button>
          </div>
        </header>

        {/* Synthèse KPI dynamique pour toutes les vues */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {[
            { label: 'Unités Distribuées', val: stats.total, icon: Database, color: 'text-red-600', bg: 'bg-red-600/10' },
            { label: 'Poches Rendues', val: stats.rendu, icon: RotateCcw, color: 'text-purple-600', bg: 'bg-purple-600/10' },
            { label: 'Établissements', val: stats.facilities, icon: Hospital, color: 'text-blue-600', bg: 'bg-blue-600/10' },
            { label: 'Types Produits', val: stats.products, icon: Package, color: 'text-amber-600', bg: 'bg-amber-600/10' },
            { label: 'Concentrés (CGR)', val: stats.cgr, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-600/10' }
          ].map((s, i) => (
            <div key={i} className={`p-6 rounded-3xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 shadow-lg shadow-black/20' : 'bg-white border-slate-100 shadow-sm'}`}>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-black tracking-tighter tabular-nums">{s.val.toLocaleString()}</div>
                <div className={`p-3 rounded-2xl ${s.bg} ${s.color}`}><s.icon size={20} /></div>
              </div>
            </div>
          ))}
        </section>

        <div className="space-y-10">
          {currentDisplayData.length > 0 || activeTab === 'annual' || activeTab === 'consumption' ? (
            <div className={`grid grid-cols-1 ${activeTab === 'synthesis' ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
              <div className={activeTab === 'synthesis' ? 'lg:col-span-2 space-y-10' : 'space-y-10'}>
                {activeTab === 'annual' ? (
                  <AnnualCharts data={annualTrendData} darkMode={darkMode} siteName={selectedSiteName} />
                ) : activeTab === 'facilities' ? (
                  <FacilityView data={currentDisplayData} darkMode={darkMode} />
                ) : activeTab === 'consumption' ? (
                  <ConsumptionAnalytics data={customData || []} darkMode={darkMode} />
                ) : activeTab === 'synthesis' ? (
                  <SiteSynthesis 
                    data={currentDisplayData} 
                    darkMode={darkMode} 
                    month={selectedMonth} 
                    year={selectedYear} 
                  />
                ) : (
                  <>
                    {/* Vue Journalière avec le Pulse Goutte de Sang */}
                    {activeTab === 'daily' && (
                      <div className={`mb-10 p-8 rounded-[40px] border relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl shadow-red-500/5'}`}>
                        <div className="relative z-10 flex-1">
                          <h3 className="text-xl font-black uppercase tracking-tighter mb-2 flex items-center gap-2 text-red-600">
                             <Droplet size={24} /> Moniteur Live Distribution
                          </h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6">Analyse flux temps-réel du {selectedDay}/{selMonthIdx + 1}/{selectedYear}</p>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 rounded-2xl bg-red-600/5 border border-red-500/10">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Activité Site</p>
                               <p className="text-2xl font-black tabular-nums text-red-600">{stats.total}</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-indigo-600/5 border border-indigo-500/10">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total National (Mois)</p>
                               <p className="text-2xl font-black tabular-nums text-indigo-600">{(customData || []).filter(r => r.monthIdx === selMonthIdx && r.year === selYearNum).reduce((s, r) => s + r.total, 0).toLocaleString()}</p>
                             </div>
                          </div>
                        </div>

                        {/* LE PULSE GOUTTE DE SANG QUI SE RECHARGE */}
                        <div className="relative w-48 h-64 flex items-center justify-center">
                           <div className="absolute inset-0 bg-red-600/5 rounded-full blur-3xl"></div>
                           <svg viewBox="0 0 100 120" className="w-32 h-40 drop-shadow-2xl relative z-10">
                              <defs>
                                <clipPath id="bloodClip">
                                  <path d="M50 5C50 5 85 45 85 75C85 94.33 69.33 110 50 110C30.67 110 15 94.33 15 75C15 45 50 5 50 5Z" />
                                </clipPath>
                              </defs>
                              {/* Background Goutte (Vide) */}
                              <path d="M50 5C50 5 85 45 85 75C85 94.33 69.33 110 50 110C30.67 110 15 94.33 15 75C15 45 50 5 50 5Z" fill="#FEE2E2" />
                              {/* Remplissage animé */}
                              <g clipPath="url(#bloodClip)">
                                <rect x="0" y="0" width="100" height="120" fill="#E11D48" className="animate-blood-refill" style={{ transformOrigin: 'bottom' }} />
                              </g>
                              {/* Contour */}
                              <path d="M50 5C50 5 85 45 85 75C85 94.33 69.33 110 50 110C30.67 110 15 94.33 15 75C15 45 50 5 50 5Z" fill="none" stroke="#E11D48" strokeWidth="2" />
                           </svg>
                           <div className="absolute bottom-4 text-center">
                              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest animate-pulse">Syncing...</span>
                           </div>
                        </div>
                      </div>
                    )}

                    <DataCharts data={currentDisplayData} title={selectedSiteName} darkMode={darkMode} />
                    <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Table size={16} className="text-red-600" /> Registre de Distribution</h3>
                      <DistributionTable data={currentDisplayData} darkMode={darkMode} />
                    </div>
                  </>
                )}
              </div>
              
              {activeTab === 'synthesis' && (
                <div className="space-y-8">
                  <GeminiInsights 
                    data={{ 
                      monthlySite: currentDisplayData, 
                      monthlyNational: customData || [], 
                      metadata: { 
                        site: selectedSiteName,
                        date: `${selectedDay}/${selMonthIdx + 1}/${selectedYear}`,
                        month: selectedMonth
                      } 
                    } as any} 
                    currentView={activeTab} 
                    darkMode={darkMode} 
                  />
                </div>
              )}
            </div>
          ) : (
            <div className={`p-20 flex flex-col items-center justify-center rounded-[40px] border border-dashed ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-6 rounded-full mb-6">
                <SearchX size={54} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Pas de données détectées</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] max-w-xs text-center leading-relaxed">
                Aucun enregistrement pour le <span className="text-red-600">{selectedDay}/{selMonthIdx + 1}/{selectedYear}</span>. Essayez une autre date ou synchronisez.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <button onClick={() => { setActiveTab('monthly'); }} className="px-8 py-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform shadow-lg">Voir le mois</button>
                <button onClick={syncWithSheet} className="px-8 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Forcer Sync</button>
              </div>
            </div>
          )}
        </div>

        {lastSync && (
          <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-right-10">
             <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border-l-4 border-l-green-500">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sync CNTSCI : {lastSync}</span>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
