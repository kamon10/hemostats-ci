
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
  RotateCcw
} from 'lucide-react';
import { INITIAL_DATA, BLOOD_GROUPS, AVAILABLE_SITES, GET_DATA_FOR_SITE, MONTHS, PRODUCT_TYPES, DAYS, YEARS } from './constants';
import DistributionTable from './components/DistributionTable';
import DataCharts from './components/DataCharts';
import GeminiInsights from './components/GeminiInsights';
import FacilityView from './components/FacilityView';
import AnnualCharts from './components/AnnualCharts';
import SiteSynthesis from './components/SiteSynthesis';
import DetailedSynthesis from './components/DetailedSynthesis';
import Login from './components/Login';
import Logo from './components/Logo';
import { DistributionData, DistributionRow, BloodGroup, ProductType, MonthlyTrend } from './types';

// LIEN DU FICHIER GOOGLE SHEET INTÉGRÉ DIRECTEMENT
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
  const [user, setUser] = useState<{name: string} | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  
  const [selectedSiteName, setSelectedSiteName] = useState<string>('TOUS LES SITES');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('Janvier');
  const [selectedDay, setSelectedDay] = useState<string>('01');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'annual' | 'facilities' | 'synthesis' | 'site_synthesis' | 'product_synthesis' | 'rendu_synthesis' | 'ai_analysis'>('synthesis');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customData, setCustomData] = useState<DistributionRowExtended[] | null>(null);
  const [importStats, setImportStats] = useState<{count: number, date: string, source: 'file' | 'link', error?: string} | null>(null);
  const [sheetUrl] = useState<string>(HARDCODED_SHEET_URL);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [availableSitesInImport, setAvailableSitesInImport] = useState<string[]>([]);
  
  const siteId = useMemo(() => AVAILABLE_SITES.find(s => s.name === selectedSiteName)?.id || 'treichville', [selectedSiteName]);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    const userData = { name: username };
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

  // Agrégation des mock data pour "TOUS LES SITES"
  const nationalMockData = useMemo(() => {
    const allData: DistributionRowExtended[] = [];
    const monthlyNationalRows: DistributionRow[] = [];
    
    AVAILABLE_SITES.forEach(site => {
      const sData = GET_DATA_FOR_SITE(site.id, selectedMonth, selectedDay, selectedYear);
      const rows = activeTab === 'daily' ? sData.dailySite : sData.monthlySite;
      rows.forEach(r => {
        allData.push({
          ...r,
          site: site.name,
          facility: r.facility || 'Hôpital Principal'
        });
      });
      // On prend une partie pour le nationalSummary de Gemini
      monthlyNationalRows.push(...sData.monthlySite);
    });

    return {
      daily: allData,
      monthly: allData,
      summary: monthlyNationalRows,
      metadata: {
        date: `${selectedDay}/${(MONTHS.indexOf(selectedMonth)+1).toString().padStart(2, '0')}/${selectedYear}`,
        month: selectedMonth.toUpperCase(),
        site: 'TOUS LES SITES',
        siteId: 'all'
      }
    };
  }, [selectedMonth, selectedDay, selectedYear, activeTab]);

  const mockData = useMemo(() => {
    if (selectedSiteName === 'TOUS LES SITES') {
      return {
        dailySite: nationalMockData.daily,
        monthlySite: nationalMockData.monthly,
        monthlyNational: nationalMockData.summary,
        metadata: nationalMockData.metadata,
        annualTrend: [] // Géré séparément
      } as DistributionData;
    }
    return GET_DATA_FOR_SITE(siteId, selectedMonth, selectedDay, selectedYear);
  }, [selectedSiteName, siteId, selectedMonth, selectedDay, selectedYear, nationalMockData]);

  const filteredData = useMemo(() => {
    if (customData) {
      let data = customData;
      if (selectedSiteName !== 'TOUS LES SITES') {
        data = data.filter(row => row.site === selectedSiteName);
      }
      
      if (activeTab === 'daily') {
        const targetDate = `${selectedDay.padStart(2, '0')}/${(MONTHS.indexOf(selectedMonth) + 1).toString().padStart(2, '0')}/${selectedYear}`;
        data = data.filter(row => row.date === targetDate);
      } else if (['monthly', 'synthesis', 'facilities', 'site_synthesis', 'product_synthesis', 'rendu_synthesis', 'ai_analysis'].includes(activeTab)) {
        data = data.filter(row => row.month === selectedMonth && row.year === selectedYear);
      } else if (activeTab === 'annual') {
        data = data.filter(row => row.year === selectedYear);
      }
      
      if (selectedFacility !== 'ALL' && !['site_synthesis', 'product_synthesis', 'rendu_synthesis'].includes(activeTab)) {
        data = data.filter(row => row.facility === selectedFacility);
      }
      return data;
    }
    
    let base = activeTab === 'daily' ? mockData.dailySite : mockData.monthlySite;
    if (selectedFacility !== 'ALL' && !['site_synthesis', 'product_synthesis', 'rendu_synthesis'].includes(activeTab)) {
      base = base.filter(row => row.facility === selectedFacility);
    }
    return base;
  }, [activeTab, customData, mockData, selectedSiteName, selectedFacility, selectedDay, selectedMonth, selectedYear]);

  // CALCULS RÉELS DES TOTAUX ET POURCENTAGES
  const statsTotals = useMemo(() => {
    const totalDist = filteredData.reduce((acc, row) => acc + row.total, 0);
    const totalRendu = filteredData.reduce((acc, row) => acc + (row.Bd_rendu || 0), 0);
    const plasmaDist = filteredData
      .filter(r => r.productType.toUpperCase().includes('PLASMA'))
      .reduce((acc, row) => acc + row.total, 0);
    const plaquettesDist = filteredData
      .filter(r => r.productType.toUpperCase().includes('PLAQUETTES'))
      .reduce((acc, row) => acc + row.total, 0);
    const cgrDist = filteredData
      .filter(r => r.productType.toUpperCase().includes('CGR'))
      .reduce((acc, row) => acc + row.total, 0);

    const calcPct = (val: number) => totalDist > 0 ? Math.round((val / totalDist) * 100) : 0;

    return { 
      totalDist, 
      totalRendu,
      plasmaDist, plasmaPct: calcPct(plasmaDist),
      plaquettesDist, plaquettesPct: calcPct(plaquettesDist),
      cgrDist, cgrPct: calcPct(cgrDist)
    };
  }, [filteredData]);

  const siteSynthesisData = useMemo(() => {
    const sourceData = customData 
      ? customData.filter(row => row.month === selectedMonth && row.year === selectedYear)
      : AVAILABLE_SITES.map(site => {
          const siteData = GET_DATA_FOR_SITE(site.id, selectedMonth, selectedDay, selectedYear);
          return siteData.monthlySite.map(r => ({ ...r, site: site.name } as DistributionRowExtended));
        }).flat();

    const aggregation: Record<string, Record<BloodGroup, number> & { total: number, Bd_rendu: number }> = {};
    
    sourceData.forEach(row => {
      if (!aggregation[row.site]) {
        aggregation[row.site] = {
          total: 0,
          Bd_rendu: 0,
          ...BLOOD_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<BloodGroup, number>)
        };
      }
      BLOOD_GROUPS.forEach(g => {
        aggregation[row.site][g] += row.counts[g] || 0;
      });
      aggregation[row.site].total += row.total;
      aggregation[row.site].Bd_rendu += (row.Bd_rendu || 0);
    });

    return Object.entries(aggregation).map(([site, counts]) => ({ site, ...counts }));
  }, [customData, selectedMonth, selectedYear]);

  const detailedSynthesisData = useMemo(() => {
    const sourceData = customData 
      ? customData.filter(row => row.month === selectedMonth && row.year === selectedYear)
      : mockData.monthlySite.map(r => ({ ...r, site: selectedSiteName === 'TOUS LES SITES' ? (r as any).site : selectedSiteName } as DistributionRowExtended));

    const aggregation: Record<string, Record<string, Record<BloodGroup, number> & { total: number, Bd_rendu: number }>> = {};
    sourceData.forEach(row => {
      const s = row.site || selectedSiteName;
      if (!aggregation[s]) aggregation[s] = {};
      if (!aggregation[s][row.productType]) {
        aggregation[s][row.productType] = {
          total: 0,
          Bd_rendu: 0,
          ...BLOOD_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<BloodGroup, number>)
        };
      }
      BLOOD_GROUPS.forEach(g => aggregation[s][row.productType][g] += row.counts[g] || 0);
      aggregation[s][row.productType].total += row.total;
      aggregation[s][row.productType].Bd_rendu += (row.Bd_rendu || 0);
    });

    const results: any[] = [];
    Object.entries(aggregation).forEach(([site, products]) => {
      Object.entries(products).forEach(([product, data]) => results.push({ site, productType: product, ...data }));
    });
    return results;
  }, [customData, mockData, selectedMonth, selectedYear, selectedSiteName]);

  const filteredAnnualTrend = useMemo((): MonthlyTrend[] => {
    if (customData) {
      const yearData = customData.filter(row => 
        (selectedSiteName === 'TOUS LES SITES' || row.site === selectedSiteName) && 
        row.year === selectedYear && 
        (selectedFacility === 'ALL' || row.facility === selectedFacility)
      );
      
      return MONTHS.map(m => {
        const monthRows = yearData.filter(r => r.month === m);
        const total = monthRows.reduce((sum, r) => sum + r.total, 0);
        return {
          month: m.substring(0, 3), 
          total,
          cgr: monthRows.filter(r => r.productType.toUpperCase().includes('CGR')).reduce((sum, r) => sum + r.total, 0),
          plasma: monthRows.filter(r => r.productType.toUpperCase().includes('PLASMA')).reduce((sum, r) => sum + r.total, 0),
          plaquettes: monthRows.filter(r => r.productType.toUpperCase().includes('PLAQUETTES')).reduce((sum, r) => sum + r.total, 0),
        };
      });
    }
    
    if (selectedSiteName === 'TOUS LES SITES') {
      const aggregated: MonthlyTrend[] = MONTHS.map((m, idx) => ({
        month: m.substring(0, 3), total: 0, cgr: 0, plasma: 0, plaquettes: 0
      }));
      
      AVAILABLE_SITES.forEach(site => {
        const siteData = GET_DATA_FOR_SITE(site.id, 'Janvier', '01', selectedYear);
        siteData.annualTrend.forEach((trend, idx) => {
          aggregated[idx].total += trend.total;
          aggregated[idx].cgr += trend.cgr;
          aggregated[idx].plasma += trend.plasma;
          aggregated[idx].plaquettes += trend.plaquettes;
        });
      });
      return aggregated;
    }
    
    return mockData.annualTrend;
  }, [customData, mockData, selectedSiteName, selectedYear, selectedFacility]);

  const parseCSVData = (text: string, source: 'file' | 'link') => {
    try {
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length === 0) return false;
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const rows = lines.map(line => line.split(delimiter).map(col => col.replace(/^"|"$/g, '').trim()));
      const headers = rows[0].map(h => h.toUpperCase().trim());
      const getIdx = (name: string) => headers.indexOf(name);
      const idxNombre = getIdx('NOMBRE'), idxGroupe = getIdx('SA_GROUPE'), idxEtab = getIdx('FS_NOM'), idxProduit = getIdx('NA_LIBELLE'), idxSite = getIdx('SI_NOM COMPLET'), idxDate = headers.findIndex(h => h.includes('DATE') || h.includes('DT_DISTRIBUTION'));
      const idxRendu = headers.findIndex(h => h.includes('RENDU') || h.includes('BD_RENDU'));
      
      if (idxNombre === -1 || idxGroupe === -1) throw new Error("Colonnes 'NOMBRE' ou 'SA_GROUPE' manquantes.");
      const aggregationMap: Map<string, DistributionRowExtended> = new Map();
      const sitesSet = new Set<string>();
      rows.slice(1).forEach(cols => {
        if (cols.length <= Math.max(idxNombre, idxGroupe)) return;
        const val = Math.max(0, Math.floor(parseFloat(cols[idxNombre].replace(/\s/g, "").replace(",", "."))) || 0);
        const renduVal = idxRendu !== -1 && cols[idxRendu] ? Math.max(0, Math.floor(parseFloat(cols[idxRendu].replace(/\s/g, "").replace(",", ".")))) : 0;
        
        if (val === 0 && renduVal === 0) return;
        
        const site = idxSite !== -1 ? cols[idxSite] : "SITE INCONNU";
        const facility = idxEtab !== -1 ? cols[idxEtab] : "NON SPECIFIÉ";
        const product = idxProduit !== -1 ? cols[idxProduit] : "PRODUIT SANGUIN";
        const rawGroup = cols[idxGroupe].toUpperCase().replace(/\s/g, ""), rawDate = idxDate !== -1 ? cols[idxDate] : "";
        sitesSet.add(site);
        let rowDate = "", rowMonth = "", rowYear = "";
        if (rawDate) {
          const parts = rawDate.split(/[/ -]/);
          if (parts.length >= 3) {
            rowDate = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
            rowMonth = MONTHS[parseInt(parts[1]) - 1] || "";
            rowYear = parts[2];
          }
        }
        const key = `${site}|${facility}|${product}|${rowDate}`;
        if (!aggregationMap.has(key)) {
          aggregationMap.set(key, { site, facility, productType: product, date: rowDate, month: rowMonth, year: rowYear, counts: BLOOD_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<BloodGroup, number>), total: 0, Bd_rendu: 0 });
        }
        const entry = aggregationMap.get(key)!;
        const group = BLOOD_GROUPS.find(bg => rawGroup === bg.toUpperCase() || rawGroup.includes(bg.toUpperCase()));
        if (group) entry.counts[group] += val;
        entry.total += val;
        entry.Bd_rendu += renduVal;
      });
      const parsed = Array.from(aggregationMap.values());
      if (parsed.length > 0) {
        setCustomData(parsed); 
        const sortedSites = Array.from(sitesSet).sort();
        setAvailableSitesInImport(sortedSites); 
        setImportStats({ count: parsed.length, date: new Date().toLocaleTimeString('fr-FR'), source });
        return true;
      }
      return false;
    } catch (err: any) { setImportStats({ count: 0, date: new Date().toLocaleTimeString(), source: 'link', error: err.message }); return false; }
  };

  const fetchSheetData = async () => {
    if (!sheetUrl) return;
    setIsLoadingLink(true);
    try {
      let exportUrl = sheetUrl;
      if (sheetUrl.includes('docs.google.com/spreadsheets')) {
        const docId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
        exportUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`;
      }
      const response = await fetch(exportUrl, { cache: 'no-store' });
      const text = await response.text();
      parseCSVData(text, 'link');
    } catch (err: any) { 
      setImportStats({ count: 0, date: new Date().toLocaleTimeString(), source: 'link', error: err.message }); 
    } finally { 
      setIsLoadingLink(false); 
    }
  };

  useEffect(() => { 
    if (isAuthenticated && sheetUrl) {
      fetchSheetData(); 
    }
  }, [isAuthenticated]);

  const allSitesForSelect = useMemo(() => {
    const base = availableSitesInImport.length > 0 ? availableSitesInImport : AVAILABLE_SITES.map(s => s.name);
    return ["TOUS LES SITES", ...base];
  }, [availableSitesInImport]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (!isAuthenticated) return <Login onLogin={handleLogin} darkMode={darkMode} />;

  const navigationItems = [
    { id: 'synthesis', icon: Layers, label: 'Tableau de Bord Global' },
    { id: 'ai_analysis', icon: BrainCircuit, label: 'Analyse IA Gemini' },
    { id: 'rendu_synthesis', icon: RotateCcw, label: 'Synthèse : RENDU, TYPE PRODUIT, SITE' },
    { id: 'site_synthesis', icon: Table, label: 'Synthèse par SITE CNTSCI' },
    { id: 'product_synthesis', icon: Grid, label: 'Synthèse Produits par Site' },
    { id: 'daily', icon: Clock, label: 'Synthèse Journalière' },
    { id: 'monthly', icon: Calendar, label: 'Synthèse Mensuelle' },
    { id: 'annual', icon: CalendarDays, label: 'Synthèse Annuelle' },
    { id: 'facilities', icon: Hospital, label: 'Structures Rattachées' }
  ];

  const isNationalView = selectedSiteName === 'TOUS LES SITES';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar Responsive */}
      <aside className={`fixed left-0 top-0 h-full w-64 p-6 flex flex-col border-r transition-all duration-300 z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <h1 className="text-xl font-black tracking-tight uppercase leading-none">HémoStats <span className="text-red-600">CI</span></h1>
          </div>
          <button onClick={closeMobileMenu} className="lg:hidden p-2 text-slate-400 hover:text-red-600">
            <X size={24} />
          </button>
        </div>
        
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500"><UserIcon size={20} /></div>
          <div className="overflow-hidden">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session Active</p>
            <p className="text-xs font-bold truncate uppercase">{user?.name || 'Utilisateur'}</p>
          </div>
        </div>
        
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {navigationItems.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id as any); closeMobileMenu(); }} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-red-600 text-white shadow-xl shadow-red-600/30 font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <tab.icon size={18} /> <span className="text-[10px] uppercase tracking-widest text-left leading-tight">{tab.label}</span>
            </button>
          ))}
          <div className="my-6 h-px bg-slate-200 dark:bg-slate-700 opacity-50 mx-4"></div>
          <div className="pt-2 pb-3 px-4"><span className="uppercase text-[10px] font-black text-slate-400 tracking-[0.2em]">Source de données</span></div>
          <div className="space-y-2 px-1">
            <button 
              onClick={() => { fetchSheetData(); closeMobileMenu(); }} 
              disabled={isLoadingLink}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${importStats?.source === 'link' ? 'border-blue-500 text-blue-600 bg-blue-50/5' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
            >
              <div className="flex items-center gap-3">
                <CloudDownload size={18} />
                <span className="text-[10px] font-black uppercase tracking-wider">Sync Google Sheet</span>
              </div>
              {isLoadingLink ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            </button>
            {importStats?.date && (
              <p className="px-4 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                Dernière sync : {importStats.date}
              </p>
            )}
          </div>
        </nav>
        
        <div className="mt-auto pt-4 space-y-2">
           <button onClick={() => setDarkMode(!darkMode)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}<span className="text-[10px] font-black uppercase tracking-widest">{darkMode ? 'Mode Clair' : 'Mode Sombre'}</span></button>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors"><LogOut size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Déconnexion</span></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`transition-all duration-300 ${isMobileMenuOpen ? 'blur-sm lg:blur-none' : ''} lg:ml-64 p-4 lg:p-8 animate-in fade-in duration-700`}>
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 mb-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <h1 className="text-sm font-black tracking-tight uppercase">HémoStats <span className="text-red-600">CI</span></h1>
          </div>
          <button onClick={toggleMobileMenu} className="p-2 text-slate-500 bg-slate-100 dark:bg-slate-700 rounded-xl">
            <Menu size={20} />
          </button>
        </header>

        {/* Desktop & Mobile Main Header */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tighter uppercase mb-2">
              {activeTab === 'annual' ? 'ANALYSE ANNUELLE DES PSL' : 
               activeTab === 'daily' ? 'SYNTHÈSE JOURNALIÈRE' : 
               activeTab === 'monthly' ? 'SYNTHÈSE MENSUELLE' : 
               activeTab === 'ai_analysis' ? 'ANALYSE INTELLIGENTE GEMINI' :
               activeTab === 'site_synthesis' ? 'SYNTHÈSE NATIONALE PAR SITE CNTSCI' : 
               activeTab === 'rendu_synthesis' ? 'SYNTHÈSE : RENDU, TYPE PRODUIT, SITE' :
               activeTab === 'product_synthesis' ? 'SYNTHESE DISTRIBUTION DES PRODUITS SANGUIN PAR SITE' : 'DISTRIBUTION DES PSL'}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600/10 text-red-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-600/20"><MapPin size={12} /> {['site_synthesis', 'product_synthesis', 'rendu_synthesis', 'ai_analysis'].includes(activeTab) || selectedSiteName === 'TOUS LES SITES' ? 'NIVEAU NATIONAL' : selectedSiteName}</div>
              <div className="flex items-center gap-2 bg-blue-600/10 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/20"><Calendar size={12} /> {activeTab !== 'monthly' && activeTab !== 'annual' && !['site_synthesis', 'product_synthesis', 'rendu_synthesis', 'ai_analysis'].includes(activeTab) && `${selectedDay} `}{selectedMonth} {selectedYear}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
             {!['site_synthesis', 'product_synthesis', 'rendu_synthesis', 'ai_analysis'].includes(activeTab) && (
               <div className="w-full sm:w-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-1.5 flex items-center">
                  <div className="px-3 text-red-600" title="SÉLECTION SITE"><Globe size={16} /></div>
                  <select value={selectedSiteName} onChange={(e) => setSelectedSiteName(e.target.value)} className="w-full bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer pr-8 py-2 min-w-[150px]">{allSitesForSelect.map(s => <option key={s} value={s}>{s}</option>)}</select>
                </div>
             )}
              <div className="w-full sm:w-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-1.5 flex items-center">
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer px-3 py-2 text-blue-600">{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                {activeTab !== 'annual' && (
                  <>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer px-3 py-2">{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                  </>
                )}
                {activeTab === 'daily' && (
                  <>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer px-3 py-2">{DAYS.map(d => <option key={d} value={d}>{d.padStart(2, '0')}</option>)}</select>
                  </>
                )}
              </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Total Distribution', val: statsTotals.totalDist, pct: 100, icon: Database, color: 'text-red-600', bg: 'bg-red-600/10' },
            { label: 'Nombre de Rendu', val: statsTotals.totalRendu, pct: 0, icon: RotateCcw, color: 'text-purple-600', bg: 'bg-purple-600/10' },
            { label: 'Total CGR', val: statsTotals.cgrDist, pct: statsTotals.cgrPct, icon: Droplets, color: 'text-red-500', bg: 'bg-red-500/10' },
            { label: 'Plasma Thérapeutique', val: statsTotals.plasmaDist, pct: statsTotals.plasmaPct, icon: Target, color: 'text-yellow-600', bg: 'bg-yellow-600/10' },
            { label: 'Concentré de Plaquettes', val: statsTotals.plaquettesDist, pct: statsTotals.plaquettesPct, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' }
          ].map((s, i) => (
            <div key={i} className={`p-5 rounded-3xl border transition-all hover:scale-[1.02] relative group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}><s.icon size={20} /></div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">{s.label}</p>
                  <div className="text-xl lg:text-2xl font-black tracking-tighter flex items-baseline justify-end gap-1.5">
                    {s.val.toLocaleString('fr-FR')}
                    {s.pct > 0 && <span className="text-[10px] font-bold text-slate-400">({s.pct}%)</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {activeTab === 'annual' ? (
          <AnnualCharts data={filteredAnnualTrend} darkMode={darkMode} siteName={selectedSiteName} />
        ) : activeTab === 'facilities' ? (
          <FacilityView data={filteredData} darkMode={darkMode} />
        ) : activeTab === 'site_synthesis' ? (
          <SiteSynthesis data={siteSynthesisData} darkMode={darkMode} month={selectedMonth} year={selectedYear} />
        ) : activeTab === 'rendu_synthesis' || activeTab === 'product_synthesis' ? (
          <DetailedSynthesis data={detailedSynthesisData} darkMode={darkMode} month={selectedMonth} year={selectedYear} focusRendu={activeTab === 'rendu_synthesis'} />
        ) : activeTab === 'ai_analysis' ? (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className={`p-8 lg:p-12 rounded-[48px] border overflow-hidden relative ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200'}`}>
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <BrainCircuit size={300} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 mb-12">
                   <div className="p-5 bg-purple-500/10 rounded-[32px] animate-pulse">
                      <BrainCircuit size={48} className="text-purple-500" />
                   </div>
                   <div className="text-center md:text-left">
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Expertise Prédictive Gemini</h3>
                      <p className="text-sm font-medium text-slate-500 max-w-xl">
                        Analyse cognitive avancée de la distribution nationale pour le {selectedMonth} {selectedYear}. Notre IA identifie les schémas critiques et propose des recommandations stratégiques.
                      </p>
                   </div>
                </div>
                <GeminiInsights data={mockData} currentView="Analyse Approfondie du Réseau National" darkMode={darkMode} />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-slate-400 flex items-center gap-2">
                     <Sparkles size={14} className="text-amber-500" /> Aide à la décision
                   </h4>
                   <p className="text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-300">
                     Les insights générés sont basés sur les tendances de distribution actuelles et les écarts types observés sur l'ensemble du territoire ivoirien.
                   </p>
                </div>
                <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-slate-400 flex items-center gap-2">
                     <Target size={14} className="text-blue-500" /> Objectif National
                   </h4>
                   <p className="text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-300">
                     Optimiser le flux de PSL pour garantir un taux de satisfaction de 100% des besoins transfusionnels dans chaque district sanitaire.
                   </p>
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className={`grid grid-cols-1 ${isNationalView ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-8`}>
               <div className={`${isNationalView ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-8`}>
                 <DataCharts data={filteredData} title={`${activeTab === 'daily' ? 'Journalier' : 'Mensuel'} : ${selectedFacility === 'ALL' ? selectedSiteName : selectedFacility}`} darkMode={darkMode} />
                 <div className={`p-4 lg:p-8 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <FileSpreadsheet size={16} className="text-red-600" /> 
                      Détails Distributions ({selectedSiteName})
                    </h3>
                    <DistributionTable data={filteredData} darkMode={darkMode} />
                 </div>
               </div>
               {!isNationalView && (
                 <div className="space-y-6">
                   <GeminiInsights data={mockData} currentView={activeTab === 'daily' ? "Synthèse Journalière" : "Synthèse Mensuelle"} darkMode={darkMode} />
                 </div>
               )}
            </div>
            {isNationalView && (
              <div className="max-w-4xl mx-auto">
                <GeminiInsights data={mockData} currentView="Tableau de Bord Global National" darkMode={darkMode} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
