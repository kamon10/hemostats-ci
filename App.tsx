
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  ChevronRight, 
  Database, 
  Droplets, 
  Globe, 
  Info, 
  LayoutDashboard, 
  Moon, 
  PieChart, 
  Sun,
  TrendingUp,
  MapPin,
  Calendar, 
  Clock,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Link,
  ExternalLink,
  AlertCircle,
  Wifi,
  WifiOff,
  XCircle,
  Hospital,
  CloudDownload,
  Filter,
  CalendarDays,
  Target,
  HelpCircle,
  Package,
  Layers,
  History,
  LogOut,
  User as UserIcon,
  Table,
  Grid,
  Menu,
  X,
  BrainCircuit,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Users,
  ShieldAlert,
  Box
} from 'lucide-react';
import { INITIAL_DATA, BLOOD_GROUPS, AVAILABLE_SITES, GET_DATA_FOR_SITE, MONTHS, PRODUCT_TYPES, DAYS, YEARS } from './constants';
import DistributionTable from './components/DistributionTable';
import DataCharts from './components/DataCharts';
import GeminiInsights from './components/GeminiInsights';
import FacilityView from './components/FacilityView';
import AnnualCharts from './components/AnnualCharts';
import SiteSynthesis from './components/SiteSynthesis';
import DetailedSynthesis from './components/DetailedSynthesis';
import StockDashboard from './components/StockDashboard';
import PresProductSynthesis from './components/PresProductSynthesis';
import Login from './components/Login';
import Logo from './components/Logo';
import { DistributionData, DistributionRow, BloodGroup, ProductType, MonthlyTrend } from './types';

const HARDCODED_SHEET_URL = "https://docs.google.com/spreadsheets/d/1iHaD6NfDQ0xKJP9lhhGdNn3eakmT1qUvu-YIL7kBXWg/edit?usp=sharing";

