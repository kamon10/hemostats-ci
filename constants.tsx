
import { DistributionData, BloodGroup, ProductType, SiteInfo, DistributionRow, MonthlyTrend, StockInfo } from './types';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'AB+', 'AB-' , 'B+', 'B-', 'O+', 'O-'];
export const PRODUCT_TYPES: ProductType[] = [
  'CGR ADULTE',
  'CGR PEDIATRIQUE',
  'CGR NOURRISON',
  'CONCENTRE DE PLAQUETTES',
  'PLASMA A USAGE THERAPEUTIQUE'
];

export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export const YEARS = ['2025', '2026', '2027', '2028'];

// Coordonnées ajustées pour la carte détaillée 800x900
export const AVAILABLE_SITES: SiteInfo[] = [
  { id: 'abidjan', name: 'POLE ABIDJAN', region: 'PRES ABIDJAN', coords: { x: 550, y: 780 } },
  { id: 'bouake', name: 'POLE BOUAKE', region: 'PRES GBEKE', coords: { x: 480, y: 380 } },
  { id: 'daloa', name: 'POLE DALOA', region: 'PRES HAUT SASSANDRA', coords: { x: 320, y: 480 } },
  { id: 'korhogo', name: 'POLE KORHOGO', region: 'PRES PORO', coords: { x: 380, y: 150 } },
  { id: 'san-pedro', name: 'POLE SAN-PEDRO', region: 'PRES SAN-PEDRO', coords: { x: 280, y: 780 } },
  { id: 'man', name: 'POLE MAN', region: 'PRES TONPKI', coords: { x: 180, y: 450 } },
  { id: 'odienne', name: 'POLE ODIENNE', region: 'PRES KABADOUGOU', coords: { x: 180, y: 200 } },
  { id: 'bondoukou', name: 'POLE BONDOUKOU', region: 'PRES GONTOUGO', coords: { x: 650, y: 320 } },
  { id: 'abengourou', name: 'POLE ABENGOUROU', region: 'PRES INDENIE DJUABLIN', coords: { x: 620, y: 550 } }
];

const generateRandomCounts = (seed: number, multiplier: number) => {
  const counts: any = {};
  BLOOD_GROUPS.forEach((group, idx) => {
    const val = Math.floor(((seed * (idx + 1)) % 15) * multiplier);
    counts[group] = group === 'O+' ? val * 3 : (group.includes('-') ? Math.floor(val / 4) : val);
  });
  return counts;
};

const generateMockDataForSite = (site: SiteInfo, month: string, day: string, year: string): DistributionData => {
  const siteSeed = site.id.length;
  const monthIdx = MONTHS.indexOf(month) + 1;
  const dayVal = parseInt(day);
  const yearVal = parseInt(year);
  const combinedSeed = siteSeed + monthIdx + dayVal + yearVal;

  const createRows = (mult: number): DistributionRow[] => {
    const rows: DistributionRow[] = [];
    const facilities = site.facilities || ['Hôpital Principal'];
    
    facilities.forEach((facility, fIdx) => {
      PRODUCT_TYPES.slice(0, 3).forEach((type, pIdx) => {
        const counts = generateRandomCounts(combinedSeed + fIdx + pIdx, mult);
        const total = Object.values(counts).reduce((a: any, b: any) => a + (b as number), 0) as number;
        const Bd_rendu = Math.floor(total * 0.05 * (combinedSeed % 10) / 10);
        
        rows.push({ productType: type, facility: facility, counts, total, Bd_rendu });
      });
    });
    return rows;
  };

  const stock: StockInfo = {
    cgr: 500 + (combinedSeed * 13 % 2000),
    plasma: 100 + (combinedSeed * 7 % 400),
    plaquettes: 20 + (combinedSeed * 5 % 80),
    byGroup: BLOOD_GROUPS.reduce((acc, g, idx) => {
      const units = 50 + (combinedSeed * (idx + 11) % 400);
      const days = 4 + (idx % 12);
      return { ...acc, [g]: { units, days } };
    }, {} as any)
  };

  const annualTrend: MonthlyTrend[] = MONTHS.map((m, idx) => {
    const mSeed = siteSeed + idx + yearVal;
    const base = 500 + (mSeed % 10) * 50;
    return {
      month: m.substring(0, 3),
      total: base,
      cgr: Math.floor(base * 0.6),
      plasma: Math.floor(base * 0.25),
      plaquettes: Math.floor(base * 0.15)
    };
  });

  return {
    metadata: {
      date: `${day.padStart(2, '0')}/${monthIdx.toString().padStart(2, '0')}/${year}`,
      month: month.toUpperCase(),
      site: site.name,
      siteId: site.id
    },
    dailySite: createRows(0.3),
    monthlySite: createRows(2),
    monthlyNational: [],
    annualTrend: annualTrend,
    stock: stock
  };
};

export const GET_DATA_FOR_SITE = (siteId: string, month: string = 'Janvier', day: string = '01', year: string = '2026'): DistributionData => {
  const site = AVAILABLE_SITES.find(s => s.id === siteId) || AVAILABLE_SITES[0];
  return generateMockDataForSite(site, month, day, year);
};

export const INITIAL_DATA: DistributionData = GET_DATA_FOR_SITE('abidjan');
