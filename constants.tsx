
import { DistributionData, BloodGroup, ProductType, SiteInfo, DistributionRow, MonthlyTrend } from './types';

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

export const YEARS = ['2023', '2024', '2025', '2026'];

export const AVAILABLE_SITES: SiteInfo[] = [
  { 
    id: 'treichville', 
    name: 'CRTS TREICHVILLE', 
    region: 'Abidjan',
    facilities: ['CHU de Treichville', 'Hôpital Militaire d\'Abidjan', 'Polyclinique PISAM', 'CHU de Cocody'],
    coords: { x: 70, y: 85 }
  },
  { 
    id: 'bouake', 
    name: 'CRTS BOUAKE', 
    region: 'Gbêkê',
    facilities: ['CHU de Bouaké', 'Hôpital de Zone'],
    coords: { x: 55, y: 45 }
  },
  { 
    id: 'korhogo', 
    name: 'CRTS KORHOGO', 
    region: 'Poro',
    facilities: ['CHR Korhogo'],
    coords: { x: 45, y: 15 }
  },
  { 
    id: 'san-pedro', 
    name: 'CRTS SAN PEDRO', 
    region: 'San-Pédro',
    facilities: ['CHR San-Pédro'],
    coords: { x: 25, y: 88 }
  },
  { 
    id: 'daloa', 
    name: 'CRTS DALOA', 
    region: 'Haut-Sassandra',
    facilities: ['CHR Daloa'],
    coords: { x: 35, y: 55 }
  },
  { 
    id: 'yamoussoukro', 
    name: 'CRTS YAMOUSSOUKRO', 
    region: 'Bélier',
    facilities: ['CHR Yamoussoukro', 'Moscati'],
    coords: { x: 50, y: 65 }
  }
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
        rows.push({ 
          productType: type, 
          facility: facility,
          counts, 
          total 
        });
      });
    });
    return rows;
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
    monthlyNational: [
      { productType: 'CGR ADULTE', counts: { 'A+': 803, 'A-': 45, 'AB+': 129, 'AB-': 8, 'B+': 915, 'B-': 79, 'O+': 1902, 'O-': 141 }, total: 4022 },
      { productType: 'CGR PEDIATRIQUE', counts: { 'A+': 964, 'A-': 82, 'AB+': 177, 'AB-': 15, 'B+': 1050, 'B-': 93, 'O+': 2050, 'O-': 189 }, total: 4620 },
    ],
    annualTrend: annualTrend
  };
};

export const GET_DATA_FOR_SITE = (siteId: string, month: string = 'Janvier', day: string = '01', year: string = '2025'): DistributionData => {
  const site = AVAILABLE_SITES.find(s => s.id === siteId) || AVAILABLE_SITES[0];
  return generateMockDataForSite(site, month, day, year);
};

export const INITIAL_DATA: DistributionData = GET_DATA_FOR_SITE('treichville');