export interface DistributionRowExtended extends DistributionRow {
  site: string;
  facility: string;
  date?: string;
  month?: string;
  year?: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [user, setUser] = useState<{name: string, role: string} | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  
  const [selectedSiteName, setSelectedSiteName] = useState<string>('TOUS LES SITES');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('Janvier');
  const [selectedDay, setSelectedDay] = useState<string>('01');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'annual' | 'facilities' | 'synthesis' | 'site_synthesis' | 'product_synthesis' | 'rendu_synthesis' | 'ai_analysis' | 'stock' | 'pres_product'>('stock');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customData, setCustomData] = useState<DistributionRowExtended[] | null>(null);

  const navigationItems = useMemo(() => [
    { id: 'stock', icon: Box, label: 'Stock & Carte Live' },
    { id: 'pres_product', icon: Layers, label: 'Synthèse : PRES / PRODUIT' },
    { id: 'synthesis', icon: Grid, label: 'Tableau de Bord Global' },
    { id: 'ai_analysis', icon: BrainCircuit, label: 'Analyse IA Gemini' },
    { id: 'rendu_synthesis', icon: RotateCcw, label: 'Synthèse : RENDU' },
    { id: 'site_synthesis', icon: Table, label: 'Synthèse par SITE' },
    { id: 'daily', icon: Clock, label: 'Journalier' },
    { id: 'monthly', icon: Calendar, label: 'Mensuel' },
    { id: 'annual', icon: CalendarDays, label: 'Annuel' },
  ], []);

  const visibleNavigationItems = useMemo(() => {
    if (!user) return [];
    return navigationItems;
  }, [user, navigationItems]);

  const siteId = useMemo(() => AVAILABLE_SITES.find(s => s.name === selectedSiteName)?.id || 'abidjan', [selectedSiteName]);

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
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  };

  const allSitesDataMap = useMemo(() => {
    const map: Record<string, DistributionData> = {};
    AVAILABLE_SITES.forEach(site => {
      map[site.id] = GET_DATA_FOR_SITE(site.id, selectedMonth, selectedDay, selectedYear);
    });
    return map;
  }, [selectedMonth, selectedDay, selectedYear]);

  const nationalMockData = useMemo(() => {
    const allData: DistributionRowExtended[] = [];
    const monthlyNationalRows: DistributionRow[] = [];
    
    let nationalCgr = 0, nationalPlasma = 0, nationalPlaquettes = 0;
    const nationalGroups: any = BLOOD_GROUPS.reduce((acc, g) => ({ ...acc, [g]: { units: 0, days: 0 } }), {});

    AVAILABLE_SITES.forEach(site => {
      const sData = allSitesDataMap[site.id];
      const rows = activeTab === 'daily' ? sData.dailySite : sData.monthlySite;
      rows.forEach(r => allData.push({ ...r, site: site.name, facility: r.facility || 'Hôpital Principal' }));
      monthlyNationalRows.push(...sData.monthlySite);
      
      if (sData.stock) {
        nationalCgr += sData.stock.cgr;
        nationalPlasma += sData.stock.plasma;
        nationalPlaquettes += sData.stock.plaquettes;
        BLOOD_GROUPS.forEach(g => {
          nationalGroups[g].units += sData.stock!.byGroup[g].units;
          nationalGroups[g].days = Math.max(nationalGroups[g].days, sData.stock!.byGroup[g].days);
        });
      }
    });

    return {
      daily: allData,
      monthly: allData,
      summary: monthlyNationalRows,
      stock: {
        cgr: nationalCgr,
        plasma: nationalPlasma,
        plaquettes: nationalPlaquettes,
        byGroup: nationalGroups
      },
      metadata: {
        date: `${selectedDay}/${(MONTHS.indexOf(selectedMonth)+1).toString().padStart(2, '0')}/${selectedYear}`,
        month: selectedMonth.toUpperCase(),
        site: 'TOUS LES SITES',
        siteId: 'all'
      }
    };
  }, [selectedMonth, selectedDay, selectedYear, activeTab, allSitesDataMap]);

  const mockData = useMemo(() => {
    if (selectedSiteName === 'TOUS LES SITES') {
      return {
        dailySite: nationalMockData.daily,
        monthlySite: nationalMockData.monthly,
        monthlyNational: nationalMockData.summary,
        metadata: nationalMockData.metadata,
        annualTrend: [],
        stock: nationalMockData.stock
      } as DistributionData;
    }
    return allSitesDataMap[siteId];
  }, [selectedSiteName, siteId, nationalMockData, allSitesDataMap]);

  const filteredData = useMemo(() => {
    if (customData) {
      let data = customData;
      if (selectedSiteName !== 'TOUS LES SITES') data = data.filter(row => row.site === selectedSiteName);
      return data;
    }
    return activeTab === 'daily' ? mockData.dailySite : mockData.monthlySite;
  }, [activeTab, customData, mockData, selectedSiteName]);

  const detailedSynthesisData = useMemo(() => {
    const sourceData = mockData.monthlySite.map(r => ({ ...r, site: selectedSiteName === 'TOUS LES SITES' ? (r as any).site : selectedSiteName } as DistributionRowExtended));
    const aggregation: Record<string, Record<string, any>> = {};
    sourceData.forEach(row => {
      const s = row.site || selectedSiteName;
      if (!aggregation[s]) aggregation[s] = {};
      if (!aggregation[s][row.productType]) aggregation[s][row.productType] = { total: 0, Bd_rendu: 0, ...BLOOD_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {}) };
      BLOOD_GROUPS.forEach(g => aggregation[s][row.productType][g] += (row.counts[g] || 0));
      aggregation[s][row.productType].total += row.total;
      aggregation[s][row.productType].Bd_rendu += (row.Bd_rendu || 0);
    });
    const results: any[] = [];
    Object.entries(aggregation).forEach(([site, products]) => Object.entries(products).forEach(([product, data]) => results.push({ site, productType: product, ...data })));
    return results;
  }, [mockData, selectedSiteName]);

  if (!isAuthenticated) return <Login onLogin={handleLogin} darkMode={darkMode} />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <aside className={`fixed left-0 top-0 h-full w-64 p-6 flex flex-col border-r transition-all duration-300 z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3"><Logo size="md" /><h1 className="text-xl font-black tracking-tight uppercase leading-none">HémoStats <span className="text-red-600">CI</span></h1></div>
        </div>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {visibleNavigationItems.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-red-600 text-white shadow-xl shadow-red-600/30 font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              <tab.icon size={18} /> <span className="text-[10px] uppercase tracking-widest text-left leading-tight">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 space-y-2">
           <button onClick={() => setDarkMode(!darkMode)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}<span className="text-[10px] font-black uppercase tracking-widest">{darkMode ? 'Mode Clair' : 'Mode Sombre'}</span></button>
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors" onClick={handleLogout}><LogOut size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Déconnexion</span></button>
        </div>
      </aside>

      <main className={`transition-all duration-300 lg:ml-64 p-4 lg:p-8`}>
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tighter uppercase mb-2">
              {activeTab === 'stock' ? 'DISPONIBILITÉ DES PSL' : activeTab.replace('_', ' ').toUpperCase()}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600/10 text-red-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border border-red-600/20"><MapPin size={12} /> {selectedSiteName}</div>
              <div className="flex items-center gap-2 bg-blue-600/10 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border border-blue-600/20"><Calendar size={12} /> {selectedMonth} {selectedYear}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
             <div className="w-full sm:w-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-1.5 flex items-center">
                <Globe size={16} className="text-red-600 ml-2" />
                <select value={selectedSiteName} onChange={(e) => setSelectedSiteName(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer pr-8 py-2 min-w-[150px]">
                  <option value="TOUS LES SITES">TOUS LES SITES</option>
                  {AVAILABLE_SITES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
          </div>
        </header>

        {activeTab === 'stock' ? (
          <StockDashboard data={mockData} allSitesData={allSitesDataMap} darkMode={darkMode} onSiteSelect={(name) => setSelectedSiteName(name)} />
        ) : activeTab === 'pres_product' ? (
          <PresProductSynthesis data={nationalMockData.summary} darkMode={darkMode} month={selectedMonth} year={selectedYear} />
        ) : activeTab === 'annual' ? (
          <AnnualCharts data={mockData.annualTrend} darkMode={darkMode} siteName={selectedSiteName} />
        ) : activeTab === 'site_synthesis' ? (
          <SiteSynthesis data={[]} darkMode={darkMode} month={selectedMonth} year={selectedYear} />
        ) : (
          <div className="space-y-8">
            <DataCharts data={filteredData} title={`${selectedSiteName}`} darkMode={darkMode} />
            <div className={`p-4 lg:p-8 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                <DistributionTable data={filteredData} darkMode={darkMode} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
